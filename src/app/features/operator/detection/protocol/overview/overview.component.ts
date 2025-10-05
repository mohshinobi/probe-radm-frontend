import { Component, inject, ViewChild } from '@angular/core';
import { AreasplineComponent } from "@shared/components/graphs/areaspline/areaspline.component";
import { MatCard, MatCardContent } from "@angular/material/card";
import { TableComponent } from "@shared/components/table/table.component";
import { AreaChartInterface, AreaSplineChartInterface } from "@core/interfaces";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseField } from '@shared/components/form/fields';
import { combineLatest, map, switchMap } from 'rxjs';
import { NgClass } from "@angular/common";
import { Router } from "@angular/router";
import { StackedBarComponent } from '@shared/components/graphs/stacked-bar/stacked-bar.component';
import { TimeSelectorComponent } from "@shared/components/time-selector/time-selector.component";

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BarComponent } from '@shared/components/graphs/bar/bar.component';
import { SankeyComponent } from '@shared/components/graphs/sankey/sankey.component';
import { MatIconModule } from '@angular/material/icon';
import { AreaComponent } from '@shared/components/graphs/area/area.component';
import {
  SshTemplateComponent,
  DnsTemplateComponent,
  TlsTemplateComponent,
  HttpTemplateComponent,
  FileInfoTemplateComponent,
  RdpTemplateComponent,
  Krb5TemplateComponent,
  SmbTemplateComponent
} from '../components/protocol-templates';
import { ProtocolStateService } from '../services/protocol-state.service';
import { ProtocolTableConfig } from '../services/protocol-table-config';
import { ProtocolIndex, ProtocolQueryParams, ProtocolService } from '../services/protocol.service';
import { ProtocolFormService } from '../services/protocol-form.service';
import { CommonService } from '@core/services';
import { MatTooltip, MatTooltipModule } from "@angular/material/tooltip";
import { PageHeaderComponent } from "@layout/header/page-header.component";

@Component({
    selector: 'app-overview',
    imports: [
    AreasplineComponent,
    MatCard,
    MatCardContent,
    TableComponent,
    ReactiveFormsModule,
    StackedBarComponent,
    TimeSelectorComponent,
    MatSelectModule,
    MatFormFieldModule,
    BarComponent,
    SankeyComponent,
    AreaComponent,
    SshTemplateComponent,
    DnsTemplateComponent,
    TlsTemplateComponent,
    HttpTemplateComponent,
    FileInfoTemplateComponent,
    RdpTemplateComponent,
    Krb5TemplateComponent,
    SmbTemplateComponent,
    NgClass,
    MatTooltip,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
    PageHeaderComponent
],
    providers: [ProtocolFormService],
    templateUrl: './overview.component.html',
    styleUrl: './overview.component.scss'
})
export class OverviewComponent {
  private _router = inject(Router);
  private _protocolFormService = inject(ProtocolFormService);
  private _protocolStateService = inject(ProtocolStateService);
  private _protocolTableConfig = inject(ProtocolTableConfig);
  private _protocolService = inject(ProtocolService);
  private _commonService = inject(CommonService);

  form!: FormGroup;
  fields: BaseField<string | number>[] = [];
  title = 'Detection / by Protocol';
  condition = true;

  //Option du bloc time filter
  timeFilterOptions = [
    { value: 1, label: 'Last hour' },
    { value: 12, label: 'Last 12H' },
    { value: 24, label: 'Last 24H' },
    { value: 'Custom', label: 'Custom' },
  ];

  protected readonly ProtocolIndex = ProtocolIndex;

  private readonly state = this._protocolStateService.state;

  protected readonly protocol = this._protocolStateService.protocol;
  protected readonly timeInterval = this._protocolStateService.timeInterval;
  protected readonly currentMapType = this._protocolStateService.currentMapType;
  protected readonly queryParams = this._protocolStateService.queryParams;

  protocolSelected: ProtocolIndex = this.protocol();

  length: number = 0;

  displayedColumnsByProto = this._protocolTableConfig.getDisplayedColumns(this.protocol());
  ordersTableColumnsByProto = this._protocolTableConfig.getTableColumns(this.protocol());

  protocolSelectFilterOptions = this._protocolService.protocolSelectFilterOptions;

  @ViewChild('tableComponent') tableComponent!: TableComponent;

  constructor() {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this._protocolFormService.getFormGroup();
    this.fields = this._protocolFormService.addFieldsFromKeys(
      this.form,
      this.displayedColumnsByProto
    );
  }

  readonly alertsByProtocol = toSignal(
    combineLatest([toObservable(this.state)]).pipe(
      switchMap(([state]) => {
        state.queryParams.display_col =
          this._protocolTableConfig.getRequestedColumns(state.protocol);
        return this._protocolService
          .getAllAlerts(state.queryParams, state.protocol)
          .pipe(
            map((response) => {
              this.length = response.total;
              return response.data;
            })
          );
      })
    )
  );

  tableActions(tableActions: ProtocolQueryParams) {
    if (this.protocol() === ProtocolIndex.ssh) {
      const keywordFields = ['id.orig_h', 'id.resp_h', 'server', 'id.resp_p'];
      if (keywordFields.includes(tableActions.sortedBy as string)) {
        tableActions.sortedBy = `${tableActions.sortedBy}.keyword`;
      }
    }
    this.state.update((state) => ({
      ...state,
      queryParams: { ...state.queryParams, ...tableActions },
    }));
  }

  protected readonly charts = {
    topProtos: this._protocolService.stackedColumnChart('proto.keyword'),
    top10IpSrc: this._protocolService.columnChart('' as ProtocolIndex, 'src_ip.keyword'),
    top10IpDest: this._protocolService.columnChart('' as ProtocolIndex, 'dest_ip.keyword'),
    srcDestIpRelationship: this._protocolService.sankeyChart(),
    timeintervalProto: this._protocolService.areaChart(),
    geoIpMap: this._protocolService.mapChart(),
    timeintervalline: this._protocolService.areaSplineChart(ProtocolIndex.alert, 'app_proto.keyword', false) //
  };


  protected readonly dnsCharts = {
    requestsByType: this._protocolService.pieChart(ProtocolIndex.dns, 'dns.type.keyword'),
    requestsByPort: this._protocolService.pieChart(ProtocolIndex.dns, 'dest_port'),
  };

  protected readonly sshCharts = {
    clientRequestsByProtoVersions: this._protocolService.pieChart(ProtocolIndex.ssh, 'ssh.client.proto_version.keyword'),
    clientRequestsBySoftwareVersion: this._protocolService.pieChart(ProtocolIndex.ssh, 'ssh.client.software_version.keyword'),
    serverRequestsByProtoVersions: this._protocolService.pieChart(ProtocolIndex.ssh, 'ssh.server.proto_version.keyword'),
    serverRequestsBySoftwareVersion: this._protocolService.pieChart(ProtocolIndex.ssh, 'ssh.server.software_version.keyword'),
  };

  protected readonly tlsCharts = {
    requestsBySource: this._protocolService.pieChart(ProtocolIndex.tls, 'src_ip.keyword'),
    requestsByPort: this._protocolService.pieChart(ProtocolIndex.tls, 'dest_port'),
    requestsByVersion: this._protocolService.columnChart(ProtocolIndex.tls, 'version.keyword', '#e76f51'),
    requestsByCipherInfo: this._protocolService.columnChart(ProtocolIndex.tls, 'cipher.keyword', '#e76f51'),
  };

  protected readonly fileInfoCharts = {
    requestsByHttpMethode: this._protocolService.pieChart(ProtocolIndex.fileinfo, 'http.http_method.keyword'),
    requestsByHttpUserAgent: this._protocolService.pieChart(ProtocolIndex.fileinfo, 'http.http_user_agent.keyword'),
    requestsByHttpContentType: this._protocolService.pieChart(ProtocolIndex.fileinfo, 'http.http_content_type.keyword'),
  };

  protected readonly httpCharts = {
    requestsByStatus: this._protocolService.columnChart(ProtocolIndex.http, 'http.status', '#e76f51'),
    requestsByPort: this._protocolService.columnChart(ProtocolIndex.http, 'dest_port', '#e76f51'),
  };

  protected readonly rdpCharts = {
    requestsByGeoIp: this._protocolService.pieChart(ProtocolIndex.rdp, 'src_geoip.geo.country_name.keyword'),
    requestsByStatuss: this._protocolService.areaSplineChart(ProtocolIndex.rdp, 'smb.status.keyword'),
    requestsBySourceIp: this._protocolService.lineFieldChart(ProtocolIndex.rdp, 'src_ip.keyword'),
  };

  protected readonly smbCharts = {
    requestsByStatusCommand: this._protocolService.pieChart(ProtocolIndex.smb, 'smb.command.keyword'),
    requestsByStatus: this._protocolService.lineAreaChart(
      ProtocolIndex.smb,
      'smb.status.keyword',
      this._protocolService.areaSplineChartOption,
      {} as AreaSplineChartInterface
    ),
    requestsBySharedResources: this._protocolService.lineAreaChart(
      ProtocolIndex.smb,
      '',
      this._protocolService.areaChartOption,
      {} as AreaChartInterface
    ),
  };

  protected readonly krb5Charts = {
    requestsByStatusCname: this._protocolService.pieChart(ProtocolIndex.krb5, 'krb5.cname.keyword'),
  };

  protected onProtocolChange(protocol: ProtocolIndex): void {
    this.tableComponent.reset();
    this.state.update((state) => ({
      ...state,
      protocol,
      queryParams: {
        display_col: this._protocolTableConfig.getRequestedColumns(protocol),
      },
    }));
    this.updateFields();
  }

  protected onTimeIntervalChange(interval: number | string): void {
    this.state.update((state) => ({
      ...state,
      timeInterval: interval as number,
    }));
  }

  protected onCustomDateChange(event: any): void {
    this.state.update((state) => ({
      ...state,
      beginDate: this._commonService.convertDateToString(
        event.beginDate
      ) as string,
      endDate: this._commonService.convertDateToString(event.endDate) as string,
    }));
  }

  protected onMapTypeChange(type: string | number): void {
    this.state.update((state) => ({
      ...state,
      currentMapType: type as string,
    }));
  }

  private updateFields(): void {
    this.displayedColumnsByProto = this._protocolTableConfig.getDisplayedColumns(this.protocol());
    this.ordersTableColumnsByProto = this._protocolTableConfig.getTableColumns(
      this.protocol()
    );

    this.fields = this._protocolFormService.addFieldsFromKeys(this.form, []);
    setTimeout(() => {
      this.fields = this._protocolFormService.addFieldsFromKeys(
        this.form,
        this.displayedColumnsByProto
      );
    }, 10);
  }

  redirectToListAlert(data: any) {
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['/operator/detection/alerts-list'], {
        queryParams: {
          src_port: data.src_port,
          dest_port: data.dest_port,
          src_ip: data.src_ip,
          dest_ip: data.dest_ip,
          'alert.signature': data.alert.signature,
          "alert.severity": Number(data.alert.severity),
          threat: data.threat,
        }
      })
    );

    window.open(url, '_blank');
  }

  getCellDatas(data: any) {
    switch (data.actionName) {
      case 'list':
        this.redirectToListAlert(data);
        break;
      case 'redirectToRule':
        this.redirectToRuleManagement(data);
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

  expandableDetailsData = (data: any) =>
    this._protocolTableConfig.expandableDetailsData(data, this.protocol());

  ngOnDestroy() {
    this._protocolStateService.initState();
  }

  getProtocolName(): string {
    const protocolMap = {
      [ProtocolIndex.alert]: 'Overview',
      [ProtocolIndex.dns]: 'DNS',
      [ProtocolIndex.ssh]: 'SSH',
      [ProtocolIndex.tls]: 'TLS',
      [ProtocolIndex.http]: 'HTTP',
      [ProtocolIndex.fileinfo]: 'File Info',
      [ProtocolIndex.rdp]: 'RDP',
      [ProtocolIndex.smb]: 'SMB',
      [ProtocolIndex.krb5]: 'Krb5',
    } as const;

    return protocolMap[this.protocol() as keyof typeof protocolMap] || 'Unknown';
  }

  getTooltipText() {

    switch (this.protocol()) {
      case 'dns':
        return 'Timeline graph showing the volume of DNS requests over a period of time. The yellow line represents the number of DNS requests, with data points marking specific intervals.';
      case 'ssh':
        return 'Timeline graph showing the volume of SSH requests over a period of time. The yellow line represents the number of SSH requests, with data points marking specific intervals.';
      case 'tls':
        return 'Timeline graph showing the volume of TLS requests over a period of time. The yellow line represents the number of TLS requests, with data points marking specific intervals.';
      case 'http':
        return 'Timeline graph showing the volume of HTTP requests over a period of time. The yellow line represents the number of HTTP requests, with data points marking specific intervals.';
      case 'fileinfo':
        return 'Timeline graph showing the volume of FILE requests over a period of time. The yellow line represents the number of FILE requests, with data points marking specific intervals.';
      case 'rdp':
        return 'Timeline graph showing the volume of RDP requests over a period of time. The yellow line represents the number of RDP requests, with data points marking specific intervals.';
      case 'smb':
        return 'Timeline graph showing the volume of SMB requests over a period of time. The yellow line represents the number of SMB requests, with data points marking specific intervals.';
      case 'krb5':
        return 'Timeline graph showing the volume of KRB5 requests over a period of time. The yellow line represents the number of KRB5 requests, with data points marking specific intervals.';
      default:
        return 'Timeline graph showing the total volume of the top 10 queries over a period of time. The lines follow the total number of queries, with data points marking specific intervals.';

    }
  }
}
