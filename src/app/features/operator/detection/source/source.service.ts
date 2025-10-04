import { HttpClient } from '@angular/common/http';
import {  inject, Injectable } from '@angular/core';
import { proxyPath } from '@configs/api-url.config';
import { ApiResponse } from '@core/interfaces/api-response.interface';
import { BaseParamsInterface } from '@core/interfaces/base-params.interface';
import { CommonService } from '@core/services';
import { buildHttpParams2 } from '@core/services/buildHttpParams';
import { Observable, catchError, of } from 'rxjs';

const _webApi = proxyPath.web;

export interface AlertQueryParams extends BaseParamsInterface {
  display_col?: string[];
  proto?: string;
  severity?: string;
  sortedBy?: string;
  orderBy?: string;
  category?: string;
  signature?: string;
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

@Injectable({
  providedIn: 'root',
})
export class SourceService {
  private _http = inject(HttpClient);
  private _index = 'logstash-alert-*';
  private _commonService = inject(CommonService);

  getWorldMapSourceData(
    interval?: number,
    beginDate?: string,
    endDate?: string
  ) {
    let req =
      _webApi+`/map_chart?index=${this._index}&fieldAggregation[]=src_geoip.geo.country_iso_code.keyword&sizeAggregation[]=10` +
      this._commonService.setTime(interval, beginDate, endDate);
    return this._http.get<any[]>(req);
  }

  getThreatBySource(interval?: number, beginDate?: string, endDate?: string) {
    return this._http.get<any[]>(
      _webApi+`/data/by_source?index=${this._index}&fieldAggregation[]=src_ip.keyword&fieldAggregation[]=threat.keyword&SizeAggregation[]=5`+
      this._commonService.setTime(interval, beginDate, endDate)
    );
  }

  getAllAlertsForSourceTable(
    queryParams: AlertQueryParams
  ): Observable<ApiResponse<string>> {
    let after = null;
    if (queryParams.after) {
      after = queryParams.after;
      delete queryParams.after;
    }

    let params = buildHttpParams2(this._index, queryParams);
    params = params.append('fieldAggregation[]', 'src_ip.keyword');

    if (after) {
      Object.keys(after).forEach((key) => {
        const value = after![key];
        params = params.append(`after[${key}]`, value);
      });
    }

    return this._http
      .get<ApiResponse<string>>(_webApi+'/documents', { params })
      .pipe(catchError(() => of({} as ApiResponse<string>)));
  }

  getTopAlertsByCountry(time?: number, beginDate?: string, endDate?: string) {
    return this._http.get<any[]>(
      _webApi+`/column_chart?index=${this._index}&fieldAggregation[]=src_geoip.geo.country_iso_code.keyword&sizeAggregation[]=10`+
      this._commonService.setTime(time, beginDate, endDate)
    );
  }

  getDetailsSource(srcIp: string) {
    return this._http.get<any[]>(
      _webApi+`/connections/detail/alert?index=${this._index}&srcIp=${srcIp}`
    );
  }
}
