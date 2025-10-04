import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AlertDataInterface, AlertTimelineResponse } from '@core/interfaces';
import { Injectable, inject } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response.interface';
import { catchError, Observable, of } from 'rxjs';
import { buildHttpParams2 } from './buildHttpParams';
import { BaseParamsInterface } from '@core/interfaces/base-params.interface';
import { CommonService } from './common.service';
import { proxyPath } from '@configs/api-url.config';

export interface AlertQueryParams extends BaseParamsInterface {
  display_col?: string[];
  proto?: string;
  severity?: string;
  sortedBy?: string;
  orderBy?: string;
  category?: string;
  signature?: string;
  sid?: string;
  flow_id?: string;
  threat?: string;
  src_ip?: string;
  src_port?: string;
  dest_ip?: string;
  type?: string;
  timestamp?: string;
  page?: number;
  pagePrevious?: number;
  size?: number;
  community_id?: string;
  id?: string;
  direction?: 'next' | 'previous';
  after?: { [key: string]: string } | null;
}

const paramMapping: { [key: string]: string } = {
  display_col: 'displayedField[]',
  proto: 'filter[proto.keyword]',
  severity: 'filter[alert.severity]',
  category: 'filter[alert.category.keyword]',
  signature: 'filter[alert.signature.keyword]',
  sid: 'filter[alert.signature_id]',
  flow_id: 'filter[flow_id]',
  threat: 'filter[threat.keyword]',
  src_ip: 'filter[src_ip.keyword]',
  src_port: 'filter[src_port]',
  type: 'filter[type.keyword]',
  dest_ip: 'filter[dest_ip.keyword]',
  dest_port: 'filter[dest_port]',
  '@timestamp': 'filter[@timestamp]',
  sortedBy: 'sortedBy',
  orderBy: 'orderBy',
  community_id: 'match[community_id]',
  id: 'match[_id]',
};

const _webApi = proxyPath.web;
@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  private _http = inject(HttpClient);
  private _index = 'logstash-alert-*';
  private _commonService = inject(CommonService);

  deleteAlertsAdvanced(data: any) {
    return this._http.delete(_webApi+'/alerts', { body: data });
  }


  getCountAlertByProto() {
    return this._http.get<any>(
      _webApi+`/pie_chart?index=${this._index}&fieldAggregation[]=proto.keyword&sizeAggregation[]=10`
    );
  }
  getCountByPortDest(interval?: number, dateBegin?: string, dateEnd?: string) {
    return this._http.get<any>(
      _webApi+`/pie_chart?index=${this._index}&fieldAggregation[]=dest_port&sizeAggregation[]=10`+
      this._commonService.setTime(interval, dateBegin, dateEnd)
    );
  }

  getCountAlertBySev() {
    return this._http.get<any>(
      _webApi+`/pie_chart?index=${this._index}&fieldAggregation[]=alert.severity&sizeAggregation[]=10&timeInterval=24`
    );
  }
  getAlertBySevCount(interval?: number, dateBegin?: string, dateEnd?: string) {
    let req =
      _webApi+`/pie_chart?index=${this._index}&fieldAggregation[]=alert.severity&sizeAggregation[]=10` +
      this._commonService.setTime(interval, dateBegin, dateEnd);
    return this._http.get<any[]>(req);
  }

  getAreaAlertByCat(time?: number, beginDate?: string, endDate?: string) {
    return this._http.get<any>(
      _webApi+`/areaspline_chart?index=${this._index}&fieldAggregation[]=alert.category.keyword`+
      this._commonService.setTime(time, beginDate, endDate)
    );
  }

  getAlertById(
    type: string,
    queryParams: AlertQueryParams
  ): Observable<ApiResponse<AlertDataInterface>> {
    if (type === 'flow') {
      this._index = 'logstash-alert-*';
    } else {
      this._index = 'logstash-ia-alerts-*';
    }

    const {
      display_col,
      page = 1,
      size = 1,
      after,
      pagePrevious,
      ...optionalParams
    } = queryParams; // Exclure 'after'

    const displayFields = display_col?.join(',');

    const url = _webApi+'/document';
    let params = new HttpParams()
      .set('index', this._index)
      .set('size', 1)
      .set(paramMapping['display_col'], displayFields || '');

    params = this.addOptionalParams(params, optionalParams as any);

    return this._http
      .get<ApiResponse<AlertDataInterface>>(url, { params })
      .pipe(catchError(() => of({} as ApiResponse<AlertDataInterface>)));
  }

  getAreaAlertBySid(time?: number, beginDate?: string, endDate?: string) {
    let req =
      _webApi+`/areaspline_chart?index=${this._index}&fieldAggregation[]=alert.signature_id` +
      this._commonService.setTime(time, beginDate, endDate);
    return this._http.get<any>(req);
  }

  getAllAlerts(queryParams: AlertQueryParams): Observable<ApiResponse<string>> {
    let params = buildHttpParams2(this._index, queryParams);

    return this._http
      .get<ApiResponse<string>>(_webApi+'/documents', { params })
      .pipe(catchError(() => of({} as ApiResponse<string>)));
  }

  private addOptionalParams(
    params: HttpParams,
    options: { [key: string]: string | undefined }
  ): HttpParams {
    Object.keys(options).forEach((key) => {
      const value = options[key];
      if (value) {
        const paramKey = paramMapping[key] || key;
        params = params.set(paramKey, value);
      }
    });
    return params;
  }

  getTop10IpDestinationNew(
    time?: number,
    beginDate?: string,
    endDate?: string
  ) {
    let req =
      _webApi+`/column_chart?index=${this._index}&fieldAggregation[]=dest_ip.keyword&fieldAggregation[]=src_geoip.geo.country_iso_code.keyword&sizeAggregation[]=10` +
      this._commonService.setTime(time, beginDate, endDate);
    return this._http.get<any[]>(req);
  }


  getTop10IpSource2(time?: number, beginDate?: string, endDate?: string) {
    let req =
      _webApi+`/column_chart?index=${this._index}&fieldAggregation[]=src_ip.keyword&fieldAggregation[]=src_geoip.geo.country_iso_code.keyword&sizeAggregation[]=10` +
      this._commonService.setTime(time, beginDate, endDate);
    return this._http.get<any[]>(req);
  }

  getTopAppByPort(time?: number, beginDate?: string, endDate?: string) {
    return this._http.get<any[]>(
      _webApi+`/column_chart?index=${this._index}&fieldAggregation[]=app_proto.keyword&sizeAggregation[]=10` +
      this._commonService.setTime(time, beginDate, endDate)
    );
  }

  getTopAppByPortByTime(time?: number, beginDate?: string, endDate?: string) {
    let req =
      _webApi+`/column_chart?index=${this._index}&fieldAggregation[]=dest_port&sizeAggregation[]=10` +
      this._commonService.setTime(time, beginDate, endDate);
    return this._http.get<any[]>(req);
  }

  getStackedColumnFlows(time?: number, beginDate?: string, endDate?: string) {
    let req = _webApi+`/stacked-column?index=${this._index}&fieldAggregation[]=alert.category.keyword`;
    if (time || beginDate && endDate){
      req += this._commonService.setTime(time, beginDate, endDate);
    }
    return this._http.get<any[]>(req);
  }

  getSankeySrcIp(time?: number, beginDate?: string, endDate?: string) {
    let req =
      _webApi+`/sankey_chart?index=${this._index}&fieldAggregation[]=src_ip.keyword&fieldAggregation[]=dest_ip.keyword&filter[alert.severity]=1,2&sizeAggregation[]=10&sizeAggregation[]=1` +
      this._commonService.setTime(time, beginDate, endDate);
    return this._http.get<any[]>(req);
  }

  getRequestAlertsByCategory(time?: number, beginDate?: string, endDate?: string): Observable<any[]> {
    return this._http.get<any[]>(
      _webApi + `/pie_chart?index=${this._index}&fieldAggregation[]=alert.category.keyword&sizeAggregation[]=10` +
      this._commonService.setTime(time, beginDate, endDate)
    ).pipe(
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }

  getWorldMapSourceData(
    type: string,
    interval?: number,
    beginDate?: string,
    endDate?: string
  ) {
    let req =
      _webApi+`/map_chart?index=${this._index}&fieldAggregation[]=${type}_geoip.geo.country_iso_code.keyword&sizeAggregation[]=10` +
      this._commonService.setTime(interval, beginDate, endDate);
    return this._http.get<any[]>(req);
  }

  getAlertsData(time?: number, dateBegin?: string, dateEnd?: string) {
    let req =
      _webApi+`/line-area?index=${this._index}&fieldAggregation[]=alert.severity&sizeAggregation[]=10` +
      this._commonService.setTime(time, dateBegin, dateEnd);
    return this._http.get<any[]>(req);
  }

  getLineAreaAlerts() {
    return this._http.get<any[]>(
      _webApi+`/line-area?index=${this._index}&timeInterval=168`
    );
  }

  getAlertsDataByThreat(time?: number, dateBegin?: string, dateEnd?: string) {
    let req =
      _webApi+`/pie_chart?index=${this._index}&fieldAggregation[]=threat.keyword&sizeAggregation[]=8` +
      this._commonService.setTime(time, dateBegin, dateEnd);
    return this._http.get<any[]>(req);
  }

  getDistinctIps(field: string, time?: number, dateBegin?: string, dateEnd?: string) {
    let req =
      _webApi+`/distinct?index=${this._index}&size=0&fieldAggregation[]=${field}` +
      this._commonService.setTime(time, dateBegin, dateEnd);
    return this._http.get<any[]>(req);
  }

  getDistinctRules(time?: number, dateBegin?: string, dateEnd?: string) {
    let req =
      _webApi+`/distinct?index=logstash-alert-*&page=1&size=0&fieldAggregation[]=alert.signature_id` +
      this._commonService.setTime(time, dateBegin, dateEnd);
    return this._http.get<any[]>(req);
  }

  getDistinctThreats() {
    return this._http.get<any[]>(
      _webApi+`/pie_chart?index=${this._index}&fieldAggregation[]=threat.keyword&sizeAggregation[]=10`
    );
  }

  calculateRiskScore(severity: number, deviance: number): number {
    if (severity < 1 || severity > 4) {
      throw new Error('La sévérité doit être entre 1 et 4');
    }
    if (deviance < 0 || deviance > 4) {
      throw new Error('La déviance doit être entre 1 et 4');
    }
    const normsev = ((5 - severity) * 100) / 4;
    const normdev = (deviance * 100) / 4;
    return Math.round((normsev + normdev) / 2);
  }

  getAlertTimeline(
    srcIp: string,
    destIp: string,
    displayCol: string[],
    timestamp: string
  ): Observable<AlertTimelineResponse> {
    const queryParams = [
      destIp ? `&destip=${destIp}` : '',
      srcIp ? `&srcip=${srcIp}` : '',
      timestamp ? `&timestamp=${timestamp}` : '',
      displayCol ? `&displayedField[]=${displayCol.join()}` : '',
    ].join('');

    const url = _webApi+`/timeline/detail/alert?index=${this._index}${queryParams}`;
    return this._http.get<AlertTimelineResponse>(url);
  }

  getAlertCount(
    data: { src_ip: string; dest_ip: string }[],
    type: string
  ): Observable<any> {
    if (type === 'flow') {
      this._index = 'logstash-alert-*';
    } else if (type === 'ai') {
      this._index = 'logstash-ia-alerts-*';
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(_webApi+`/count/detail/alert?${this._index}`, data, {
      headers,
    });
  }

  getTopThreat2(time?: number, dateBegin?: string, dateEnd?: string) {
    let req =
      _webApi+`/column_chart?index=${this._index}&fieldAggregation[]=threat.keyword&sizeAggregation[]=10` +
      this._commonService.setTime(time, dateBegin, dateEnd);
    return this._http.get<any[]>(req);
  }
  getTopAlertByAppProto(time?: number, dateBein?: string, dateEnd?: string) {
    let req =
      _webApi+`/pie_chart?index=${this._index}&fieldAggregation[]=app_proto.keyword&sizeAggregation[]=10` +
      this._commonService.setTime(time, dateBein, dateEnd);
    return this._http.get<any[]>(req);
  }

  getAreaAlertInTime(time?: number, dateBegin?: string, dateEnd?: string) {
    let req =
      _webApi+`/areaspline_chart?index=${this._index}&fieldAggregation[]=alert.category.keyword` +
      this._commonService.setTime(time, dateBegin, dateEnd);
    return this._http.get<any[]>(req);
  }

  getAreaThreatInTime(time?: number, dateBegin?: string, dateEnd?: string) {
    let req =
      _webApi+`/areaspline_chart?index=${this._index}&fieldAggregation[]=threat.keyword` +
      this._commonService.setTime(time, dateBegin, dateEnd);
    return this._http.get<any[]>(req);
  }

  getFlowTopBySid2(time?: number, beginDate?: string, endDate?: string) {
    let req =
      _webApi+`/column_chart?index=${this._index}&fieldAggregation[]=alert.signature_id&sizeAggregation[]=10` +
      this._commonService.setTime(time, beginDate, endDate);
    return this._http.get<any[]>(req);
  }
}
