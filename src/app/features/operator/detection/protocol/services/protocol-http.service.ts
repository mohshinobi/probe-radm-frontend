import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '@core/interfaces/api-response.interface';
import { buildHttpParams2 } from '@core/services/buildHttpParams';
import { ProtocolIndex, ProtocolQueryParams } from './protocol.service';
import { proxyPath } from '@configs/api-url.config';

const _webApi = proxyPath.web;
interface ChartResponse {
  data: any[];
  name: string;
}

interface TimeSeriesResponse {
  data: number[][];
}

@Injectable({
  providedIn: 'root'
})
export class ProtocolHttpService {
  private readonly _http = inject(HttpClient);
  private readonly BASE_API_URL = _webApi;

  private buildIndex(protocol: ProtocolIndex): string {
    return `logstash-${protocol}-*`;
  }

  private buildBaseParams(protocol: ProtocolIndex, timeInterval: number, beginDate: string, endDate: string, fieldAggregation?: string): HttpParams {
    let params = new HttpParams()
      .set('index', this.buildIndex(protocol));
    if (beginDate && endDate && beginDate != '' && endDate != '') {
      params = params.set('startDate', beginDate);
      params = params.set('endDate', endDate);
    }
    else {
      params = params.set('timeInterval', timeInterval.toString());
    }

    if (fieldAggregation) {
      params = params.set('fieldAggregation[]', fieldAggregation);
    }

    return params;
  }

  private buildChartParams(
    protocol: ProtocolIndex,
    timeInterval: number,
    beginDate: string,
    endDate: string,
    fieldAggregation: string,
    size: number = 10
  ): HttpParams {

    return this.buildBaseParams(protocol, timeInterval, beginDate, endDate, fieldAggregation)
      .set('sizeAggregation[]', size.toString());
  }

  getTimeSeriesData(protocol: ProtocolIndex, timeInterval: number, beginDate: string, endDate: string): Observable<TimeSeriesResponse> {
    return this._http.get<TimeSeriesResponse>(`${this.BASE_API_URL}/line-area`, {
      params: this.buildBaseParams(protocol, timeInterval, beginDate, endDate)
    });
  }

  getChartData(
    chartType: 'column_chart' | 'pie_chart' | 'areaspline_chart' | 'line_area' | 'line_field',
    protocol: ProtocolIndex,
    timeInterval: number,
    beginDate: string,
    endDate: string,
    fieldAggregation: string,
    withSize: boolean = true
  ): Observable<ChartResponse[]> {
    const params = withSize
      ? this.buildChartParams(protocol, timeInterval, beginDate, endDate, fieldAggregation)
      : this.buildBaseParams(protocol, timeInterval, beginDate, endDate, fieldAggregation);

    return this._http.get<ChartResponse[]>(`${this.BASE_API_URL}/${chartType}`, { params });
  }

  getGeoData(direction: string, protocol: ProtocolIndex, timeInterval: number, beginDate: string, endDate: string): Observable<ChartResponse> {
    const fieldAggregation = `${direction}_geoip.geo.country_iso_code.keyword`;
    return this._http.get<ChartResponse>(`${this.BASE_API_URL}/map_chart`, {
      params: this.buildChartParams(protocol, timeInterval, beginDate, endDate, fieldAggregation)
    });
  }

  getAllAlerts(
    queryParams: ProtocolQueryParams,
    protocol: ProtocolIndex,
  ): Observable<ApiResponse<string>> {
    // ssh : zeek-ssh
    // tls: zeek-ssl
    // dns: zeek-dns

    switch (protocol) {
      case ProtocolIndex.ssh:
        protocol = 'zeek-ssh' as ProtocolIndex;
        break;
      case ProtocolIndex.tls:
        protocol = 'zeek-ssl' as ProtocolIndex;
        break;
      case ProtocolIndex.dns:
        protocol = 'zeek-dns' as ProtocolIndex;
        break;
    }

    let params = buildHttpParams2(this.buildIndex(protocol), queryParams);
    return this._http.get<ApiResponse<string>>(`${this.BASE_API_URL}/documents`, { params });
  }

  getSrcDestRelationship(protocol: ProtocolIndex, timeInterval: number, beginDate: string, endDate: string): Observable<ChartResponse> {
    let params = new HttpParams()
      .set('index', this.buildIndex(protocol))
      .append('fieldAggregation[]', 'src_ip.keyword')
      .append('fieldAggregation[]', 'dest_ip.keyword')
      .append('sizeAggregation[]', '10')
      .append('sizeAggregation[]', '2');

    if (beginDate && endDate && beginDate != '' && endDate != '') {
      params = params.set('startDate', beginDate);
      params = params.set('endDate', endDate);
    }
    else {
      params = params.set('timeInterval', timeInterval.toString());
    }
    return this._http.get<ChartResponse>(`${this.BASE_API_URL}/sankey_chart`, { params });
  }
}
