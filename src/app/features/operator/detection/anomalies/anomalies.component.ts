import {Component, computed, inject, signal} from '@angular/core';
import {
  AreaSplineChartInterface, GaugeChartInterface,
  MapChartInterface,
  PieChartInterface,
  SankeyChartInterface,
  TableColumnInterface
} from '@core/interfaces';
import {BaseField} from '@shared/components/form/fields';
import {AnomaliesFormService} from '@core/services/forms/anomalies-form.serrvice';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AnomalyQueryParamsInterface} from '../interfaces/anomaly-query-params.interface';
import {MatCard, MatCardContent} from '@angular/material/card';
import {TableComponent} from '@shared/components/table/table.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {PieComponent} from '@shared/components/graphs/pie/pie.component';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {AnomaliesService} from './anomalies.serveice';
import {MatIconModule} from '@angular/material/icon';
import {Point, Series} from 'highcharts';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TimeSelectorComponent} from "@shared/components/time-selector/time-selector.component";
import {AreasplineComponent} from '@shared/components/graphs/areaspline/areaspline.component';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {SankeyComponent} from '@shared/components/graphs/sankey/sankey.component';
import {CommonService} from '@core/services';
import {WorldMapComponent} from '@shared/components/graphs/world-map/world-map.component';
import {map, switchMap} from 'rxjs';
import {formatPieAndColumn, formatSankey} from "@core/utils/graph-formater.util";
import { PageHeaderComponent } from "@layout/header/page-header.component";

@Component({
    selector: 'app-anomalies',
    imports: [
    MatCard,
    TableComponent,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardContent,
    MatButtonModule,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatIconModule,
    PieComponent,
    MatTooltipModule,
    TimeSelectorComponent,
    AreasplineComponent,
    SankeyComponent,
    WorldMapComponent,
    PageHeaderComponent
],
    providers: [
        AnomaliesFormService,
        AnomaliesService
    ],
    templateUrl: './anomalies.component.html',
    styleUrl: './anomalies.component.scss'
})
export class AnomaliesComponent {

  private _anomaliesFormService = inject(AnomaliesFormService);
  private _anomalie2sService = inject(AnomaliesService);
  private _commonService = inject(CommonService);

  fields!: BaseField<string | number>[];
  title = 'Detection / Anomalies';
  length = this._anomalie2sService.length;
  displayedColumns = this._anomalie2sService.displayedColumns;
  form = signal<FormGroup<any>>(this._anomaliesFormService.getFormGroup());
  anomalies = this._anomalie2sService.anomalies;
  ordersTableColumns: TableColumnInterface[] = this._anomalie2sService.ordersTableColumns;
  currentTime = signal(24);
  currentBeginDate = signal(undefined);
  currentEndDate = signal(undefined);
  timeFilterOptions = [
    { value: 1, label: 'Last hour' },
    { value: 12, label: 'Last 12H' },
    { value: 24, label: 'Last 24H' },
    { value: 'Custom', label: 'Custom' },
  ];

  anomalieType: string = "zeek-notice";

  constructor() {
    this.fields = this._anomaliesFormService.getFormFields();
  }

  readonly anomaliesStats = toSignal(toObservable(computed(() => ({
    interval: this.currentTime(),
    beginDate: this.currentBeginDate(),
    endDate: this.currentEndDate()
  }))).pipe(
    switchMap(({interval, beginDate , endDate }) => {
      const begin = beginDate ? this._commonService.convertDateToString(beginDate): undefined;
      const end = endDate ? this._commonService.convertDateToString(endDate): undefined;

      return this._anomalie2sService.getAnomaliesNumber(interval, begin, end).pipe(map(buckets => formatPieAndColumn(buckets)));
    })
  ));

  readonly anomaliesGaugesOptions = computed<GaugeChartInterface[]>(() =>{

    let data = this.anomaliesStats();

    if (!data) {
      return [];
    }
    let total = data[0].y + data[1].y
    return [
      {title: 'Notice', label: 'Anomaly', data: data[0].y, total: total, color:'#F44949', background: '', showTitle: false },
      {title: 'Weird', label: 'Anomaly', data: data[1].y ?? 0, total: total ?? 0, color: '#FF6633', background: '', showTitle: false},
    ];
  });

  tableActions(tableActions: AnomalyQueryParamsInterface) {
    if (tableActions.type) {
      this.anomalieType = tableActions.type;
    }
    this._anomalie2sService.tableActions(tableActions);
  }

  readonly anoamliesPieChartOptions = computed<PieChartInterface>(() => {
    const data = this.anomaliesGaugesOptions();
    const total = data && data.length > 0
      ? data.reduce((sum, item) => sum + (item.data || 0), 0)
      : '';
    const dataAnomalies = data.map((item) => {
      return {
        name: item.title,
        y: item.data,
      };
    });

    return {
      data: dataAnomalies,
      height: '297px',
      colors: ['#F44949', '#FF6633'],
      label: 'Anomalies',
      backgroundColor: '#1F1F1F',
      innerSize: '85%',
      subtitle: {
        useHTML: true,
        text: total !== '' ? `${total}` : '',
        floating: true,
        x: 0,
        y: -25,
        align: 'center',
        style: {
          color: 'white',
          fontSize: '20px'
        }
      },
      legendOption: {
        enabled: true,

        layout: 'vertical',
        itemStyle: {
          color: 'white'
        },
        itemMarginBottom: 20,
        padding: 10,
        labelFormatter: function (this: Point | Series): string {
          if ('y' in this && this.y !== undefined && 'name' in this && 'series' in this) {
            const total = this.series.data.reduce((sum, point) => {
              return sum + (point.y !== undefined ? point.y : 0);
            }, 0);
            const percentage = total > 0 && this.y !== undefined ? ((this.y / total) * 100).toFixed(2) : '0.00';
            return `${this.name} : ${this.y} (${percentage}%)`;
          }
          return '';
        }
      },
      dataLabelsOption: {enabled: false}
    };
  });

  anomaliesDetails = (data: any) => this._anomalie2sService.anomaliesDetails(data);

  readonly noticeAreaData = toSignal(toObservable(computed(() => ({
    interval: this.currentTime(),
    beginDate: this.currentBeginDate(),
    endDate: this.currentEndDate()
  }))).pipe(
    switchMap(({interval, beginDate , endDate }) => {
      const begin = beginDate ? this._commonService.convertDateToString(beginDate): undefined;
      const end = endDate ? this._commonService.convertDateToString(endDate): undefined;

      return this._anomalie2sService.getLineNotice(interval, begin, end);
    })
  ));

  readonly weirdAreaData = toSignal(toObservable(computed(() => ({
    interval: this.currentTime(),
    beginDate: this.currentBeginDate(),
    endDate: this.currentEndDate()
  }))).pipe(
    switchMap(({ interval, beginDate , endDate }) => {
      const begin = beginDate ? this._commonService.convertDateToString(beginDate): undefined;
      const end = endDate ? this._commonService.convertDateToString(endDate): undefined;

      return this._anomalie2sService.getLineWeird(interval, begin, end);
    })
  ));

  // Fusionne les deux graphiques
  readonly anomaliesAreaData = computed(() => {
    const notice = this.noticeAreaData();
    const weird = this.weirdAreaData();

    return [
      {name: 'Notice', data: notice},
      {name: 'Weird', data: weird}
    ];
  });


  readonly anomaliesAreaSplineChartOptions = computed<AreaSplineChartInterface>(() => {
    if (!this.anomaliesAreaData()) {
      return {} as AreaSplineChartInterface;
    }
    return {
      name: 'alertsAreaSpline',
      title: undefined,
      label: 'Alerts',
      data: this.anomaliesAreaData(),
      colors: ['#F44949', '#FF6633'],
      backgroundColor: '#1F1F1F',
      labelColor: '#C5C4BE',
      yLabelColor: '#C5C4BE',
      gridLineColor: '#C5C4BE',
      gridLineDashStyle: 'Dot',
      legendLabelColor: '#C5C4BE'
    }
  });


  //Sankey graph data
  readonly sankeyNoticeData = toSignal(toObservable(computed(() => ({
    interval: this.currentTime(),
    beginDate: this.currentBeginDate(),
    endDate: this.currentEndDate()
  }))).pipe(
    switchMap(({ interval, beginDate , endDate }) => {
      const begin = beginDate ? this._commonService.convertDateToString(beginDate): undefined;
      const end = endDate ? this._commonService.convertDateToString(endDate): undefined;

      return this._anomalie2sService.getSankeyNotice(interval, begin, end);
    })
  ));

  readonly sankeyWeirdData = toSignal(toObservable(computed(() => ({
    interval: this.currentTime(),
    beginDate: this.currentBeginDate(),
    endDate: this.currentEndDate()
  }))).pipe(
    switchMap(({ interval, beginDate , endDate }) => {
      const begin = beginDate ? this._commonService.convertDateToString(beginDate): undefined;
      const end = endDate ? this._commonService.convertDateToString(endDate): undefined;

      return this._anomalie2sService.getSankeyWeird(interval, begin, end);
    })
  ));

  readonly anomaliesNoticeSankeyChartOptions = computed<SankeyChartInterface>(() => {
    const raw = this.sankeyNoticeData();

    return {
      title: undefined,
      data: raw ? formatSankey(raw) : [],
      colors: this._commonService.chartsColors,
      label: 'Requests',
      height: '222px',
      backgroundColor: '#1F1F1F'
    };
  });

  readonly anomaliesWeirdSankeyChartOptions = computed<SankeyChartInterface>(() => {
    const raw = this.sankeyWeirdData();

    return {
      title: undefined,
      data: raw ? formatSankey(raw) : [],
      colors: this._commonService.chartsColors,
      label: 'Requests',
      height: '222px',
      backgroundColor: '#1F1F1F'
    };
  });


  currentMapType = signal('src');
  originOptions = [
    {value: 'src', label: 'source'},
    {value: 'dest', label: 'destination'}
  ];

  // Change map type (Source or Destination)
  onMapChange(value: number | string) {
    if (typeof value === "string") {
      this.currentMapType.set(value)
    }
  }

  left = '85%';

  onCustomSelected(event: any) {
    this.currentBeginDate.set(event.beginDate);
    this.currentEndDate.set(event.endDate);
    this.left = '63%';
  }

  onTimeChange(value: number | string) {
    if (typeof value === "number") {
      this.currentBeginDate.set(undefined);
      this.currentEndDate.set(undefined);
      this.currentTime.set(value);
    }
    this.currentMapType.set(this.currentMapType());
  }

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

      return this._anomalie2sService.getWorldMapSourceData(mapType, interval, begin, end);
    })
  ));


  readonly mapChartOptions = computed<MapChartInterface>(() => {
    let color;
    if (this.currentMapType() === 'src') {
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
}
