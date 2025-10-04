import { Component, computed, inject, signal, Signal } from '@angular/core';
import {AlertsService, CommonService, IAService} from "@core/services";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";
import {
  AreaChartInterface, AreaSplineChartInterface,
  MapChartInterface, PieChartInterface,
  SankeyChartInterface
} from "@core/interfaces";
import {AreaComponent} from "@shared/components/graphs/area/area.component";
import {MatButtonToggle, MatButtonToggleGroup} from "@angular/material/button-toggle";
import {MatCard, MatCardContent} from "@angular/material/card";
import {SankeyComponent} from "@shared/components/graphs/sankey/sankey.component";
import {WorldMapComponent} from "@shared/components/graphs/world-map/world-map.component";
import {CommonModule, DatePipe} from "@angular/common";
import {CircleProgressOptions, NgCircleProgressModule} from "ng-circle-progress";
import {NumbersPipe} from "@shared/pipes/numbers.pipe";
import {RoundPipe} from "@shared/pipes/round.pipe";
import {ToLowerCasePipe} from "@shared/pipes/to-lower-case.pipe";
import {AreasplineComponent} from "@shared/components/graphs/areaspline/areaspline.component";
import {PieComponent} from "@shared/components/graphs/pie/pie.component";
import { MatIconModule} from "@angular/material/icon";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {BarComponent} from "@shared/components/graphs/bar/bar.component";
import {BarChartInterface} from "@core/interfaces/charts/bar-chart.interface";
import {forkJoin, map, switchMap} from "rxjs";
import {Point, Series} from "highcharts";
import {TimeSelectorComponent} from "@shared/components/time-selector/time-selector.component";
import {MatTooltipModule} from "@angular/material/tooltip";
import {Router} from "@angular/router";
import {RoleService} from "@core/services/role.service";
import {formatAreaSpline, formatPieAndColumn, formatSankey} from "@core/utils/graph-formater.util";

interface IaStatsInterface {
  stats_type: string,
  average_fps: number,
  current_fps: number,
  max_fps: number,
  started_at: Date,
  progress: number,
  processed: number,
  dropped: number,
  error: number,
  status: string,
  timestamp: string
}

const riskLevels = {
  '1': 'Low Deviance',
  '2': 'Medium Deviance',
  '3': 'High Deviance',
  '4': 'Critical Deviance'
};

@Component({
    selector: 'app-overview',
    imports: [
        AreaComponent,
        MatButtonToggle,
        MatButtonToggleGroup,
        MatCard,
        MatCardContent,
        SankeyComponent,
        WorldMapComponent,
        DatePipe,
        NgCircleProgressModule,
        NumbersPipe,
        RoundPipe,
        AreasplineComponent,
        PieComponent,
        BarComponent,
        TimeSelectorComponent,
        MatIconModule,
        CommonModule,
        MatTooltipModule
    ],
    providers: [
        (NgCircleProgressModule.forRoot({})).providers!,
        ToLowerCasePipe,
        NumbersPipe,
        RoundPipe
    ],
    templateUrl: './overview.component.html',
    styleUrl: './overview.component.scss',
    animations: [
        trigger('collapseExpand', [
            state('collapsed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
            state('expanded', style({ height: '*', opacity: 1 })),
            transition('collapsed <=> expanded', animate('300ms ease-in-out')),
        ]),
    ]
})
export class OverviewComponent {

  // Circle progress bar initialisation
  options = new CircleProgressOptions();

  // Injection des services
  private _alertsService= inject(AlertsService);
  private _commonService= inject(CommonService);
  private _iaService= inject(IAService);
  private _router = inject(Router)
  protected _role = inject(RoleService)

  // Initialisation des variables
  currentMapType= signal('src');
  currentTime= signal(24);
  currentBeginDate = signal(undefined);
  currentEndDate = signal(undefined);
  readonly noDataArray = Array(5).fill(0);

  title = 'Main Overview';

  //Option du bloc time filter
  timeFilterOptions = [
    { value: 1, label: 'Last hour' },
    { value: 12, label: 'Last 12H' },
    { value: 24, label: 'Last 24H' },
    { value: 'Custom', label: 'Custom' }
  ];

  //Option du bloc map filter
  originOptions = [
    { value: 'src', label: 'source' },
    { value: 'dest', label: 'destination' }
  ];

  // Map data
  alertsSource= toSignal(toObservable(computed(() => ({
    mapType: this.currentMapType(),
    interval: this.currentTime(),
    beginDate: this.currentBeginDate(),
    endDate: this.currentEndDate()
  }))).pipe(
    switchMap(({ mapType, interval, beginDate , endDate }) => {
      const begin = beginDate ? this._commonService.convertDateToString(beginDate): undefined;
      const end = endDate ? this._commonService.convertDateToString(endDate): undefined;

      return this._alertsService.getWorldMapSourceData(mapType, interval, begin, end);
    })
  ));

  //Map graph
  readonly alertsMapChartOptions= computed<MapChartInterface>(() => {
    let color;
    if (this.currentMapType() === 'src' ){
      color = '#33FFBD'
    } else {
      color = '#ff886a'
    }

    return {
      title: '',
      color: color,
      hoverColor: '#000',
      label: 'alerts',
      data: this.alertsSource(),
      height: '300px',
      backgroundColor: '#1F1F1F',
    }
  })

  //Line graph data
  alertLine= toSignal(toObservable(computed(() => ({interval: this.currentTime(), beginDate: this.currentBeginDate(), endDate: this.currentEndDate()}))).pipe(
    switchMap(({ interval, beginDate, endDate}) => {
      const begin = beginDate ? this._commonService.convertDateToString(beginDate): undefined;
      const end = endDate ? this._commonService.convertDateToString(endDate): undefined;

      return this._alertsService.getAlertsData(interval, begin, end)
    })
  ));

  //Line graph
  readonly alertsLineGraphOptions= computed<AreaChartInterface>(() => ({
    title: undefined,
    yAxisLabel: 'Alerts',
    data: this.alertLine(),
    lineColor: '#7B5DFF',
    height: 302,
    backgroundColor:'#1F1F1F',
    labelColor: '#C5C4BE',
    yLabelColor: '#C5C4BE',
    xLabelColor: '#C5C4BE',
    gridLineColor: '#C5C4BE',
    gridLineDashStyle: 'Dot',
    legendLabelColor: '#C5C4BE'
  }))

  //Pie graph data
  alertsSevPie = toSignal(
    toObservable(
      computed(() => ({
        interval: this.currentTime(),
        beginDate: this.currentBeginDate(),
        endDate: this.currentEndDate()
      }))
    ).pipe(
      switchMap(({ interval, beginDate, endDate }) => {
        const begin = beginDate ? this._commonService.convertDateToString(beginDate) : undefined;
        const end = endDate ? this._commonService.convertDateToString(endDate) : undefined;

        return this._alertsService.getAlertBySevCount(interval, begin, end).pipe(
          map(alerts =>
            formatPieAndColumn(alerts)
              .map(alert => ({
                ...alert,
                name: `Severity ${alert.name}`
              }))
              .sort((a, b) => a.name.localeCompare(b.name))
          )
        );
      })
    )
  );

  //Pie graph
  readonly alertsBySevPie = computed<PieChartInterface>(() => {
    const data = this.alertsSevPie();
    let total = data && data.length > 0
      ? data.reduce((sum, item) => sum + (item.y || 0), 0)
      : '';

    return {
      data: data,
      height: '297px',
      colors: ['#F44949', '#FF6633', '#F89200'],
      label: 'Severity : Alerts',
      backgroundColor: '#1F1F1F',
      innerSize: '85%',
      subtitle: {
        useHTML: true,
        text: total.toString(),
        floating: true,
        verticalAlign: 'middle',
        x: -75,
        y: 25,
        style: {
          color: 'white',
          fontSize: '28px'
        }
      },
      legendOption: {
        enabled: true,
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
        itemStyle: {
          color: 'white'
        },
        itemMarginBottom: 20,
        padding: 10,
        labelFormatter: function (this: Point | Series): string {
          if ('y' in this && 'name' in this) {
            return `${this.name}: ${this.y}`;
          }
          return '';
        }
      },
      dataLabelsOption: { enabled: false },
    };
  });

  //Sankey graph data
  alertsSourceIp= toSignal(toObservable(computed(() => ({interval: this.currentTime(), beginDate: this.currentBeginDate(), endDate: this.currentEndDate()}))).pipe(
    switchMap(({ interval, beginDate, endDate}) => {
      const begin = beginDate ? this._commonService.convertDateToString(beginDate) : undefined;
      const end = endDate ? this._commonService.convertDateToString(endDate) : undefined;

      return this._alertsService.getSankeySrcIp(interval, begin, end)
    })
  ));

  //Sankey graph
  readonly alertsSankeyChartOptions = computed<SankeyChartInterface>(() => {
    const raw = this.alertsSourceIp();

    return {
      title: undefined,
      data: raw ? formatSankey(raw) : [],
      colors: this._commonService.chartsColors,
      label: 'Requests',
      height: '222px',
      backgroundColor: '#1F1F1F'
    };
  });

  // Bar graph data
  alertsTop10SourceIp = toSignal(toObservable(computed(() => ({interval: this.currentTime(), beginDate: this.currentBeginDate(), endDate: this.currentEndDate()}))).pipe(
    switchMap(({ interval, beginDate, endDate}) => {
      const begin = beginDate ? this._commonService.convertDateToString(beginDate) : undefined;
      const end = endDate ? this._commonService.convertDateToString(endDate) : undefined;

      return this._alertsService.getTop10IpSource2(interval, begin, end).pipe(map(data => formatPieAndColumn(data)))
    })
  ));

  readonly alertsTop10IpSrc= computed<BarChartInterface>(() => ({
    title: undefined,
    data: this.alertsTop10SourceIp(),
    color: "#8569FE",
    height:'222px',
    borderRadius: '20%',
    backgroundColor: '#1F1F1F',
    labelColor: '#C5C4BE',
    yLabelColor: '#C5C4BE',
    xLabelColor: '#C5C4BE',
    gridLineColor: '#C5C4BE',
    gridLineDashStyle: 'Dot',
    legendLabelColor: '#C5C4BE',
    tickColor: '#C5C4BE',
    lineColor: '#C5C4BE',
  }))

  // PARTIE AI

  //Récupérer les statistiques AI
  readonly iaStats: Signal<IaStatsInterface | null> = toSignal(this._iaService.getIaStats());
  //Arespline graph data - Anomalies
  abnormalTrafficDetection = toSignal(toObservable(computed(() => ({interval: this.currentTime(), beginDate: this.currentBeginDate(), endDate: this.currentEndDate()}))).pipe(
    switchMap(({ interval, beginDate, endDate}) => {
      const begin = beginDate ? this._commonService.convertDateToString(beginDate) : undefined;
      const end = endDate ? this._commonService.convertDateToString(endDate) : undefined;

      return this._iaService.getHistogramDeviancesNew(interval, begin, end).pipe(map(data => formatAreaSpline(data)))
    })
  ));

  //Arespline graph - Anomalies
  aiAnomaliesAreaSplineChartOptions = computed<AreaSplineChartInterface>(() => {
    let abnormal = this.abnormalTrafficDetection() as any[];
    if (!abnormal) {
      return {} as AreaSplineChartInterface;
    }

    const abnormalData = abnormal.map((item:any) => (
      {
        name: riskLevels[item.name as keyof typeof riskLevels],
        type: item.type,
        data: item.data
      }
    ));
    return {
      name: 'aiAnomaliesAreaSpline',
      title: undefined,
      data: abnormalData,
      colors: this._commonService.sevColors,
      label: 'Deviances',
      backgroundColor:'#1F1F1F',
      labelColor: '#C5C4BE',
      yLabelColor: '#C5C4BE',
      gridLineColor: '#C5C4BE',
      gridLineDashStyle: 'Dot',
      legendLabelColor: '#C5C4BE'
    }
  })

  //Bar graph data
  alertsTop10DestinationIp = toSignal(toObservable(computed(() => ({interval: this.currentTime(), beginDate: this.currentBeginDate(), endDate: this.currentEndDate()}))).pipe(
    switchMap(({ interval, beginDate, endDate}) => {
      const begin = beginDate ? this._commonService.convertDateToString(beginDate) : undefined;
      const end = endDate ? this._commonService.convertDateToString(endDate) : undefined;

        return this._alertsService.getTop10IpDestinationNew(interval, begin, end).pipe(map(data => formatPieAndColumn(data)))
    })
  ));

  //Bar graph
  readonly alertsTop10IpDest= computed<BarChartInterface>(() => ({
    title: undefined,
    data: this.alertsTop10DestinationIp(),
    color: "#8569FE",
    height:'222px',
    borderRadius: '20%',
    backgroundColor: '#1F1F1F',
    labelColor: '#C5C4BE',
    yLabelColor: '#C5C4BE',
    xLabelColor: '#C5C4BE',
    gridLineColor: '#C5C4BE',
    gridLineDashStyle: 'Dot',
    legendLabelColor: '#C5C4BE',
    tickColor: '#C5C4BE',
    lineColor: '#C5C4BE',
  }))

  //Pie graph data
  alertsAIBySeverityPie = toSignal(toObservable(computed(() => ({
    interval: this.currentTime(),
    beginDate: this.currentBeginDate(),
    endDate: this.currentEndDate()
  }))).pipe(
    switchMap(({interval, beginDate, endDate}) => {
      const begin = beginDate ? this._commonService.convertDateToString(beginDate) : undefined;
      const end = endDate ? this._commonService.convertDateToString(endDate) : undefined;

      return this._iaService.getCountAlertAiBySev(interval, begin, end).pipe(
        map((alerts: any) =>
          formatPieAndColumn(alerts)
            .map((alert: any) => ({
              ...alert,
              name: `Severity ${alert.name}`
            }))
            .sort((a: any, b: any) => a.name.localeCompare(b.name))
        )
      )
    })
  ));

  //Pie chart
  readonly alertsAIBySevPie = computed<PieChartInterface>(() => {
    const data = this.alertsAIBySeverityPie();

    let total = data && data.length > 0
      ? data.reduce((sum: any, item: { y: any; }) => sum + (item.y || 0), 0)
      : '';

    return {
      data: data,
      height: '293px',
      colors: this._commonService.sevColors,
      label: 'Alerts',
      backgroundColor: '#1F1F1F',
      innerSize: '85%',
      subtitle: {
        useHTML: true,
        text: total !== '' ? `${total}` : '',
        floating: true,
        verticalAlign: 'middle',
        x: -75,
        y: 25,
        style: {
          color: 'white',
          fontSize: '28px'
        }
      },
      legendOption: {
        enabled: true,
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
        itemStyle: {
          color: 'white'
        },
        itemMarginBottom: 20,
        padding: 10,
        labelFormatter: function (this: Point | Series): string {
          if ('y' in this && 'name' in this) {
            return `${this.name}: ${this.y}`;
          }
          return '';
        }
      },
      dataLabelsOption: { enabled: false },

    };
  });

  //Area spline graph data - Alerts
  alertsAreaData = toSignal(toObservable(computed(() => ({interval: this.currentTime(), beginDate: this.currentBeginDate(), endDate: this.currentEndDate()}))).pipe(
    switchMap(({ interval, beginDate, endDate}) => {
      const begin = beginDate ? this._commonService.convertDateToString(beginDate) : undefined;
      const end = endDate ? this._commonService.convertDateToString(endDate) : undefined;

      return this._iaService.getAlertsAreaSpline(interval, begin, end).pipe(map(data => formatAreaSpline(data)))
    })
  ));

  //Area spline graph - Alerts
  readonly alertsAreaSpline = computed<AreaSplineChartInterface>(() => {
    const row = this.alertsAreaData()
    if (!row) {
      return {} as AreaSplineChartInterface;
    }
    return {
      name:'alertsAreaSpline',
      title: undefined,
      label: 'Alerts',
      data: row ? row.map((item: any) => ({ ...item, name: `Severity ${item.name}` })) : [],
      colors: this._commonService.sevColors.reverse(),
      backgroundColor:'#1F1F1F',
      labelColor: '#C5C4BE',
      yLabelColor: '#C5C4BE',
      gridLineColor: '#C5C4BE',
      gridLineDashStyle: 'Dot',
      legendLabelColor: '#C5C4BE'
    }
  })

  //Area spline graph data - Assets
  assetsDataSpline = toSignal(
    forkJoin([
      this._iaService.getLineAssets(360, 'src_acteurs'),
      this._iaService.getLineAssets(360, 'dest_acteurs')])
      .pipe(
        map(([src, dest]) => {
          return [
            {
              name: 'Source Assets',
              type: 'line',
              data: src
            },
            {
              name: 'Destination Assets',
              type: 'line',
              data: dest
            }
          ]
        })
      )
  )

  aiAssetsAreaSplineChartOptions = computed<AreaSplineChartInterface>(()=> {
    return {
      name:'aiAssetsAreaSpline',
      title: undefined,
      data: this.assetsDataSpline(),
      colors: ['#067F52', '#F68E2F'],
      label: 'Assets',
      backgroundColor:'#1F1F1F',
      labelColor: '#C5C4BE',
      yLabelColor: '#C5C4BE',
      gridLineColor: '#C5C4BE',
      gridLineDashStyle: 'Dot',
      legendLabelColor: '#C5C4BE'
    }
  });

  // Alerts by Threat data
  alertThreatData= toSignal(toObservable(computed(() => ({interval: this.currentTime(), beginDate: this.currentBeginDate(), endDate: this.currentEndDate()}))).pipe(
    switchMap(({ interval, beginDate, endDate}) => {
      const begin = beginDate ? this._commonService.convertDateToString(beginDate) : undefined;
      const end = endDate ? this._commonService.convertDateToString(endDate) : undefined;

      return this._alertsService.getAlertsDataByThreat(interval, begin, end)
    })
  ));

  //Nb unique IPs
  nbIpsSrc= toSignal(toObservable(computed(() => ({interval: this.currentTime(), beginDate: this.currentBeginDate(), endDate: this.currentEndDate()}))).pipe(
    switchMap(({ interval, beginDate, endDate}) => {
      const begin = beginDate ? this._commonService.convertDateToString(beginDate) : undefined;
      const end = endDate ? this._commonService.convertDateToString(endDate) : undefined;

      return this._alertsService.getDistinctIps('src_ip.keyword', interval, begin, end);
    })
  ));

  //Nb unique IPs
  nbIpsDest= toSignal(toObservable(computed(() => ({interval: this.currentTime(), beginDate: this.currentBeginDate(), endDate: this.currentEndDate()}))).pipe(
    switchMap(({ interval, beginDate, endDate}) => {
      const begin = beginDate ? this._commonService.convertDateToString(beginDate) : undefined;
      const end = endDate ? this._commonService.convertDateToString(endDate) : undefined;

      return this._alertsService.getDistinctIps('dest_ip.keyword', interval, begin, end);
    })
  ));

  //Nb rules
  nbRules= toSignal(toObservable(computed(() => ({interval: this.currentTime(), beginDate: this.currentBeginDate(), endDate: this.currentEndDate()}))).pipe(
    switchMap(({ interval, beginDate, endDate}) => {
      const begin = beginDate ? this._commonService.convertDateToString(beginDate) : undefined;
      const end = endDate ? this._commonService.convertDateToString(endDate) : undefined;

      return this._alertsService.getDistinctRules(interval, begin, end)
    })
  ));

  // Object to store the threat data
  readonly alertThreat = computed(() => {
    const ipsSrc = this.nbIpsSrc() as undefined | { value: number };
    const ipsDest = this.nbIpsDest()as undefined | { value: number };
    const rules = this.nbRules();
    const threatData = this.alertThreatData();

    const result = [];

    const hasSrc = ipsSrc && typeof ipsSrc === 'object' && 'value' in ipsSrc && typeof ipsSrc.value === 'number';
    const hasDest = ipsDest && typeof ipsDest === 'object' && 'value' in ipsDest && typeof ipsDest.value === 'number';
    const hasRules = rules && typeof rules === 'object' && 'value' in rules && typeof rules.value === 'number';

    if (hasSrc && hasDest && ipsSrc.value !== 0) {
      result.push({
        title: 'Unique IP',
        mainNumber: ipsSrc.value + ipsDest.value
      });
    }

    if (hasRules && rules.value !== 0) {
      result.push({
        title: 'Matched Rules',
        mainNumber: rules.value
      });
    }

    if (threatData && Array.isArray(threatData)) {
      result.push(...threatData.map((threat: any) => ({
        title: threat.key,
        mainNumber: threat.doc_count
      })));
    }

    return result;
  });

  iaStatsData = toSignal(this._iaService.getIaStats());

  readonly iaStatus = computed(() => {
    return this.checkIAStatus();

  });

  checkIAStatus() {
    const stats = this.iaStatsData();
    if (stats && stats.timestamp) {
      const date = new Date(stats.timestamp);
      const utcDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
      const now = new Date();
      const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
      const diff = nowUTC - utcDate;
      const diffMinutes = Math.floor(diff / 1000 / 60);
      return diffMinutes < 10;
    }
    return false;

  }

  stats    =  toSignal(this._alertsService.getDistinctThreats());
  showMore = false;

  toggleCollapse() {
    this.showMore = !this.showMore;
  }
  onMapChange(value: number | string) {
    if (typeof value === "string") {
      this.currentMapType.set(value)
    }
  }

  // Change time interval
  onTimeChange(value: number | string) {
    if (typeof value === "number") {
      this.currentBeginDate.set(undefined);
      this.currentEndDate.set(undefined);
      this.currentTime.set(value);
    }
    this.currentMapType.set(this.currentMapType());
  }

  getInnerStrokeColor(progress: number): string {
    if (progress < 0.5) {
      return '#FF0000';
    } else if (progress < 1) {
      return 'orange';
    } else {
      return 'green';
    }
  }

  redirectToPage(title: string): void {
    this._router.navigate(['/operator/detection/alerts-list'], {
      queryParams: {
        threat: title,
      }
    })
  }
  left = '85%';

  onCustomSelected(event: any) {
    this.currentBeginDate.set(event.beginDate);
    this.currentEndDate.set(event.endDate);
    this.left = '63%';
  }

  readonly aiStatusDisplay = computed(() => {
    const iaStats = this.iaStats() ?? { progress: 0 };
    const progress = iaStats.progress;

    const chartOpts = this.alertsAreaSpline() ?? { data: [] as any[] };
    const series = Array.isArray(chartOpts.data) ? chartOpts.data : [];

    const hasValidData = series.some(s =>
      Array.isArray((s as any).data) && (s as any).data.length > 0
    );
      const isTraining = progress < 1;

    if (isTraining) {
      return {
        type: 'training' as const,
        showChart: false,
        title: 'AI Training in Progress',
        description:
          'The AI model is currently training. Chart data will be available once training is complete.',
        showProgress: true,
        progressPercent: Math.round(progress * 100)
      };
    }

    // 5) IA prête mais pas de données
    if (!hasValidData) {
      return {
        type: 'no-data' as const,
        showChart: false,
        title: 'AI Model Ready',
        description:
          'The AI model has completed training. No suspicious activity has been detected so far.',
        showProgress: false
      };
    }

    // 6) IA prête et données présentes
    return {
      type: 'ready' as const,
      showChart: true
    };
  });

  readonly shouldShowChart = computed(() => {
    const iaStats = this.iaStats();
    const alertsData = this.alertsAreaData();

    const hasData = alertsData && alertsData.length > 0;
    const progress = iaStats?.progress || 0;
    const isTraining = progress < 1;

    return hasData && !isTraining;
  });


  readonly isDataAvailable = computed(() => {
    const options = this.alertsAreaSpline();
    const series = options?.data;

    return Array.isArray(series) && series.some(s =>
      Array.isArray((s as any).data) && (s as any).data.length > 0
    );
  });

  readonly shouldShowAiChart = computed(() => {
    const iaStats = this.iaStats();
    const alertsData = this.alertsAreaData();

    const hasValidData = alertsData && Array.isArray(alertsData) && alertsData.length > 0 &&
    alertsData.some(series => series.data && Array.isArray(series.data) && series.data.length > 0);
    const progress = iaStats?.progress || 0;
    const isTraining = progress < 1;

    return hasValidData || !isTraining;
  });

readonly hasAiRealData = computed(() => {
  const opts = this.alertsAreaSpline();
  if (!opts?.data || !Array.isArray(opts.data)) return false;
  return opts.data.some(s => Array.isArray(s.data) && s.data.length > 0);
});
   // --- Computed helpers pour savoir si chaque chart a au moins un vrai point ---
   readonly hasSeverityData = computed(() => {
    const pie = this.alertsAIBySevPie();
    return Array.isArray(pie.data) && pie.data.length > 0;
  });

  readonly hasAnomaliesData = computed(() => {
    const opts = this.aiAnomaliesAreaSplineChartOptions();
    return Array.isArray(opts.data)
      && opts.data.some(s => Array.isArray((s as any).data) && s.data.length > 0);
  });

  readonly hasAssetsData = computed(() => {
    const opts = this.aiAssetsAreaSplineChartOptions();
    return Array.isArray(opts.data)
      && opts.data.some(s => Array.isArray((s as any).data) && s.data.length > 0);
  });
  readonly aiAlertsStatusDisplay = computed(() => {
    const chartOpts = this.alertsAreaSpline() ?? { data: [] };
    const series = Array.isArray(chartOpts.data) ? chartOpts.data : [];
    return this.createChartStatusDisplay(series, this.iaStats());
  });

  readonly aiAnomaliesStatusDisplay = computed(() => {
    const chartOpts = this.aiAnomaliesAreaSplineChartOptions() ?? { data: [] };
    const series = Array.isArray(chartOpts.data) ? chartOpts.data : [];
    return this.createChartStatusDisplay(series, this.iaStats());
  });

  readonly aiAssetsStatusDisplay = computed(() => {
    const chartOpts = this.aiAssetsAreaSplineChartOptions() ?? { data: [] };
    const series = Array.isArray(chartOpts.data) ? chartOpts.data : [];
    return this.createChartStatusDisplay(series, this.iaStats());
  });



  // Helper computed properties for template usage
  readonly shouldShowAlertsChart = computed(() =>
    this.aiAlertsStatusDisplay().showChart
  );

  readonly shouldShowAnomaliesChart = computed(() =>
    this.aiAnomaliesStatusDisplay().showChart
  );

  readonly shouldShowAssetsChart = computed(() =>
    this.aiAssetsStatusDisplay().showChart
  );

  readonly shouldShowSeverityChart = computed(() =>
    this.aiAlertsBySeverityStatusDisplay().showChart
  );

  readonly aiAlertsBySeverityStatusDisplay = computed(() => {
    const chartOpts = this.alertsAIBySevPie() ?? { data: [] };
    const series = Array.isArray(chartOpts.data) ? chartOpts.data : [];
    return this.createChartStatusDisplay(series, this.iaStats());
  });

  createChartStatusDisplay = (chartData: any[], iaStats: any) => {
    const progress = iaStats?.progress ?? 0;
    const isTraining = progress < 1;

    const hasValidData =
      Array.isArray(chartData) &&
      chartData.length > 0 &&
      (
        chartData.some((p: any) => p && (typeof p.y === 'number') && p.y > 0) ||
        chartData.some((s: any) => Array.isArray(s?.data) && s.data.length > 0)
      ) || chartData.some(series => Array.isArray(series.data) && series.data.length > 0);


    if (isTraining) {
      return {
        type: 'training' as const,
        showChart: false,
        title: 'AI Training in Progress',
        description: 'The AI model is currently training. Chart data will be available once training is complete.',
        showProgress: true,
        progressPercent: Math.round(progress * 100)
      };
    }

    if (!hasValidData) {
      return {
        type: 'no-data' as const,
        showChart: false,
        title: 'AI Model Ready',
        description: 'The AI model has completed training. No suspicious activity has been detected so far.',
        showProgress: false
      };
    }

    return {
      type: 'ready' as const,
      showChart: true
    };
  };
}

