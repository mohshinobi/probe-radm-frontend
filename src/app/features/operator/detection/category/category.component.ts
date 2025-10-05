import {Component, computed, inject, signal} from '@angular/core';
import {AreasplineComponent} from "@shared/components/graphs/areaspline/areaspline.component";
import {MatCard, MatCardContent} from "@angular/material/card";
import {PieComponent} from "@shared/components/graphs/pie/pie.component";
import {TableComponent} from "@shared/components/table/table.component";
import {AlertQueryParams, AlertsService, CommonService} from "@core/services";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";
import {AreaSplineChartInterface, PieChartInterface, TableColumnInterface} from "@core/interfaces";
import {TableCellTypeEnum} from "@core/enums";
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BaseField } from '@shared/components/form/fields';
import { map, switchMap } from 'rxjs';
import { CategoryFormService } from '@core/services/forms/category-form.service';
import { Router } from '@angular/router';
import {TimeSelectorComponent} from "@shared/components/time-selector/time-selector.component";
import {Point, Series} from "highcharts";
import {MatIcon} from "@angular/material/icon";
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatButton} from "@angular/material/button";
import {DeleteModalService} from "@shared/components/modal/modal-delete/service/modal-delete.service";
import {formatAreaSpline, formatPieAndColumn} from "@core/utils/graph-formater.util";
import { PageHeaderComponent } from "@layout/header/page-header.component";

@Component({
    selector: 'app-category',
    templateUrl: './category.component.html',
    styleUrl: './category.component.scss',
    imports: [
    AreasplineComponent,
    MatCard,
    MatCardContent,
    PieComponent,
    TableComponent,
    ReactiveFormsModule,
    TimeSelectorComponent,
    MatIcon,
    MatTooltipModule,
    MatButton,
    PageHeaderComponent
],
    providers: [CategoryFormService]
})
export class CategoryComponent {
  private _alertsService = inject(AlertsService);
  private _categoryForm = inject(CategoryFormService);
  private _router = inject(Router);
  private _deleteModalService = inject(DeleteModalService);
  private _commonService = inject(CommonService);

  fields!: BaseField<string | number>[];
  title = 'Detection / by Category';
  checkedIds: string[] = [];

  length: number = 0;
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
    'app_proto',
    'community_id',
  ];

  private _colors = [
    '#FFC107',
    '#8DC34A',
    '#9C27B0',
    '#ff7f4c',
    '#FF00BF',
    '#0072ff',
    '#ff0000',
    "#6a26b0",
    "#ff4c4e",
    "#26a8b0",
    "#ad4cff",
    "#4D7851",
    "#00FFA0",
    "#663300",
    "#CC6600",
    "#444444",
    "#33CC33",
    "#008844"

  ];

  constructor() {
    this.fields = this._categoryForm.getFormFields();
  }

  requestAlert = toSignal(
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

        return this._alertsService.getRequestAlertsByCategory(interval, begin, end);
      })
    )
  );

  alertsByCategories = toSignal(
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

        return this._alertsService.getAreaAlertByCat(interval, begin, end);
      })
    )
  );

  alertQueryParams = signal<AlertQueryParams>({
    display_col: this.displayedColumns,
  });
  form = signal<FormGroup<any>>(this._categoryForm.getFormGroup());

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

  alertsByCategorieAreaGraphOptions = computed<AreaSplineChartInterface>(() => {
    const raw = this.alertsByCategories();

      return {
        label: 'Alerts',
        data: raw? formatAreaSpline(raw): [],
        colors: this._colors.map((_, i) => this._colors[i]),
      }
    }
  );

  readonly alertsRequestPieChartOptions = computed<PieChartInterface>(() => {
    const raw = this.requestAlert();
    const data = raw ? formatPieAndColumn(raw): [];
    let total = data && data.length > 0 ? data.reduce((sum, item: { y: any; }) => sum + (item.y || 0), 0).toString() : '';

    return {
      data: data,
      height: '297px',
      colors: this._colors.map((_, i) => this._colors[i]),
      label: 'Requests',
      backgroundColor: '#1F1F1F',
      innerSize: '85%',
      subtitle: {
        useHTML: true,
        text: `<span title="${total}">${total.length > 10 ? total.slice(0, 10) + '...' : total}</span>`,
        floating: true,
        verticalAlign: 'middle',
        x: -120,
        y: 35,
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
        navigation: {
          activeColor: '#ff886a',
          style: {
            color: 'white',
            fontSize: total.toString().length > 8 ? '18px' : total.toString().length > 5 ? '22px' : '28px',
            cursor: 'pointer',
          }
        },
        itemStyle: {
          color: 'white',
        },
        itemWidth: 200,
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

  get ordersTableColumns(): TableColumnInterface[] {
    return [
      { name: '', dataKey: '_id', type: TableCellTypeEnum.CHECKBOX2 },
      { name: 'SEEN', dataKey: '@timestamp', type: TableCellTypeEnum.DATE },
      {
        name: 'SIGNATURE',
        dataKey: 'alert.signature',
        type: TableCellTypeEnum.TEXT
      },
      {
        name: 'CATEGORY',
        dataKey: 'alert.category',
        type: TableCellTypeEnum.TEXT
      },
      {
        name: 'THREAT',
        dataKey: 'threat',
        type: TableCellTypeEnum.TEXT
      },
      {
        name: 'SEVERITY',
        dataKey: 'alert.severity',
        type: TableCellTypeEnum.SEVERITY
      },
      {
        name: 'SRC IP',
        dataKey: 'src_ip',
        type: TableCellTypeEnum.FLAG
      },
      {
        name: 'App Proto',
        dataKey: 'app_proto',
        type: TableCellTypeEnum.TEXT,
      },
      {
        name: 'DEST IP',
        dataKey: 'dest_ip',
        type: TableCellTypeEnum.FLAG
      },
      {
        name: 'DEST PORT',
        dataKey: 'dest_port',
        type: TableCellTypeEnum.TEXT
      },
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
            params: ['alert.signature', 'src_ip', 'dest_ip'],
          },
          {
            name: 'delete',
            label: 'Alert delete',
            icon: 'delete',
            params: ['_id', 'alert.signature_id', 'src_ip'],
          },
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
          app_proto: data.app_proto
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
