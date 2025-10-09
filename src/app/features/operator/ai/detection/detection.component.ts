import { TimeSelectorComponent } from '@shared/components/time-selector/time-selector.component';
import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { FormGroup } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { Router } from "@angular/router";
import { TableCellTypeEnum } from "@core/enums";
import { TableColumnInterface, AreaSplineChartInterface, PieChartInterface, AreaChartInterface } from "@core/interfaces";
import { CommonService, IAAlertsQueryParams, IAService } from "@core/services";
import { IAAlertsFormService } from "@core/services/forms/ia-alerts-form.service";
import { BaseField } from "@shared/components/form/fields";
import { WorldMapMarkerComponent } from "@shared/components/graphs/world-map-marker/world-map-marker.component";
import { TableComponent } from "@shared/components/table/table.component";
import { AreasplineComponent } from '@shared/components/graphs/areaspline/areaspline.component';
import { NumbersPipe } from "@shared/pipes/numbers.pipe";
import { ToastrService } from "ngx-toastr";
import { map, switchMap } from "rxjs";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatTooltipModule } from "@angular/material/tooltip";
import { PieComponent } from "@shared/components/graphs/pie/pie.component";
import { Point, Series } from 'highcharts';
import { AreaComponent } from '@shared/components/graphs/area/area.component';
import { ApiResponse } from '@core/interfaces/api-response.interface';
import {formatAreaSpline, formatPieAndColumn} from "@core/utils/graph-formater.util";
import { PageHeaderComponent } from "@layout/header/page-header.component";

const riskLevels = {
  '1': 'Low Deviance',
  '2': 'Medium Deviance',
  '3': 'High Deviance',
  '4': 'Critical Deviance'
};

@Component({
    selector: 'app-deviance',
    imports: [
    CommonModule,
    MatTableModule,
    WorldMapMarkerComponent,
    MatIconModule,
    AreasplineComponent,
    TableComponent,
    MatCardModule,
    MatButtonToggleModule,
    MatTooltipModule,
    TimeSelectorComponent,
    PieComponent,
    AreaComponent,
    PageHeaderComponent
],
    providers: [IAAlertsFormService, NumbersPipe],
    templateUrl: './detection.component.html',
    styleUrl: './detection.component.scss'
})
export class DetectionComponent {

  constructor() {
  toObservable(this.iaAlertsQueryParams).pipe(
    switchMap(() => {
      this.iaAlertsQueryParams().display_col = this.displayedColumns;
      return this._iaService.getAllAlerts(this.iaAlertsQueryParams());
    }),
    map((response: ApiResponse<any>) => {
      this.length = response.total;
      return response.data || [];
    })
  ).subscribe((data) => this._alert.set(data));
}

  // Inject services
  private _iaService = inject(IAService);
  private _commonService = inject(CommonService);
  private _iaAlertsFormService = inject(IAAlertsFormService);
  private _router = inject(Router);
  private _toastr = inject(ToastrService);

  // Initialisation des variables
  title = 'Detection / by AI';
  currentMapType = signal('src');
  currentTime = signal(24);
  currentBeginDate = signal(undefined);
  currentEndDate = signal(undefined);
  readonly noDataArray = Array(5).fill(0);
  // Options du bloc time filter
  timeFilterOptions = [
    { value: 1, label: 'Last hour' },
    { value: 12, label: 'Last 12H' },
    { value: 24, label: 'Last 24H' },
    { value: 'Custom', label: 'Custom' },
  ];

  // Fonction qui gère le changement du type de carte (Source ou Destination)
  onMapChange(value: string) {
    this.currentMapType.set(value);
  }

  left = '85%';
  // Fonction qui gère le changement du temps (Last 1h, 12h, 24h)
  onTimeChange(value: number | string) {
    if (typeof value === 'number') {
      this.left = '85%';
      this.currentBeginDate.set(undefined);
      this.currentEndDate.set(undefined);
      this.currentTime.set(value);
    }
  }

  // Fonction qui gère le changement des dates de debut et de fin (Custom)
  onCustomSelected(event: any) {
    this.currentBeginDate.set(event.beginDate);
    this.currentEndDate.set(event.endDate);
    this.left = '63%';
  }

  length: number = 0;

  // TABLE
  fields: BaseField<string|number>[] = this._iaAlertsFormService.getFormFields();

  displayedColumns = [
    'timestamp',
    'flow_id',
    'app_proto',
    'src_ip',
    'src_geoip.geo.country_iso_code',
    'confiance',
    'deviance',
    'severity',
    'translation',
    'feedback',
    'community_id',
  ];

  iaAlertsQueryParams = signal<IAAlertsQueryParams>({
    display_col: this.displayedColumns,
    sortedBy: 'timestamp',
    orderBy: 'desc',
  });

  form = signal<FormGroup<any>>(this._iaAlertsFormService.getFormGroup());

  // Signal qui retourne la liste des alertes
  _alert = signal<any[]>([]);

  alerts = toSignal(
    toObservable(this.iaAlertsQueryParams).pipe(
      switchMap(() => {
        this.iaAlertsQueryParams().display_col = this.displayedColumns;

        return this._iaService.getAllAlerts(this.iaAlertsQueryParams()).pipe(
          map((response: ApiResponse<any>) => {
            this.length = response.total;
            return response.data || [];
          })
        );
      })
    ),
    { initialValue: [] }
  );


  // Pie chart data
  alertsSevPie = toSignal(
    toObservable(
      computed(() => ({
        interval: this.currentTime(),
        beginDate: this.currentBeginDate(),
        endDate: this.currentEndDate(),
      }))
    ).pipe(
      switchMap(({ interval, beginDate, endDate }) => {
        const begin = beginDate ? this._commonService.convertDateToString(beginDate) : undefined;
        const end = endDate ? this._commonService.convertDateToString(endDate) : undefined;

        return this._iaService.getAlertBySevCount(interval, begin, end).pipe(
          map((alerts) =>
            formatPieAndColumn(alerts)
              .map((alert: any) => ({
                ...alert,
                name: `Severity ${alert.name}`,
              }))
              .sort((a: any, b: any) => a.name.localeCompare(b.name))
          )
        );
      })
    )
  );

  // Pie chart options
  readonly alertsBySevPie = computed<PieChartInterface>(() => {
    const data = this.alertsSevPie();
    const total = data && data.length > 0 ? data.reduce((sum, item) => sum + (item.y || 0),  0).toString() : '';

    return {
      data: data,
      height: '180px',
      colors: ['#F44949', '#FF6633', '#F89200'],
      label: 'Alerts',
      backgroundColor: '#1F1F1F',
      innerSize: '85%',
      subtitle: {
        useHTML: true,
        text: `<span title="${total}">${total.length > 10 ? total.slice(0, 10) + '...' : total}</span>`,
        floating: true,
        verticalAlign: 'middle',
        x: -70,
        y: 20,
        style: {
          color: 'white',
          fontSize: total.toString().length > 8 ? '18px' : total.toString().length > 5 ? '22px' : '28px',
          cursor: 'pointer',
        },
      },
      legendOption: {
        enabled: true,
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
        itemStyle: {
          color: 'white',
        },
        itemMarginBottom: 0,
        padding: 0,
        labelFormatter: function (this: Point | Series): string {
          if ('y' in this && 'name' in this) {
            let percentage =
              this.y && (this.y / total) * 100
                ? ((this.y / total) * 100).toFixed(2)
                : '0.00';
            return `${this.name}: ${percentage}%`;
          }
          return '';
        },
      },
      dataLabelsOption: { enabled: false },
    };
  });

  // Fonction qui retourne le label du niveau de confiance
  getConfidence(confidence: number) {
    // Return the confidence level
    switch (confidence) {
      case 1:
        return 'Very Low';
      case 2:
        return 'Low';
      case 3:
        return 'High';
      case 4:
        return 'Very High';
      default:
        return '';
    }
  }

  // Fonction qui retourne le label du niveau de deviance
  getDeviance(deviance: number) {
    // Return the deviance level
    switch (deviance) {
      case 1:
        return 'Low';
      case 2:
        return 'Medium';
      case 3:
        return 'High';
      case 4:
        return 'Critical';
      default:
        return '';
    }
  }

  // Area Line Chart Data
  alertArea = toSignal(
    toObservable(
      computed(() => ({
        interval: this.currentTime(),
        beginDate: this.currentBeginDate(),
        endDate: this.currentEndDate(),
      }))
    ).pipe(
      switchMap(({ interval, beginDate, endDate }) => {
        if (beginDate && endDate) {
          const begin = this._commonService.convertDateToString(beginDate);
          const end = this._commonService.convertDateToString(endDate);
          return this._iaService.getAreaLineAlerts(interval, begin, end);
        }
        return this._iaService.getAreaLineAlerts(this.currentTime());
      })
    )
  );

  // Area Line Chart Options
  readonly alertsAreaGraphOptions = computed<AreaChartInterface>(() => ({
    data: this.alertArea(),
    title: undefined,
    yAxisLabel: 'AI Alerts',
    lineColor: 'var(--radm-lightblue)',
    height: 180,
    backgroundColor: '#1F1F1F',
    labelColor: '#C5C4BE',
    yLabelColor: '#C5C4BE',
    xLabelColor: '#C5C4BE',
    gridLineColor: '#C5C4BE',
    gridLineDashStyle: 'Dot',
    legendLabelColor: '#C5C4BE',
  }));

  // Area Line Chart Data
  abnormalTraficDetection = toSignal(
    toObservable(
      computed(() => ({
        interval: this.currentTime(),
        beginDate: this.currentBeginDate(),
        endDate: this.currentEndDate(),
      }))
    ).pipe(
      switchMap(({ interval, beginDate, endDate }) => {
        const begin = beginDate ? this._commonService.convertDateToString(beginDate) : undefined;
        const end = endDate ? this._commonService.convertDateToString(endDate) : undefined;

        return this._iaService.getHistogramDeviances(interval, begin, end).pipe(map(data => formatAreaSpline(data)));
      })
    )
  );

  // Area Line Chart Data - SCR ASSETS
  lineAssetSrc = toSignal(this._iaService.getLineAssets(336, 'src_acteurs'), {
    initialValue: [],
  });
  // Area Line Chart Data - DST ASSETS
  lineAssetDest = toSignal(this._iaService.getLineAssets(336, 'dest_acteurs'), {
    initialValue: [],
  });

  // LAST 3 CRITICAL DEVIANCES
  last3CriticalDeviances = toSignal(
    toObservable(
      computed(() => ({
        interval: this.currentTime(),
        beginDate: this.currentBeginDate(),
        endDate: this.currentEndDate(),
      }))
    ).pipe(
      switchMap(({ interval, beginDate, endDate }) => {
        if (beginDate && endDate) {
          const begin = this._commonService.convertDateToString(beginDate);
          const end = this._commonService.convertDateToString(endDate);
          return this._iaService.getLast3Deviances(interval, begin, end);
        }
        return this._iaService.getLast3Deviances(this.currentTime());
      })
    ),
    { initialValue: [] }
  );

  //Tableau
  get ordersTableColumns(): TableColumnInterface[] {
    return [
      { name: 'Seen', dataKey: 'timestamp', type: TableCellTypeEnum.DATE },
      { name: 'Flow Id', dataKey: 'flow_id', type: TableCellTypeEnum.TEXT },
      { name: 'Src Ip', dataKey: 'src_ip', type: TableCellTypeEnum.FLAG },
      { name: 'Severity', dataKey: 'severity', type: TableCellTypeEnum.SEVERITY },
      {
        name: 'Explanation',
        dataKey: 'translation',
        type: TableCellTypeEnum.TEXT,
        pivot: false,
      },
      {
        name: 'Confidence',
        dataKey: 'confiance',
        type: TableCellTypeEnum.CONFIDENCE
      },
      {
        name: 'Deviance',
        dataKey: 'deviance',
        type: TableCellTypeEnum.DEVIANCE,
      },
      {
        name: 'Feedback',
        dataKey: 'feedback',
        type: TableCellTypeEnum.FEEDBACK,
        filtarable:false,
        hideContextMenu: true,
        isSortable: false
      },
      {
        name: 'Actions',
        dataKey: 'actions',
        type: TableCellTypeEnum.ACTIONS,
        filtarable:false,
        hideContextMenu: true,
        isSortable: false,
        actions: [
          {
            name: 'details',
            label: 'Alert details',
            icon: 'visibility',
            params: ['_id'],
          },
        ],
      },
    ];
  }

  // Table actions
  tableActions(tableActions: IAAlertsQueryParams) {
    this.iaAlertsQueryParams.update(() => ({
      ...this.iaAlertsQueryParams(),
      ...tableActions,
    }));
  }

  getCellDatas(data: any) {
    switch (data.actionName) {
      case 'details':
        this.redirectToDetailAlert(data);
        break;
      case 'feedbackData':
        this.handleFeedback(data);
        break;
      default:
        break;
    }
  }

  // Redirect to alert details
  redirectToDetailAlert(data: any) {
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['/operator/alerts/detail'], {
        queryParams: {
          type: 'ai',
          id: data._id
        }
      })
    );

    window.open(url, '_blank');
  }

  dataMap: (string | number)[][] = this._commonService.getEmptyMap();

  // MAP data
  mapAlerts = toSignal(
    toObservable(
      computed(() => ({
        interval: this.currentTime(),
        beginDate: this.currentBeginDate(),
        endDate: this.currentEndDate(),
      }))
    ).pipe(
      switchMap(({ interval, beginDate, endDate }) => {
        if (beginDate && endDate) {
          const begin = this._commonService.convertDateToString(beginDate);
          const end = this._commonService.convertDateToString(endDate);
          return this._iaService
            .getAllAlerts({
              display_col: [
                'src_geoip.geo',
                'flow_id',
                'proto',
                'confiance',
                'severity',
                'translation',
                'deviance',
                'src_ip',
                'dest_ip',
              ],
              size: 10000,
              dateBegin: begin,
              dateEnd: end,
            })
            .pipe(
              map((resp) => {
                return resp.data;
              })
            );
        }
        return this._iaService
          .getAllAlerts({
            display_col: [
              'src_geoip.geo',
              'flow_id',
              'proto',
              'confiance',
              'severity',
              'translation',
              'deviance',
              'src_ip',
              'dest_ip',
            ],
            size: 10000,
            timeInterval: interval,
          })
          .pipe(
            map((resp) => {
              return resp.data;
            })
          );
      })
    ),
    { initialValue: [] }
  );

  // MAP options
  mapOptions = computed(() => {
    const seen = new Set();
    return {
      dataMap: this.dataMap,
      tooltip: {
        pointFormat:
          '<br/><b>Flow Id :</b> {point.flowId}' +
          '<br/><b>Src IP :</b> {point.src_ip}' +
          '<br/><b>Dest IP :</b> {point.dest_ip}' +
          '<br/><b>Protocol :</b> {point.proto}' +
          '<br/><b>Severity :</b> {point.severity}' +
          '<br/><b>Explanation :</b> {point.translation}',
      },
      data: this.mapAlerts().reduce((acc: any[], el: any) => {
        const name = el?.src_geoip?.geo.country_name;
        const lat = el?.src_geoip?.geo.location.lat;
        const lon = el?.src_geoip?.geo.location.lon;
        const key = `${name}-${lat}-${lon}`;
        const id = el?._id;
        const flowId = el?.flow_id;
        const severity = el?.severity;
        const proto = el?.proto;
        const confiance = el?.confiance;
        const src_ip = el?.src_ip;
        const dest_ip = el?.dest_ip;
        const translation = el?.translation;
        if (!seen.has(key)) {
          seen.add(key);
          acc.push({
            name,
            lat,
            lon,
            id,
            flowId,
            severity,
            proto,
            confiance,
            src_ip,
            dest_ip,
            translation,
            events: {
              click: () => {
                // Redirection to details
                this._router.navigate(['/operator/alerts/detail'], {
                  queryParams: { type: 'ai', id: id },
                });
              },
              // hover
              mouseover: (event: any) => {
                // Get the marker object
                const marker = event.target;

                // Animate the marker
                marker.animate({
                  offset: [0, -10], // Move the marker up by 10 pixels
                  duration: 500, // Animation duration: 500ms
                  easing: 'easeOutElastic', // Use an elastic easing function to create a bouncing effect
                });

                // Reverse the animation after 500ms
                setTimeout(() => {
                  marker.animate({
                    offset: [0, 0], // Move the marker back to its original position
                    duration: 500, // Animation duration: 500ms
                    easing: 'easeOutElastic', // Use an elastic easing function to create a bouncing effect
                  });
                }, 500);
              },
            },
          });
        }
        return acc;
      }, []),
    };
  });

  // Return the severity css class
  getSeverityClass(confiance: number): string {
    switch (confiance) {
      case 1:
        return 'severity4';
      case 2:
        return 'severity3';
      case 3:
        return 'severity2';
      case 4:
        return 'severity1';
      default:
        return '';
    }
  }

  // Return the feedback css class
  getFeedbackClass(feedback: string): string {
    switch (feedback) {
      case 'matched':
        return 'positive';
      case 'not matched':
        return 'negative';
      default:
        return '';
    }
  }

  // Redirection to details
  onDevianceClick(deviance: number) {
    this._router.navigate(['/operator/alerts/detail'], {
      queryParams: { type: 'ai', id: deviance },
    });
  }

  // Areaspline options
  normalAreaSplineChartOptions = computed<AreaSplineChartInterface>(() => {
    const AssetsDataSpline: any[] = [
      {
        name: 'Source Assets',
        type: 'line',
        data: this.lineAssetSrc(),
      },
      {
        name: 'Destination Assets',
        type: 'line',
        data: this.lineAssetDest(),
      },
    ];

    return {
      title: undefined,
      data: AssetsDataSpline,
      colors: ['#067F52', '#F68E2F'],
      label: 'Assets',
      backgroundColor: '#1F1F1F',
      labelColor: '#C5C4BE',
      yLabelColor: '#C5C4BE',
      gridLineColor: '#C5C4BE',
      gridLineDashStyle: 'Dot',
      legendLabelColor: '#C5C4BE',
    };
  });

  // Areaspline options
  abnormalAreaSplineChartOptions = computed<AreaSplineChartInterface>(() => {
    let abnormal = this.abnormalTraficDetection() as any[];
    if (!abnormal) {
      return {} as AreaSplineChartInterface;
    }

    const adnormalData = abnormal.map((item: any) => ({
      name: riskLevels[item.name as keyof typeof riskLevels],
      type: item.type,
      data: item.data,
    }));

    return {
      title: undefined,
      data: adnormalData,
      colors: this._commonService.sevColors.reverse(),
      label: 'Deviances',
      backgroundColor: '#1F1F1F',
      labelColor: '#C5C4BE',
      yLabelColor: '#C5C4BE',
      gridLineColor: '#C5C4BE',
      gridLineDashStyle: 'Dot',
      legendLabelColor: '#C5C4BE',
    };
  });

 handleFeedback(event: { _id: string; feedbackData: string }) {
  const payload = {
    index: 'logstash-ia-alerts-*',
    feedback: {
      timestamp: new Date().toISOString(),
      type: 'alert',
      value: event.feedbackData,
    },
  };

     this._iaService.sendFeedback(event._id, payload).subscribe({
    next: () => {
      // Mise à jour locale du signal alerts
      this._alert.update((items) =>
        items.map((item) =>
          item._id === event._id
            ? {
                ...item,
                feedback: {
                  ...item.feedback,
                  value: event.feedbackData,
                },
              }
            : item
        )
      );

      this._toastr.success(`Feedback "${event.feedbackData}" sent successfully.`);
    },
    error: (error) => {
      console.error('Error sending feedback:', error);
      this._toastr.error('Failed to send feedback.');
    },
  });
}
}
