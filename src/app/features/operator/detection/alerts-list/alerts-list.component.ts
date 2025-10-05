import { CommonModule } from '@angular/common';
import {Component, computed, inject, signal, ViewChild, OnInit, AfterViewInit} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { TableCellTypeEnum } from '@core/enums';
import {
  AreaChartInterface,
  PieChartInterface,
  TableColumnInterface,
} from '@core/interfaces';
import {AlertQueryParams, AlertsService, CommonService} from '@core/services';
import { AlertsFormService } from '@core/services/forms/alerts-form.service';
import { BaseField } from '@shared/components/form/fields';
import { ChipFilterDataInterface, TableComponent } from '@shared/components/table/table.component';
import { map, switchMap } from 'rxjs';
import { TimelineComponent } from '@shared/components/timeline/timeline.component';
import { PieComponent } from '@shared/components/graphs/pie/pie.component';
import { AreaComponent } from '@shared/components/graphs/area/area.component';
import { InfiniteScrollComponent } from '@shared/components/infinite-scroll/infinite-scroll.component';
import { TimeSelectorComponent } from "@shared/components/time-selector/time-selector.component";
import { DeleteModalService } from "@shared/components/modal/modal-delete/service/modal-delete.service";
import {AlertListService} from "@features/operator/detection/alerts-list/service/alert-list.service";
import { PageHeaderComponent } from "@layout/header/page-header.component";

@Component({
    selector: 'app-alerts-list',
    imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    TableComponent,
    CommonModule,
    MatIconModule,
    TimelineComponent,
    PieComponent,
    AreaComponent,
    InfiniteScrollComponent,
    TimeSelectorComponent,
    PageHeaderComponent
],
    providers: [AlertsFormService],
    templateUrl: './alerts-list.component.html',
    styleUrl: './alerts-list.component.scss'
})
export class AlertsListComponent implements OnInit,AfterViewInit {
  private _alertsService = inject(AlertsService);
  private _alertListService = inject(AlertListService);
  private _router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private _deleteModalService = inject(DeleteModalService);
  private _commonService = inject(CommonService);

  deleteAllAlertsBySignature = false;
  deleteAllAlertsBySource = false;
  checkedIds: string[] = [];

  showTimeline: boolean = false;
  selectedEvents = signal<any[]>([]);
  severityEvents = signal<any[]>([]);
  selectedAlertTimestamp = signal<number | null>(null);
  selectedDestport: string | undefined = undefined;
  selectedDestIp: string | undefined = undefined;
  selectedSrcIp: string | undefined = undefined;
  selectedSignature_id: number | undefined = undefined;
  selectedRev: number | undefined = undefined;
  totalItems: number | null = null;
  itemsLoaded = 0;
  private isBackNavigation = false;

  currentTime = signal(168);

  fields!: BaseField<string | number>[];
  title = 'Alerts list';

  length: number = 0;
  afterkey = signal<{ [key: string]: string } | null>(null);
  beforkey = signal<{ [key: string]: string } | null>(null);
  afterKeyPageMap = signal<any[]>([]);
  currentPage = 1;
  hasMorePages = true;
  isLoading = false;
  @ViewChild("tableComponent") tableComponent!: TableComponent;
  displayedColumns = [
    '_id',
    'timestamp',
    'alert.signature',
    'alert_count',
    'threat',
    'proto',
    'src_ip',
    'dest_ip',
    'dest_port',
    'host.name',
    'app_proto',
    'alert.severity',
    'src_geoip.geo.country_iso_code',
    'dest_geoip.geo.country_iso_code',
    'community_id',
    'alert.signature_id',
    'alert.rev',
  ];

  displayeDataline = [
    'timestamp',
    '_id',
    'alert.signature',
    'src_ip',
    'dest_ip',
    'alert.severity',
    'community_id',
    'alert.signature_id',
    'alert.rev',
  ];
  selectedTimestamp: any;
  lastData: any;
  firstData: any;
  url: string = '';
  startDate: string = '';
  endDate: string = '';
  deleteByDate: boolean = false;

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

     // Mettre à jour le formulaire avec les nouvelles valeurs
     this.form.update((form) => {
       form.patchValue({
         startDate: startDateStr,
         endDate: endDateStr,
       });
       return form;
     });


   //url
    this.url = this._router.url;
    this.alertsQueryParams.update(() => ({
      ...this.alertsQueryParams(),
      ...this.activatedRoute.snapshot.queryParams,
      startDate: startDateStr,
      endDate: endDateStr,
    }));
  }

  ngAfterViewInit() {
    const querParams = this.activatedRoute.snapshot.queryParams;
    const params : ChipFilterDataInterface[] = [];
    for ( let key in querParams){
      params.push({key:key,value: querParams[key], columnName:key} )
    }
    if( params.length > 0 ) this.tableComponent.chipFilterData.set(params);
  }

  constructor() {
    this.fields = this._alertListService.getFormFields();
  }

  alertsQueryParams = signal<AlertQueryParams>({
    display_col: this.displayedColumns,
    after: this.afterkey(),
    size:100
  });

  alertsQueryParamsline = signal<AlertQueryParams>({
    display_col: this.displayeDataline,
    sortedBy: 'timestamp',
  });

  form = signal<FormGroup<any>>(this._alertListService.getFormGroup());

  alerts = toSignal(
    toObservable(this.alertsQueryParams).pipe(
      switchMap(() => {
        this.alertsQueryParams().display_col = this.displayedColumns;
        return this._alertListService
          .getAllAlertsForTable({
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

  get ordersTableColumns(): TableColumnInterface[] {
    return [
      { name: '', dataKey: '_id', type: TableCellTypeEnum.CHECKBOX2 },
      {
        name: 'SEEN',
        dataKey: 'timestamp',
        type: TableCellTypeEnum.DATE,
        isSortable: false
      },
      {
        name: 'SIGNATURE',
        dataKey: 'alert.signature',
        type: TableCellTypeEnum.TEXT,
        filtarable: true,
        isSortable: false
      },
      { name: 'COUNT', dataKey: 'alert_count', type: TableCellTypeEnum.COUNT, isSortable: false },
      {
        name: 'THREAT',
        dataKey: 'threat',
        type: TableCellTypeEnum.TEXT,
        filtarable: true,
        isSortable: false
      },
      {
        name: 'Protocol',
        dataKey: 'proto',
        type: TableCellTypeEnum.TEXT,
        filtarable: true,
        isSortable: false
      },
      {
        name: 'SRC IP',
        dataKey: 'src_ip',
        type: TableCellTypeEnum.FLAG,
        filtarable: true,
        isSortable: false
      },
      {
        name: 'DEST IP',
        dataKey: 'dest_ip',
        type: TableCellTypeEnum.FLAG,
        filtarable: true,
        isSortable: false
      },
      {
        name: 'DEST PORT',
        dataKey: 'dest_port',
        type: TableCellTypeEnum.TEXT,
        filtarable: true,
        isSortable: false
      },
      {
        name: 'HOSTNAME',
        dataKey: 'host.name',
        type: TableCellTypeEnum.TEXT,
        filtarable: true,
        isSortable: false
      },
      {
        name: 'App Proto',
        dataKey: 'app_proto',
        type: TableCellTypeEnum.TEXT,
        filtarable: true,
        isSortable: false
      },
      {
        name: 'SEVERITY',
        dataKey: 'alert.severity',
        type: TableCellTypeEnum.SEVERITY,
        filtarable: true,
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
            label: 'Alert details',
            icon: 'visibility',
            params: ['_id'],
          },
          {
            name: 'timeLine',
            label: 'timeLine',
            icon: 'date_range',
            params: ['src_ip', 'dest_ip', 'alert.signature_id', 'alert.rev'],
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
        this.redirectToDetailAlert(data);
        break;
      case 'delete':
        this.openDeleteModal(data)
        break;
      case 'timeLine':
        this.showTimeline = true;
        this.showTimelineForAlert(
          data.src_ip,
          data.dest_ip,
          data.alert.signature_id,
          data.alert.rev,
          data.timestamp,
          data.alert.signature,
          data.alert.severity
        );
        this.highlightAlertInLineGraph(data.timestamp);
        // focus on timeline card with id timeline
        this.scrollToElement('timeline');
        break;
      case 'checkbox':
        this._commonService.onToggleCheckbox(data, this.checkedIds);
        break;
      case 'redirectToRule':
        this.redirectToRuleManagement(data);
        break;
      default:
        break;
    }
  }
  scrollToElement(arg0: string) {
    setTimeout(() => {
      const element = document.getElementById(arg0);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1000);
  }

  //Get data for timeLine
  showTimelineForAlert(
    src_ip: string,
    dest_ip: string,
    signature_id: number,
    rev: number,
    timestamp: any,
    signature: string,
    severity: number
  ) {
    this.selectedEvents.set([]);
    this.currentPage = 1;
    this.selectedDestIp = dest_ip;
    this.selectedSrcIp = src_ip;
    this.selectedSignature_id = signature_id;
    this.selectedRev = rev;
    this.selectedTimestamp = timestamp;
    this.firstData = {
      src_ip: src_ip,
      dest_ip: dest_ip,
      timestamp: timestamp,
      alert: {
        signature: signature,
        severity: severity,
      },
    };
    this._alertListService
      .getTimeLineData(
        { ...this.alertsQueryParamsline(), page: this.currentPage, size: 10 },
        src_ip,
        dest_ip,
        signature_id,
        rev,
        timestamp
      )

      .subscribe((response) => {
        if (response.data && response.data.length >= 0) {
          this.selectedEvents.set([this.firstData, ...response.data]);
          this.currentPage++;
          this.hasMorePages = true;
          this.lastData = response.last_data;
        } else {
          this.hasMorePages = false;
        }
        this.loadPieChartData(src_ip, dest_ip, signature_id, rev, timestamp);
      });
  }

  // get data for timeline onscroll
  loadMoreTimelineEvents() {
    if (!this.hasMorePages) return;
    this.isLoading = true;

    const params = {
      ...this.alertsQueryParamsline(),
      page: this.currentPage,
      size: 10,
    };
    this._alertListService
      .getTimeLineData(
        params,
        this.selectedSrcIp,
        this.selectedDestIp,
        this.selectedSignature_id,
        this.selectedRev,
        this.selectedTimestamp
      )
      .subscribe({
        next: (response) => {
          if (response.data?.length) {
            this.selectedEvents.update((events) => [
              ...events,
              ...response.data,
            ]);

            if (this.totalItems === null) {
              this.totalItems = response.total;
            }

            this.itemsLoaded += response.data.length;
            this.hasMorePages = this.itemsLoaded < this.totalItems;

            if (this.hasMorePages) {
              this.currentPage++;
            }
          } else {
            this.hasMorePages = false;
          }
        },
        error: (err) => {
          console.error('Failed to load data:', err);
          this.hasMorePages = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  //get data for Pie Chart
  loadPieChartData(
    src_ip: string,
    dest_ip: string,
    signature_id: number,
    rev: number,
    timestamp: any
  ) {
    this._alertListService
      .getTimeLineData(
        {
          ...this.alertsQueryParamsline(),
          page: 1,
          size: 10000,
        },
        src_ip,
        dest_ip,
        signature_id,
        rev,
        timestamp
      )
      .subscribe((response) => {
        if (response.data && response.data.length > 0) {
          const allEvents = [this.firstData, ...response.data];
          this.severityEvents.set(allEvents);
        } else {
          this.severityEvents.set([this.firstData]);
        }
      });
  }

  private severityColors: { [key: string]: string } = {
    '1': '#F44949',
    '2': '#FF6633',
    '3': '#F89200',
    '4': '#FFC080',
    unknown: 'gray',
  };

  // format data for Pie Chart
  groupAlertsBySeverity(events: any[]) {
    if (!events || events.length === 0) {
      return [];
    }
    const groupedBySeverity = events.reduce((acc: any, event: any) => {
      const severity = event.alert?.severity || 'Unknown';
      if (!acc[severity]) {
        acc[severity] = {
          name: `Severity ${severity}`,
          y: 0,
          color:
            this.severityColors[severity] || this.severityColors['Unknown'],
        };
      }

      acc[severity].y += 1;

      return acc;
    }, {});

    return Object.values(groupedBySeverity);
  }

  readonly alertsBySevPie = computed<PieChartInterface>(() => {
    const events = this.severityEvents();

    if (!events || events.length === 0) {
      return this.getDefaultPieChartOptions('');
    }

    const data = this.groupAlertsBySeverity(events);
    const total = events.length;

    return this.getDefaultPieChartOptions(total.toString(), data);
  });

  // passed data to the Pie Chart
  private getDefaultPieChartOptions(
    total: string,
    data: any[] = []
  ): PieChartInterface {
    return {
      data: data,
      height: '250px',
      //colors: ['#F44949', '#FF6633', '#F89200', '#FFC080'],
      backgroundColor: '#1F1F1F',
      innerSize: '85%',
      subtitle: {
        useHTML: true,
        text: total,
        floating: true,
        verticalAlign: 'middle',
        x: -75,
        y: 20,
        style: {
          color: 'white',
          fontSize: '28px',
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
        labelFormatter: function (this: any): string {
          return `${this.name}: ${this.y}`;
        },
      },
      dataLabelsOption: { enabled: false },
    };
  }

  //get data to time line
  alertLine = toSignal(
    toObservable(this.currentTime).pipe(
      switchMap(() => {
        return this._alertsService.getAlertsData(this.currentTime());
      })
    )
  );

  highlightAlertInLineGraph(timestamp: string) {
    const datePart = timestamp.split('T')[0];
    const timestampInMilliseconds = new Date(datePart).getTime();
    this.selectedAlertTimestamp.set(timestampInMilliseconds);
  }

  alertsCount = toSignal(
    toObservable(this.selectedAlertTimestamp).pipe(
      switchMap((timestamp) =>
        this._alertListService.getCountAlertInTimeStamp(timestamp!)
      )
    )
  );

  // passsed data time line
  readonly alertsLineGraphOptions = computed<AreaChartInterface>(() => {
    this.selectedTimestamp = this.selectedAlertTimestamp();
    const baseData = this.alertLine() ?? [];
    // verifier selected point is in baseData ou non
    let dataWithSelectedPoint = baseData.map(([time, value]) => {
      const isSelected =
        this.selectedTimestamp !== null && time === this.selectedTimestamp;
      return {
        x: time,
        y: value,
        marker: {
          enabled: isSelected,
          fillColor: isSelected ? 'red' : undefined,
          radius: isSelected ? 8 : 0,
        },
      };
    });

    // Vérifier si `selectedTimestamp` existe dans `dataWithSelectedPoint`
    const isTimestampInData = dataWithSelectedPoint.some(
      (point) => point.x === this.selectedTimestamp
    );
    const yValue = this.alertsCount() ?? 0;

    // Ajouter un point de surbrillance si `selectedTimestamp` n'est pas dans `baseData`
    if (this.selectedTimestamp !== null && !isTimestampInData) {
      dataWithSelectedPoint.push({
        x: this.selectedTimestamp,
        y: yValue,
        marker: {
          enabled: true,
          fillColor: 'red',
          radius: 8,
        },
      });
    }

    return {
      title: undefined,
      yAxisLabel: 'Alerts',
      data: dataWithSelectedPoint,
      lineColor: '#7B5DFF',
      height: 250,
      backgroundColor: '#1F1F1F',
      labelColor: '#C5C4BE',
      yLabelColor: '#C5C4BE',
      xLabelColor: '#C5C4BE',
      gridLineColor: '#C5C4BE',
      gridLineDashStyle: 'Dot',
      legendLabelColor: '#C5C4BE',
    };
  });

  redirectToDetailAlert(data: any) {
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['/operator/alerts/detail'], {
        queryParams: {
          type: 'flow',
          id: data._id,
        }
      })
    );

    window.open(url, '_blank');
  }

  redirectToRuleManagement(data: any) {
    this._router.navigate(["/operator/parameters/rules/view-rules"], {
      queryParams: { sid: data.signature_id },
    });
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
}
