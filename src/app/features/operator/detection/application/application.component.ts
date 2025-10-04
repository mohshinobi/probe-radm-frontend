import {Component, computed, inject, signal} from '@angular/core';
import {AlertQueryParams, AlertsService, CommonService} from "@core/services";
import {BarChartInterface} from "@core/interfaces/charts/bar-chart.interface";
import {AreasplineComponent} from "@shared/components/graphs/areaspline/areaspline.component";
import {MatCard, MatCardContent} from "@angular/material/card";
import {PieComponent} from "@shared/components/graphs/pie/pie.component";
import {TableComponent} from "@shared/components/table/table.component";
import {BarComponent} from "@shared/components/graphs/bar/bar.component";
import {
  AreaSplineChartInterface,
  PieChartInterface,
  TableColumnInterface
} from "@core/interfaces";
import {TableCellTypeEnum} from "@core/enums";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AlertsFormService } from '@core/services/forms/alerts-form.service';
import { BaseField } from '@shared/components/form/fields';
import { map, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import {TimeSelectorComponent} from "@shared/components/time-selector/time-selector.component";
import {Point, Series} from "highcharts";
import {MatIcon} from "@angular/material/icon";
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatButton} from "@angular/material/button";
import {DeleteModalService} from "@shared/components/modal/modal-delete/service/modal-delete.service";
import {formatAreaSpline, formatPieAndColumn} from "@core/utils/graph-formater.util";
import {ApplicationService} from "@features/operator/detection/application/service/application.service";

@Component({
    selector: 'app-application',
    imports: [
        AreasplineComponent,
        MatCard,
        MatCardContent,
        PieComponent,
        TableComponent,
        BarComponent,
        ReactiveFormsModule,
        TimeSelectorComponent,
        MatIcon,
        MatTooltipModule,
        MatButton
    ],
    providers: [AlertsFormService],
    templateUrl: './application.component.html',
    styleUrl: './application.component.scss'
})
export class ApplicationComponent {
  private _alertsService = inject(AlertsService);
  private _applicationService = inject(ApplicationService);
  private _alertsFormService = inject(AlertsFormService);
  private _router = inject(Router);
  private _commonService = inject(CommonService);
  private _deleteModalService = inject(DeleteModalService);

  fields!: BaseField<string | number>[];
  title = 'Detection / by Application';

  length: number = 0;
  checkedIds: string[] = [];
  currentTime = signal(24);
  currentBeginDate = signal(undefined);
  currentEndDate = signal(undefined);
  timeFilterOptions = [
    { value: 1, label: 'Last hour' },
    { value: 12, label: 'Last 12H' },
    { value: 24, label: 'Last 24H' },
    { value: 'Custom', label: 'Custom' },
  ];

  displayedColumns = [
    '_id',
    '@timestamp',
    'alert.signature',
    'alert.signature_id',
    'alert.category',
    'threat',
    'alert.severity',
    'src_geoip.geo.country_iso_code',
    'src_ip',
    'dest_geoip.geo.country_iso_code',
    'dest_ip',
    'dest_port',
    'flow_id',
    'src_port',
    'proto',
    'app_proto',
    'community_id',
  ];

  constructor() {
    this.fields = this._alertsFormService.getFormFields();
  }

  alertsByPort = toSignal(
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

        return this._applicationService.getCountByPortDest(interval, begin, end).pipe(map(buckets => formatPieAndColumn(buckets)))
      })
    )
  );

  alertsByAppProto = toSignal(
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

        return this._applicationService.getAreaAlertByAppProto(interval, begin, end).pipe(map(data => formatAreaSpline(data)))
      })
    )
  );

  topPortByAlerts = toSignal(
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

        return this._alertsService.getTopAppByPort(interval, begin, end).pipe(map(data => formatPieAndColumn(data)))
      })
    )
  );

  alertQueryParams = signal<AlertQueryParams>({
    display_col: this.displayedColumns,
  });
  form = signal<FormGroup<any>>(this._applicationService.getFormGroup());

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

  readonly alertsByPortPieChartOption = computed<PieChartInterface>(() => {
    const data = this.alertsByPort();
    let total =
      data && data.length > 0
        ? data.reduce((sum: any, item: { y: any }) => sum + (item.y || 0), 0)
        : '';

    return {
      data: data,
      height: '297px',
      colors: [
        '#FFC107',
        '#8BC34A',
        '#9C27B0',
        '#03A9F4',
        '#E5E5EA',
        '#FF9800',
        '#4CAF50',
        '#673AB7',
        '#2196F3',
        '#F7DC6F',
      ],
      label: 'Requests',
      backgroundColor: '#1F1F1F',
      innerSize: '85%',
      subtitle: {
        useHTML: true,
        text: `<span title="${total}">${total.length > 10 ? total.slice(0, 10) + '...' : total}</span>`,
        floating: true,
        verticalAlign: 'middle',
        align: 'center',
        x: -60,
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
        navigation: {
          activeColor: '#ff886a',
          style: {
            color: 'white',
          },
        },
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

  readonly alertsByAppProtoAreaChartOption = computed<AreaSplineChartInterface>(
    () => {
      const data = this.alertsByAppProto();
      if (!data) {
        return {} as AreaSplineChartInterface;
      }

      return {
        label: 'Alerts',
        data: data,
        colors: [
          '#ffa78f',
          '#f89200',
          '#ec72eb',
          '#9999ff',
          '#45efa9',
          '#7DC2A5',
          '#e9c46a',
          '#CE6A6B',
          '#e76f51',
          '#B36A5E',
          '#C5C6C6',
        ],
      };
    }
  );

  readonly topPortBarChartOption = computed<BarChartInterface>(() => {
    return {
      color: '#8569FE',
      data: this.topPortByAlerts(),
      backgroundColor: '#1f1f1f',
    };
  });

  get ordersTableColumns(): TableColumnInterface[] {
    return [
      { name: '', dataKey: '_id', type: TableCellTypeEnum.CHECKBOX2 },
      { name: 'Seen', dataKey: '@timestamp', type: TableCellTypeEnum.DATE },
      {
        name: 'Signature',
        dataKey: 'alert.signature',
        type: TableCellTypeEnum.TEXT,
      },
      {
        name: 'Category',
        dataKey: 'alert.category',
        type: TableCellTypeEnum.TEXT,
      },
      { name: 'Threat', dataKey: 'threat', type: TableCellTypeEnum.TEXT },
      {
        name: 'Severity',
        dataKey: 'alert.severity',
        type: TableCellTypeEnum.SEVERITY,
      },
      { name: 'App Proto', dataKey: 'app_proto', type: TableCellTypeEnum.TEXT },
      { name: 'Src IP', dataKey: 'src_ip', type: TableCellTypeEnum.FLAG },
      { name: 'SRC PORT', dataKey: 'src_port', type: TableCellTypeEnum.TEXT },
      { name: 'Dest IP', dataKey: 'dest_ip', type: TableCellTypeEnum.FLAG },
      { name: 'Dest Port', dataKey: 'dest_port', type: TableCellTypeEnum.TEXT },
      {
        name: 'Actions',
        dataKey: 'actions',
        type: TableCellTypeEnum.ACTIONS,
        isSortable: false,
        actions: [
          {
            name: 'details',
            label: 'Alert details',
            icon: 'list',
            params: ['community_id'],
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

  tableActions(tableActions: AlertQueryParams) {
    this.alertQueryParams.update(() => ({
      ...this.alertQueryParams(),
      ...tableActions,
    }));
  }

  getCellDatas(data: any) {
    switch (data.actionName) {
      case 'details':
        this.redirectToDetailAlert(data);
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

  redirectToDetailAlert(data: any) {
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['/operator/detection/alerts-list'], {
        queryParams: {
          threat: data.threat,
          'alert.signature': data.alert.signature,
          src_ip: data.src_ip,
          dest_ip: data.dest_ip,
        }
      })
    );

    window.open(url, '_blank');
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

  left = '85%';
  // Change time interval (1h, 12h, 24h)
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
}
