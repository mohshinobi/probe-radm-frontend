import {Component, computed, inject, signal} from '@angular/core';
import {AreasplineComponent} from "@shared/components/graphs/areaspline/areaspline.component";
import {MatCard, MatCardContent} from "@angular/material/card";
import {StackedColumnComponent} from "@shared/components/graphs/stacked-column/stacked-column.component";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";
import {AlertQueryParams, AlertsService, CommonService} from "@core/services";
import {AreaSplineChartInterface, TableColumnInterface} from "@core/interfaces";
import {TableCellTypeEnum} from "@core/enums";
import {TableComponent} from "@shared/components/table/table.component";
import {BarChartInterface} from "@core/interfaces/charts/bar-chart.interface";
import {BarComponent} from "@shared/components/graphs/bar/bar.component";
import {StackedColumnInterface} from "@core/interfaces/charts/stacked-column.interface";
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { map, switchMap } from 'rxjs';
import { AlertsFormService } from '@core/services/forms/alerts-form.service';
import { BaseField } from '@shared/components/form/fields';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import {TimeSelectorComponent} from "@shared/components/time-selector/time-selector.component";
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import {DeleteModalService} from "@shared/components/modal/modal-delete/service/modal-delete.service";
import {MatButton} from "@angular/material/button";
import {formatAreaSpline, formatPieAndColumn} from "@core/utils/graph-formater.util";

@Component({
    selector: 'app-rule',
    imports: [
        AreasplineComponent,
        MatCard,
        MatCardContent,
        TableComponent,
        BarComponent,
        StackedColumnComponent,
        ReactiveFormsModule,
        MatIcon,
        CommonModule,
        TimeSelectorComponent,
        MatTooltipModule,
        MatButton,
    ],
    providers: [AlertsFormService],
    templateUrl: './rule.component.html',
    styleUrl: './rule.component.scss'
})
export class RuleComponent {
  // Injection des services
  private _alertsService = inject(AlertsService);
  private _commonService = inject(CommonService);
  private _alertsFormService = inject(AlertsFormService);
  private _router = inject(Router);
  private _deleteModalService = inject(DeleteModalService);

  // Initialisation des variables
  title = 'Detection / Rules';
  fields!: BaseField<string | number>[];
  currentTime = signal(24);
  currentBeginDate = signal(undefined);
  currentEndDate = signal(undefined);
  readonly noDataArray = Array(5).fill(0);
  //Option du bloc time filter
  timeFilterOptions = [
    { value: 1, label: 'Last hour' },
    { value: 12, label: 'Last 12H' },
    { value: 24, label: 'Last 24H' },
    { value: 'Custom', label: 'Custom' },
  ];

  length: number = 0;

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
    'src_port',
    'dest_ip',
    'dest_geoip.geo.country_iso_code',
    'dest_port',
    'app_proto',
    'community_id',
  ];
  checkedIds: string[] = [];

  constructor() {
    this.fields = this._alertsFormService.getFormFields();
  }

  // Stacked column chart data
  stackedFlows = toSignal(this._alertsService.getStackedColumnFlows());

  // Bar chart -  data
  barFlows = toSignal(
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

        return this._alertsService.getFlowTopBySid2(interval, begin, end).pipe(map(data => formatPieAndColumn(data)));
      })
    )
  );

  // Areaspline chart - data
  areaFlows = toSignal(
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

        return this._alertsService.getAreaAlertBySid(interval, begin, end).pipe(map(data => formatAreaSpline(data)));
      })
    )
  );


  // Table params
  alertQueryParams = signal<AlertQueryParams>({
    display_col: this.displayedColumns,
  });

  // Formulaire de filtre du tableau
  form = signal<FormGroup<any>>(this._alertsFormService.getFormGroup());

  // Table data
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

  // Stacked column chart
  readonly flowsStackedChartOptions = computed<StackedColumnInterface>(() => {
    let data = this.stackedFlows();

    if (!data) {
      return {};
    }

    return {
      title: '',
      data: this.stackedFlows(),
      categories: this._commonService.date(),
    };
  });

  // Bar chart
  readonly flowsBarChartOption = computed<BarChartInterface>(() => ({
    title: '',
    color: '#8569FE',
    backgroundColor: '#1F1F1F',
    data: this.barFlows(),
  }));

  // Areaspline chart
  readonly flowsAreaChartOption = computed<AreaSplineChartInterface>(() => ({
    title: '',
    label: 'Threat',
    data: this.areaFlows(),
    colors: [
      '#ffa78f',
      '#f89200',
      '#ec72eb',
      '#9999ff',
      '#45efa9',
      '#400000',
      '#00C000',
      '#C000C0',
      '#00C0C0',
      '#C0C0C0',
      '#004040',
      '#404040',
      '#200000',
      '#002000',
    ],
  }));

  // Tableau columns
  get ordersTableColumns(): TableColumnInterface[] {
    return [
      { name: '', dataKey: '_id', type: TableCellTypeEnum.CHECKBOX2 },
      { name: 'SEEN', dataKey: '@timestamp', type: TableCellTypeEnum.DATE },
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
      { name: 'SRC IP', dataKey: 'src_ip', type: TableCellTypeEnum.FLAG },
      { name: 'SRC PORT', dataKey: 'src_port', type: TableCellTypeEnum.TEXT },
      { name: 'SID', dataKey: 'alert.signature_id', type: TableCellTypeEnum.TEXT },
      { name: 'Dest Ip', dataKey: 'dest_ip', type: TableCellTypeEnum.FLAG },
      { name: 'App Proto', dataKey: 'app_proto', type: TableCellTypeEnum.TEXT },
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

  // Tableau redirect si c'est details
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

  // Redirect to alert list
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

  // Tableau actions
  tableActions(tableActions: AlertQueryParams) {
    this.alertQueryParams.update(() => ({
      ...this.alertQueryParams(),
      ...tableActions,
    }));
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
