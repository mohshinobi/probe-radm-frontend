import {Component, computed, inject, OnInit, signal} from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { WorldMapComponent } from '@shared/components/graphs/world-map/world-map.component';
import {AlertQueryParams, AlertsService, CommonService} from '@core/services';
import {MapChartInterface, PieChartInterface, TableColumnInterface} from '@core/interfaces';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TableCellTypeEnum } from '@core/enums';
import { map, switchMap } from 'rxjs';
import { BaseField } from '@shared/components/form/fields';
import { TableComponent } from '@shared/components/table/table.component';
import { Router } from '@angular/router';
import {TimeSelectorComponent} from "@shared/components/time-selector/time-selector.component";
import { FormGroup } from '@angular/forms';
import { SourceFormService } from '@core/services/forms/source-form.service';
import { BarChartInterface } from '@core/interfaces/charts/bar-chart.interface';
import { BarComponent } from "@shared/components/graphs/bar/bar.component";
import { MatIconModule } from '@angular/material/icon';
import { PieComponent } from '@shared/components/graphs/pie/pie.component';
import { DetailField } from '@shared/components/table/detail/detail.component';
import { SourceService } from './source.service';
import {DeleteModalService} from "@shared/components/modal/modal-delete/service/modal-delete.service";
import {MatButton} from "@angular/material/button";
import { MatTooltipModule } from '@angular/material/tooltip';
import {formatPieAndColumn} from "@core/utils/graph-formater.util";

@Component({
    selector: 'app-source',
    imports: [
        MatCard,
        MatCardContent,
        WorldMapComponent,
        TableComponent,
        TimeSelectorComponent,
        BarComponent,
        MatIconModule,
        PieComponent,
        MatButton,
        MatTooltipModule
    ],
    templateUrl: './source.component.html',
    styleUrl: './source.component.scss'
})
export class SourceComponent implements OnInit{
  private _alertsService = inject(AlertsService);
  private _sourceService = inject(SourceService);
  private _sourceFormService = inject(SourceFormService);
  private _router = inject(Router);
  private _commonService = inject(CommonService);
  private _deleteModalService = inject(DeleteModalService);

  title = 'Detection / by Source';

  fields!: BaseField<string | number>[];
  afterkey = signal<{ [key: string]: string } | null>(null);
  afterKeyPageMap = signal<any[]>([]);
  private isBackNavigation = false;

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

  form = signal<FormGroup<any>>(this._sourceFormService.getFormGroup());

  ngOnInit() {
    //fix default value filter
    const endDate = new Date();
    const endDateStr = `${endDate.getFullYear()}-${String(
      endDate.getMonth() + 1
    ).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}T${String(
      endDate.getHours()
    ).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    // Date de début : 24 heures avant maintenant
    const startDate = new Date(endDate);
    startDate.setHours(startDate.getHours() - 24);
    const startDateStr = `${startDate.getFullYear()}-${String(
      startDate.getMonth() + 1
    ).padStart(2, '0')}-${String(startDate.getDate()).padStart(
      2,
      '0'
    )}T${String(startDate.getHours()).padStart(2, '0')}:${String(
      startDate.getMinutes()
    ).padStart(2, '0')}`;

    this.form.update((form) => {
      form.patchValue({
        startDate: startDateStr,
        endDate: endDateStr,
      });
      return form;
    });

    //url
    this.alertsQueryParams.update(() => ({
      ...this.alertsQueryParams(),
      startDate: startDateStr,
      endDate: endDateStr,
    }));
  }

  displayedColumns = [
    '_id',
    '@timestamp',
    'alert.signature',
    'alert.signature_id',
    'app_proto',
    'src_geoip.geo.country_iso_code',
    'src_ip',
    'src_port',
    'alert_count',
  ];

  sourceDetails = signal([] as DetailField[]);

  constructor() {
    this.fields = this._sourceFormService.getFormFields();
  }

  alertsQueryParams = signal<AlertQueryParams>({
    display_col: this.displayedColumns,
    size: 100,
  });

  get ordersTableColumns(): TableColumnInterface[] {
    return [
      { name: '', dataKey: '_id', type: TableCellTypeEnum.CHECKBOX2 },
      { name: 'SEEN', dataKey: '@timestamp', type: TableCellTypeEnum.DATE, isSortable: false },
      {
        name: 'Signature',
        dataKey: 'alert.signature',
        type: TableCellTypeEnum.TEXT,
        isSortable: false
      },
      {
        name: 'SRC IP',
        dataKey: 'src_ip',
        type: TableCellTypeEnum.FLAG,
        isSortable: false
      },
      {
        name: 'SRC PORT',
        dataKey: 'src_port',
        type: TableCellTypeEnum.TEXT,
        isSortable: false
      },
      {
        name: 'Alerts Numbers',
        dataKey: 'alert_count',
        type: TableCellTypeEnum.COUNT,
        isSortable: false
      },
      {
        name: 'Actions',
        dataKey: 'actions',
        type: TableCellTypeEnum.ACTIONS,
        isSortable: false,
        actions: [
          {
            name: 'details',
            label: 'Alert list',
            icon: 'list',
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

  alerts = toSignal(
    toObservable(this.alertsQueryParams).pipe(
      switchMap(() => {
        return this._sourceService
          .getAllAlertsForSourceTable({
            ...this.alertsQueryParams(),
            after: this.alertsQueryParams().after || undefined,
          })
          .pipe(
            map((response) => {
              this.length = response.total;
              // verifier le sene de la pgination
              if (!this.isBackNavigation && response.after_key) {
                this.afterkey.set(response.after_key || null);
              }
              return response.data;
            })
          );
      })
    )
  );

  tableActions(tableActions: AlertQueryParams) {
    const currentPage = tableActions.page ?? 0;
    const previousPage = tableActions.pagePrevious ?? 0;
    delete tableActions.pagePrevious;

    let afterKey: any;

    // Determines what logic to use based on the current page.
    if (currentPage > 1) {
      // If we navigate to a page other than the first, manages the navigation in the pagination.
      afterKey = this.handlePaginationNavigation(currentPage, previousPage);
    } else {
      // If we are on the first page, no "after" key is required.
      afterKey = this.handleFirstPage();
    }

    this.updateQueryParams(tableActions, afterKey, currentPage);
  }

  handlePaginationNavigation(currentPage: number, previousPage: number): any {
    const afterKeyString = JSON.stringify(this.afterkey());

    if (previousPage < currentPage) {
      // If we move forward in the pagination
      return this.handleForwardPagination(afterKeyString, currentPage);
    } else {
      // If we go back in the pagination
      return this.handleBackwardPagination();
    }
  }

  handleForwardPagination(afterKeyString: string, currentPage: number): any {
    // Updates the afterKeyPageMap with the new "after" key and the current page.
    this.afterKeyPageMap.update((map) => {
      map.push({ afterKeyString, currentPage });
      return map;
    });
    return this.afterkey();
  }

  handleBackwardPagination(): any {
    // Retrieve the list of saved "after" keys.
    const arrayKeys: any[] = this.afterKeyPageMap() as any[];
    this.isBackNavigation = true;

    if (arrayKeys.length > 0) {
      let afterKey = arrayKeys[arrayKeys.length - 2]?.afterKeyString;

      if (afterKey && typeof afterKey === 'string') {
        try {
          afterKey = JSON.parse(afterKey);
        } catch (error) {
          console.error('Erreur de parsing JSON pour afterKey', error);
        }
      }
      // Delete the current "after" key from the array as we are going backwards.
      this.afterKeyPageMap.update((map) => {
        map.pop();
        return map;
      });
      return afterKey;
    }

    return undefined;
  }

  handleFirstPage(): any {
    this.isBackNavigation = false;
    return undefined;
  }

  updateQueryParams(
    tableActions: AlertQueryParams,
    afterKey: any,
    currentPage: number
  ): void {
    this.alertsQueryParams.update(() => ({
      ...this.alertsQueryParams(),
      ...tableActions,
      after: currentPage > 1 ? afterKey : undefined,
    }));
  }

  getCellDatas(data: any) {
    switch (data.actionName) {
      case 'details':
        this.redirectToListAlert(data);
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


  redirectToListAlert(data: any) {
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['/operator/detection/alerts-list'], {
        queryParams: {
          src_port: data.src_port,
          src_ip: data.src_ip,
          'alert.signature': data.alert.signature,
          app_proto: data.app_proto
        }
      })
    );

    window.open(url, '_blank');
  }

  topAlertsByCountrey = toSignal(
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

        return this._sourceService.getTopAlertsByCountry(interval, begin, end).pipe(map(data => formatPieAndColumn(data)));
      })
    )
  );

  readonly alertsByCountry = computed<BarChartInterface>(() => ({
    title: undefined,
    data: this.topAlertsByCountrey(),
    color: '#8569FE',
    height: '222px',
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

  topSourceMap = toSignal(
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

        return this._sourceService.getWorldMapSourceData(interval, begin, end);
      })
    )
  );

  readonly topSourceMapChartOptions = computed<MapChartInterface>(() => ({
    title: '',
    height:'300',
    color: '#FF0000',
    hoverColor: '#FFF73F',
    label: 'Requests',
    data: this.topSourceMap(),
  }));

  alertsSevPie = toSignal(
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

        return this._sourceService.getThreatBySource(interval, begin, end).pipe(
          map((alerts) =>
            alerts
              .map((alert: any) => ({
                ...alert,
                label: ` Source: ${alert.name}, Top Threat: ${alert.src_country}, Threat Count`,
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
    if (!data || data.length === 0) {
      return {
        data: [],
        height: '297px',
        label: 'No data available',
        backgroundColor: '#1F1F1F',
        innerSize: '85%',
        subtitle: { text: '0', useHTML: true },
        legendOption: { enabled: false },
        dataLabelsOption: { enabled: false },
      };
    }

    let total = data && data.length > 0 ? data.reduce((sum, item) => sum + (item.y || 0), 0) : '';

    return {
      data: data,
      height: '297px',
      colors: ['#F44949', '#FF6633', '#F89200', '#FFC080', '#F89278'],
      label: `threat: `,
      backgroundColor: '#1F1F1F',
      innerSize: '85%',
      subtitle: {
        useHTML: true,
        text: total.toString(),
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
        itemStyle: {
          color: 'white',
        },
        itemWidth: 200,
        itemMarginBottom: 20,
        padding: 10,
        labelFormatter: function (this: any): string {
          if (this?.label && this?.y !== undefined) {
            return `${this.label}: ${this.y}`;
          }
          return '';
        },
      },
      dataLabelsOption: { enabled: false },
    };
  });

  srcIpSignal = signal('');

  getDetailsParams = (data: any) => {
    this.srcIpSignal.set(data.src_ip);
    // Fetch details for the provided source IP and set them
    this.fetchAndSetDetails(data);
  };

  fetchAndSetDetails(data: any) {
    this._sourceService.getDetailsSource(this.srcIpSignal()).subscribe(
      (response: any) => {
        // Format the fetched details with additional data
        const formattedDetails = this.formatDetailsData(data, response);
        // Update the source details with the formatted data
        this.sourceDetails.set(formattedDetails);
      },
      (error) => {
        console.error('Error fetching details:', error);
      }
    );
  }

  formatDetailsData(data: any, response: any): DetailField[] {
    return [
      { key: 'Date', value: data?.['@timestamp'], type: 'text' },
      { key: 'Source IP', value: data.src_ip || 'Unknown', type: 'text' },
      {
        key: 'Total Connections',
        value: response?.data?.total_connections?.toString() || '0',
        type: 'text',
      },
      {
        key: 'Top 10 Destination IPs with Their Details',
        value: this.formatDestinations(response?.data?.destinations),
        type: 'area',
      },
      {
        key: 'Severity',
        value: this.formatSeverityLevels(response?.data?.severity_levels),
        type: 'area',
      },
      {
        key: 'Source Location',
        value: response?.data?.country || 'Unknown',
        type: 'img',
        srcImg: `assets/images/${
          response?.data?.country?.toLowerCase() || 'unknown'
        }.svg`,
      },
    ];
  }

  // Formater destinations array to String
  formatDestinations(destinations: any[]): string {
    return destinations
      ? destinations
          .map(
            (dest: any) =>
              `IP: ${dest.dest_ip}, Connections: ${
                dest.total_connections
              }, Ports: ${dest.ports.join(', ')}, Protocols: ${
                dest.protocols.length > 0
                  ? dest.protocols.join(', ')
                  : 'No protocols'
              }`
          )
          .join('\n')
      : 'No destinations available';
  }

  // Formater Severity array to String
  formatSeverityLevels(severityLevels: any[]): string {
    return severityLevels
      ? severityLevels
          .map(
            (level: any) => `Severity ${level.severity}: Count ${level.count}`
          )
          .join('\n')
      : 'No severity levels available';
  }

  openDeleteModal(rowData?: any): void {
    this._deleteModalService.openAndDelete({
      rowData,
      checkedIds: this.checkedIds,
      deleteService: this._alertsService,
      refreshFn: () => {
        this.alertsQueryParams.update(() => ({ ...this.alertsQueryParams() }));
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
