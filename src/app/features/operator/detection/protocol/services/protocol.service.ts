import { inject, Injectable } from '@angular/core';
import { Krb5AlertsQueryParams } from '@core/services/protocol/krb5.service';
import { DnsQueryParams, FileInfoQueryParams, HttpAlertsQueryParams, SshQueryParams, TlsAlertsQueryParams } from '@core/services';
import { RdpAlertsQueryParams } from '@core/services/protocol/rdp.service';
import { SmbAlertsQueryParams } from '@core/services/protocol/smb.service';
import { ProtocolHttpService } from './protocol-http.service';
import { ProtocolStateService } from './protocol-state.service';
import { AreaChartInterface, AreaSplineChartInterface, MapChartInterface, PieChartInterface, SankeyChartInterface } from '@core/interfaces';
import { BarChartInterface } from '@core/interfaces/charts/bar-chart.interface';
import { ProtocolGraphService } from './protocol-graph.service';
import { StackedColumnInterface } from '@core/interfaces/charts/stacked-column.interface';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '@core/interfaces/api-response.interface';
import {formatAreaSpline, formatPieAndColumn, formatSankey} from "@core/utils/graph-formater.util";

export interface ProtocolQueryParams extends
DnsQueryParams,
SshQueryParams,
TlsAlertsQueryParams,
HttpAlertsQueryParams,
FileInfoQueryParams,
RdpAlertsQueryParams,
SmbAlertsQueryParams,
Krb5AlertsQueryParams {}

export interface TopProto {
  name:string, y : number
}

export enum  ProtocolIndex {
  dns = 'dns',
  ssh = 'ssh',
  tls = 'tls',
  http = 'http',
  fileinfo = 'fileinfo',
  rdp = 'rdp',
  smb = 'smb',
  krb5 = 'krb5',
  alert = 'alert',
  ssl = 'zeek-ssl'
}

export interface ProtocolState {
  protocol: ProtocolIndex;
  timeInterval: number;
  beginDate: string;
  endDate: string;
  currentMapType: string;
  queryParams: ProtocolQueryParams;
}

@Injectable({
  providedIn: 'root'
})
export class ProtocolService {

  private _protocolHttpService  = inject(ProtocolHttpService);
  private _protocolStateService = inject(ProtocolStateService);
  private _protocolGraphService = inject(ProtocolGraphService);

  protocolSelectFilterOptions = [
    { value: ProtocolIndex.alert, label: "OVERVIEW" },
    { value: ProtocolIndex.dns, label: "DNS" },
    { value: ProtocolIndex.ssh, label: "SSH" },
    { value: ProtocolIndex.tls, label: "TLS" },
    { value: ProtocolIndex.http, label: "HTTP" },
    { value: ProtocolIndex.fileinfo, label: "FILE INFO" },
    { value: ProtocolIndex.rdp, label: "RDP" },
    { value: ProtocolIndex.smb, label: "SMB" },
    { value: ProtocolIndex.krb5, label: "KRB5" }
  ];

  getAllAlerts(
    queryParams: ProtocolQueryParams,
    protocol: ProtocolIndex,
  ): Observable<ApiResponse<string>> {
    return this._protocolHttpService.getAllAlerts(queryParams, protocol);
  }

  pieChart(protocolIndex: ProtocolIndex, field: string) {
    return this._protocolStateService.createChartSignal<PieChartInterface>(
      (protocol, time, beginDate, endDate) => this._protocolHttpService.getChartData('pie_chart', protocol, time, beginDate, endDate, field),
      (data: any) => this._protocolGraphService.pieChartOption(formatPieAndColumn(data)),
      {} as PieChartInterface,
      protocolIndex
    )
  }

  stackedColumnChart(field: string) {
    return this._protocolStateService.createChartSignal(
      (protocol, time, beginDate, endDate) => this._protocolHttpService.getChartData('pie_chart', protocol, time, beginDate, endDate, field),
      (data:any) => this._protocolGraphService.transformTopProtosData(formatPieAndColumn(data)),
      {} as StackedColumnInterface,
      ProtocolIndex.alert
    )
  }

  columnChart(protocolIndex: ProtocolIndex, field: string, color: string = '') {
    return this._protocolStateService.createChartSignal<BarChartInterface>(
      (protocol, time, beginDate, endDate) =>
        this._protocolHttpService.getChartData(
        'column_chart',
        protocolIndex === ProtocolIndex.tls ? ProtocolIndex.ssl : protocol,
        time,
        beginDate,
        endDate,
        field
      ),
      (data: any) => this._protocolGraphService.barchartOption(formatPieAndColumn(data), color),
      {} as BarChartInterface,
      protocolIndex
    )
  }

  areaChart() {
    return this._protocolStateService.createChartSignal<AreaChartInterface>(
      (protocol, time, beginDate, endDate) =>
        this._protocolHttpService.getTimeSeriesData(protocol, time, beginDate, endDate),
      this._protocolGraphService.areaChartOption,
      {} as AreaChartInterface,
    )
  }

  lineAreaChart<T>(protocolIndex: ProtocolIndex, field: string, transformer: (data: any) => T, initialValue: T) {
    return this._protocolStateService.createChartSignal<T>(
      (protocol, time, beginDate, endDate) =>
        this._protocolHttpService.getChartData('line_area', protocol, time, beginDate, endDate, field),
      transformer,
      initialValue,
      protocolIndex
    )
  }

  areaSplineChart(protocolIndex: ProtocolIndex, field: string, withSize: boolean = true) {
    return this._protocolStateService.createChartSignal<AreaSplineChartInterface>(
      (protocol, time, beginDate, endDate) =>
        this._protocolHttpService.getChartData('areaspline_chart', protocol, time, beginDate, endDate, field, withSize)
        .pipe(map((data) => data.filter(response => response.name !== 'failed')))
        .pipe(map(data => formatAreaSpline(data))),
      this._protocolGraphService.areaSplineChartOption,
      {} as AreaSplineChartInterface,
      protocolIndex
    )
  }

  lineFieldChart(protocolIndex: ProtocolIndex, field: string) {
    return this._protocolStateService.createChartSignal(
      (protocol, time, beginDate, endDate) =>
        this._protocolHttpService.getChartData('line_field', protocol, time, beginDate, endDate, field, false),
      this._protocolGraphService.areaChartOption,
      {} as AreaChartInterface,
      protocolIndex
    )
  }

  mapChart(protocolIndex?: ProtocolIndex) {
    return this._protocolStateService.createChartSignal(
      (protocol, time, beginDate, endDate, currentMapType) =>
        this._protocolHttpService.getGeoData(currentMapType as string, protocol, time, beginDate, endDate),
      (data: any) => this._protocolGraphService.mapChartOption(data, this._protocolStateService.currentMapType()),
      {} as MapChartInterface,
      protocolIndex
    )
  }

  sankeyChart() {
    return this._protocolStateService.createChartSignal(
      (protocol, time, beginDate, endDate) => this._protocolHttpService.getSrcDestRelationship(protocol, time, beginDate, endDate),
      (data:any) => this._protocolGraphService.sankeyChartOption(formatSankey(data)),
      {} as SankeyChartInterface,
    )
  }

  areaSplineChartOption = (data: any) => this._protocolGraphService.areaSplineChartOption(data);
  areaChartOption = (data: any) => this._protocolGraphService.areaChartOption(data)
}
