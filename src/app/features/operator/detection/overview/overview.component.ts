import { Component, computed, inject, signal } from '@angular/core';
import { AreaComponent } from '@shared/components/graphs/area/area.component';
import { MatCard, MatCardContent, MatCardModule } from '@angular/material/card';
import { PieComponent } from '@shared/components/graphs/pie/pie.component';
import { TableComponent } from '@shared/components/table/table.component';
import { AlertQueryParams, AlertsService, CommonService } from '@core/services';
import {
  AreaChartInterface,
  AreaSplineChartInterface,
  PieChartInterface,
  TableColumnInterface,
} from '@core/interfaces';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TableCellTypeEnum } from '@core/enums';
import {
  BarChartInterface,
  PortMappings,
} from '@core/interfaces/charts/bar-chart.interface';
import { BarComponent } from '@shared/components/graphs/bar/bar.component';
import { AreasplineComponent } from '@shared/components/graphs/areaspline/areaspline.component';
import { map, switchMap } from 'rxjs';
import { AlertsFormService } from '@core/services/forms/alerts-form.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BaseField } from '@shared/components/form/fields';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {  MatIconModule } from '@angular/material/icon';
import { Point, Series } from 'highcharts';
import { StackedBarComponent } from '@shared/components/graphs/stacked-bar/stacked-bar.component';
import { HorizontalBarChartInterface } from '@core/interfaces/charts/horizontal-bar-chart.interface';
import { HorizontalBarChartComponent } from '@shared/components/graphs/horizontal-bar-chart/horizontal-bar-chart.component';
import { StackedColumnInterface } from '@core/interfaces/charts/stacked-column.interface';
import { MatSelectModule } from '@angular/material/select';
import {TimeSelectorComponent} from "@shared/components/time-selector/time-selector.component";
import {DetailField} from "@shared/components/table/detail/detail.component";
import { MatTooltipModule } from '@angular/material/tooltip';
import {DeleteModalService} from "@shared/components/modal/modal-delete/service/modal-delete.service";
import {MatButton} from "@angular/material/button";
import {formatAreaSpline, formatPieAndColumn} from "@core/utils/graph-formater.util";

@Component({
    selector: 'app-overview',
    imports: [
        AreaComponent,
        MatCard,
        MatCardContent,
        PieComponent,
        TableComponent,
        BarComponent,
        AreasplineComponent,
        MatCardModule,
        ReactiveFormsModule,
        StackedBarComponent,
        HorizontalBarChartComponent,
        StackedBarComponent,
        MatSelectModule,
        MatIconModule,
        TimeSelectorComponent,
        CommonModule,
        MatTooltipModule,
        MatButton
    ],
    providers: [AlertsFormService],
    templateUrl: './overview.component.html',
    styleUrl: './overview.component.scss'
})
export class OverviewComponent {
  // Injection des services
  private _alertsService = inject(AlertsService);
  private _alertsFormService = inject(AlertsFormService);
  private _commonService = inject(CommonService);
  private _deleteModalService = inject(DeleteModalService);
  private _router = inject(Router);

  // Initialisation des variables
  title = 'Detection / Overview';
  length: number = 0;
  currentTime = signal(24);
  currentBeginDate = signal(undefined);
  currentEndDate = signal(undefined);
  readonly noDataArray = Array(5).fill(0);
  checkedIds: string[] = [];

  fields!: BaseField<string | number>[];

  portMappings: PortMappings = {
    80: 'http',
    8080: 'http',
    443: 'https',
    25: 'smtp',
    587: 'smtp',
    143: 'imap',
    993: 'imap',
    110: 'pop3',
    21: 'ftp',
    22: 'ssh',
    53: 'dns',
  };

  displayedColumns = [
    '_id',
    'timestamp',
    'alert.signature',
    'alert.signature_id',
    'threat',
    'src_geoip.geo.country_iso_code',
    'dest_geoip.geo.country_iso_code',
    'src_ip',
    'src_port',
    'alert.severity',
    'dest_ip',
    'dest_port',
    'proto',
    'app_proto',
    'mitre_techniques',
  ];

  //Option du bloc time filter
  timeFilterOptions = [
    { value: 1, label: 'Last hour' },
    { value: 12, label: 'Last 12H' },
    { value: 24, label: 'Last 24H' },
    { value: 'Custom', label: 'Custom' },
  ];

  constructor() {
    this.fields = this._alertsFormService.getFormFields();

    // effect(() => {
    //   this.currentTime()
    // },{allowSignalWrites: true})
  }

  // Configuration des paramètres de la requete pour récupérer des données des alerts
  alertQueryParams = signal<AlertQueryParams>({
    display_col: this.displayedColumns,
    sortedBy: 'timestamp',
    orderBy: 'desc',
  });
  form = signal<FormGroup<any>>(this._alertsFormService.getFormGroup());

  // Line area chart - Data
  alertLine = toSignal(
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
          return this._alertsService.getAlertsData(interval, begin, end);
        }
        return this._alertsService.getAlertsData(this.currentTime());
      })
    )
  );

  // Stacked Bar chart - Data
  topPortByAlerts = toSignal(
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

        return this._alertsService.getTopAppByPortByTime(interval, begin, end).pipe(map(data => formatPieAndColumn(data)));
      })
    )
  );

  // Stacked Bar chart - Data
  topAlertsByAppProto = toSignal(
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

        return this._alertsService.getTopAlertByAppProto(interval, begin, end).pipe(
          map(data => formatPieAndColumn(data))
        );
      })
    )
  );

  // Areaspline chart - Data
  alertsAreaData = toSignal(
    toObservable(
      computed(() => ({
        interval: this.currentTime(),
        beginDate: this.currentBeginDate(),
        endDate: this.currentEndDate(),
      }))
    ).pipe(
      switchMap(({ interval, beginDate, endDate }) => {
        const begin = beginDate? this._commonService.convertDateToString(beginDate): undefined;
        const end = endDate? this._commonService.convertDateToString(endDate): undefined;

        return this._alertsService.getAreaAlertInTime(interval, begin, end).pipe(map(data => formatAreaSpline(data)));
      })
    )
  );

  // Areaspline chart - Data
  alertsAreaThreat = toSignal(
    toObservable(
      computed(() => ({
        interval: this.currentTime(),
        beginDate: this.currentBeginDate(),
        endDate: this.currentEndDate(),
      }))
    ).pipe(
      switchMap(({ interval, beginDate, endDate }) => {
        const begin = beginDate? this._commonService.convertDateToString(beginDate): undefined;
        const end = endDate? this._commonService.convertDateToString(endDate): undefined;

        return this._alertsService.getAreaThreatInTime(interval, begin, end).pipe(map(data => formatAreaSpline(data)));
      })
    )
  );

  // Bar Chart - Data
  alertsTop10SourceIp = toSignal(
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

        return this._alertsService.getTop10IpSource2(interval, begin, end).pipe(map(data => formatPieAndColumn(data)));
      })
    )
  );

  // Horizontal bar chart - Data
  topThreat = toSignal(
    toObservable(
      computed(() => ({
        interval: this.currentTime(),
        beginDate: this.currentBeginDate(),
        endDate: this.currentEndDate(),
      }))
    ).pipe(
      switchMap(({ interval, beginDate, endDate }) => {
        const begin = beginDate ?this._commonService.convertDateToString(beginDate): undefined;
        const end = endDate ?this._commonService.convertDateToString(endDate): undefined;

        return this._alertsService.getTopThreat2(interval, begin, end).pipe(map(data => formatPieAndColumn(data)));
      })
    )
  );

  // Pie chart - Data
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

        return this._alertsService.getAlertBySevCount(interval, begin, end).pipe(
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

    const total =
      data && data.length > 0
        ? data.reduce((sum, item) => sum + (item.y || 0), 0).toString() : '';

    return {
      data: data,
      height: '297px',
      colors: ['#F44949', '#FF6633', '#F89200'],
      label: 'Severity : Alerts',
      backgroundColor: '#1F1F1F',
      innerSize: '85%',
      subtitle: {
        useHTML: true,
        text: `<span title="${total}">${total.length > 10 ? total.slice(0, 10) + '...' : total}</span>`,
        floating: true,
        verticalAlign: 'middle',
        align: 'center',
        x: -75,
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
        itemMarginBottom: 20,
        padding: 10,
        labelFormatter: function (this: Point | Series): string {
          if ('y' in this && 'name' in this) {
            return `${this.name}: ${this.y}`;
          }
          return '';
        },
      },
      dataLabelsOption: { enabled: false },
    };
  });

  // Bar chart options
  readonly alertsTop10IpSrc = computed<BarChartInterface>(() => ({
    title: undefined,
    data: this.alertsTop10SourceIp(),
    color: '#8569FE',
    height: '400px',
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
  }));

  // Table
  alerts = toSignal(
  toObservable(this.alertQueryParams).pipe(
    switchMap(() => {
      this.alertQueryParams().display_col = this.displayedColumns;
      return this._alertsService.getAllAlerts(this.alertQueryParams()).pipe(
        map((response) => {
          this.length = response.total;

          return response.data;
        })
      );
    })
  )
  );

  //Line graph
  readonly alertsLineGraphOptions = computed<AreaChartInterface>(() => ({
    title: undefined,
    yAxisLabel: 'Alerts',
    data: this.alertLine(),
    lineColor: '#7B5DFF',
    height: 302,
    backgroundColor: '#1F1F1F',
    labelColor: '#C5C4BE',
    yLabelColor: '#C5C4BE',
    xLabelColor: '#C5C4BE',
    gridLineColor: '#C5C4BE',
    gridLineDashStyle: 'Dot',
    legendLabelColor: '#C5C4BE',
  }));


  categoryArray: string[] = [];
  // Areaspline chart
  readonly alertsAreaSpline = computed<AreaSplineChartInterface>(() => {
    if (!this.alertsAreaData()) {
      return {} as AreaSplineChartInterface;
    }

    this.categoryArray =
      this.alertsAreaData()?.map((alert: { name: any }) => alert.name) ?? [];

    return {
      title: undefined,
      label: 'Alerts',
      data: this.alertsAreaData(),
      colors: this._commonService.sevColors.reverse(),
      backgroundColor: '#1F1F1F',
      labelColor: '#C5C4BE',
      yLabelColor: '#C5C4BE',
      gridLineColor: '#C5C4BE',
      gridLineDashStyle: 'Dot',
      legendLabelColor: '#C5C4BE',
      showLegend: true,
    };
  });

  threatArray: string[] = [];
  // Areaspline chart
  readonly alertsByThreatAreSpline = computed<AreaSplineChartInterface>(() => {
    if (!this.alertsAreaThreat()) {
      return {} as AreaSplineChartInterface;
    }
    this.threatArray =
      this.alertsAreaThreat()?.map((alert: { name: any }) => alert.name) ?? [];

    return {
      title: undefined,
      label: 'Alerts',
      data: this.alertsAreaThreat(),
      colors: this._commonService.sevColors.reverse(),
      backgroundColor: '#1F1F1F',
      labelColor: '#C5C4BE',
      yLabelColor: '#C5C4BE',
      gridLineColor: '#C5C4BE',
      gridLineDashStyle: 'Dot',
      legendLabelColor: '#C5C4BE',
      showLegend: true,
    };
  });

  // Horizontal bar chart
  readonly alertsByThreatbarGraphOptions =
    computed<HorizontalBarChartInterface>(() => {
      const data = this.topThreat();
      if (!data || data.length === 0) {
        return {
          title: '',
          categories: '',
          seriesData: [],
          colors: [],
        } as unknown as HorizontalBarChartInterface;
      }

      const seriesData = data.map((item: any) => ({
        name: item.name,
        y: item.y,
      }));
      const colors = [
        '#FFA500',
        '#8A2BE2',
        '#FFFF00',
        '#FF69B4',
        '#00CED1',
        '#FF6347',
        '#00BFFF',
        '#DC143C',
        '#32CD32',
      ];

      return {
        title: '',
        categories: [''],
        seriesData,
        colors,
      } as HorizontalBarChartInterface;
    });

  // Stacked bar chat
  readonly alertsTopApplication = computed<StackedColumnInterface>(() => {
    const data = this.topPortByAlerts();
    if (!data || data.length === 0) {
      return {
        title: '',
        data: [],
        categories: [],
        height: '297px',
      } as unknown as StackedColumnInterface;
    }

    const categories = data.map((item: any) => item.name);
    const seriesData = data.map((item: any) => ({
      name: item.name,
      data: [item.y],
    }));

    return {
      title: '',
      data: seriesData,
      categories,
    } as StackedColumnInterface;
  });

  // Stacked bar chat
  readonly alertsTopAppproto = computed<StackedColumnInterface>(() => {
    const data = this.topAlertsByAppProto();
    if (!data || data.length === 0) {
      return {
        title: '',
        data: [],
        categories: [],
        height: '297px',
      } as unknown as StackedColumnInterface;
    }

    const categories = data.map((item: any) => item.name);
    const seriesData = data.map((item: any) => ({
      name: item.name,
      data: [item.y],
    }));

    return {
      title: '',
      data: seriesData,
      categories,
      height: '297px',
    } as StackedColumnInterface;
  });

  // Tableau columns
  get ordersTableColumns(): TableColumnInterface[] {
    return [
      { name: '', dataKey: '_id', type: TableCellTypeEnum.CHECKBOX2 },
      { name: 'Seen', dataKey: 'timestamp', type: TableCellTypeEnum.DATE },
      {
        name: 'Threat',
        dataKey: 'threat',
        type: TableCellTypeEnum.TEXT,
      },
      {
        name: 'Dest IP',
        dataKey: 'dest_ip',
        type: TableCellTypeEnum.FLAG,
      },
      {
        name: 'Dest Port',
        dataKey: 'dest_port',
        type: TableCellTypeEnum.TEXT,
      },
      {
        name: 'Src Ip',
        dataKey: 'src_ip',
        type: TableCellTypeEnum.FLAG,
      },
      {
        name: 'Src Port',
        dataKey: 'src_port',
        type: TableCellTypeEnum.TEXT,
      },
      {
        name: 'App Proto',
        dataKey: 'app_proto',
        type: TableCellTypeEnum.TEXT,
      },
      {
        name: 'Severity',
        dataKey: 'alert.severity',
        type: TableCellTypeEnum.SEVERITY,
      },
      {
        name: 'Signature',
        dataKey: 'alert.signature',
        type: TableCellTypeEnum.TEXT,
      },
      {
        name: 'Actions',
        dataKey: 'actions',
        type: TableCellTypeEnum.ACTIONS,
        isSortable: false,
        actions: [
          {
            name: 'list',
            label: 'Alert list',
            icon: 'list'
          },
          {
            name: 'delete',
            label: 'Alert delete',
            icon: 'delete',
            params: ['_id', 'alert.signature_id', 'src_ip'],
          }
        ],
      },
    ];
  }

  // redirect to alert list
  redirectToListAlert(data: any) {
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['/operator/detection/alerts-list'], {
        queryParams: {
          threat: data.threat,
          'alert.signature': data.alert.signature,
          src_ip: data.src_ip,
          dest_ip: data.dest_ip,
          dest_port: Number(data.dest_port),
          "alert.severity": Number(data.alert.severity)
        }
      })
    );

    window.open(url, '_blank');
  }

  expandableDetailsData = (data?: any) => {
    return [
      { key: 'Date', value: data?.timestamp, type: 'text' },
      { key: 'title', value: data?.alert?.signature, type: 'text' },
      {
        key: 'Offender',
        value: data?.src_ip,
        type: 'img',
        srcImg:
          'assets/images/' +
          data?.src_geoip?.geo?.country_iso_code?.toLowerCase() +
          '.svg',
      },
      { key: 'Protocol', value: data?.proto, type: 'text' },
      { key: 'Src Port', value: data?.src_port, type: 'text' },
      {
        key: 'Mitre Techniques',
        value: data?.mitre_techniques?.toString(),
        type: 'area',
      },
      {
        key: 'Victim',
        value: data?.dest_ip,
        type: 'img',
        srcImg:
          'assets/images/' +
          data?.dest_geoip?.geo?.country_iso_code?.toLowerCase() +
          '.svg',
      },
      { key: 'Dest Port', value: data?.dest_port, type: 'text' },
    ] as DetailField[];
  };


  // redirect to alert list
  getCellDatas(data: any) {
    switch (data.actionName) {
      case 'list':
        this.redirectToListAlert(data);
        break;
      case 'redirectToRule':
        this.redirectToRuleManagement(data);
        break;
      case 'delete':
        this.openDeleteModal(data)
        break;
      case 'checkbox':
        this._commonService.onToggleCheckbox(data, this.checkedIds);
        break;
      default:
        break;
    }
  }

  redirectToRuleManagement(data: any) {
    this._router.navigate(['/operator/parameters/rules/view-rules'], {
      queryParams: { sid: data.signature_id },
    });
  }

  // table actions
  tableActions(tableActions: AlertQueryParams) {
    this.alertQueryParams.update(() => ({
      ...this.alertQueryParams(),
      ...tableActions,
    }));
  }

  left = '85%';
  // Change time interval
  onTimeChange(value: number | string) {
    if (typeof value === 'number') {
      this.left = '85%';
      this.currentBeginDate.set(undefined);
      this.currentEndDate.set(undefined);
      this.currentTime.set(value);
    }
  }

  // Change time interval (custom)
  onCustomSelected(event: any) {
    this.currentBeginDate.set(event.beginDate);
    this.currentEndDate.set(event.endDate);
    this.left = '63%';
  }

  openDeleteModal(rowData?: any): void {
    this._deleteModalService.openAndDelete({
      rowData,
      checkedIds: this.checkedIds,
      deleteService: this._alertsService,
      refreshFn: () => {
        this.alertQueryParams.update(() => ({ ...this.alertQueryParams() }));
      }
    });
  }
}
