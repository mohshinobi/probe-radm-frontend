import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response.interface';
import { CommonService } from './common.service';
import { proxyPath } from '@configs/api-url.config';
import {LineFieldResponse} from "@core/services/health.service";
import { buildHttpParams2 } from './buildHttpParams';


export interface HeatAlertData {
  page: number;
  size: number;
  offset: number;
  total: number;
  data_count: number;
  data: HeatAlert[];
}

export interface HeatAlert {
  _id: string;
  start_date: string;
  data: {
    nested_value: [number, number, number][];
  };
  end_date: string;
}

export interface IAAlertsQueryParams {
  display_col?: string[];
  app_proto?: string;
  category?: string;
  confiance?: string;
  deviance?:string;
  severity?: string;
  src_ip?: string;
  translation?: string;
  timestamp?: string;
  flow_id?: string;
  sortedBy?: string;
  orderBy?: string;
  page?: number;
  size?: number;
  timeInterval?: number;
  dateBegin?: string;
  dateEnd?: string;
  feedback?: string;
}

const paramMapping : { [key: string]: string }= {
  display_col: 'displayedField[]',
  app_proto: 'filter[app_proto.keyword]',
  category: 'filter[category.keyword]',
  confiance: 'filter[confiance]',
  deviance: 'filter[deviance]',
  severity: 'filter[severity]',
  translation: 'filter[translation.keyword]',
  src_ip: 'filter[src_ip.keyword]',
  flow_id: 'filter[flow_id]',
  timestamp: 'filter[timestamp]',
  sortedBy: 'sortedBy',
  orderBy: 'orderBy'
};

export interface IAStats {
  average_fps: number;
  current_fps: number;
  dropped: number;
  error: number;
  max_fps: number;
  processed: number;
  progress: number;
  started_at: Date;
  stats_type: string;
  timestamp: string;
}

const _webApi = proxyPath.web;

@Injectable({
  providedIn: 'root',
})
export class IAService {
  private _http = inject(HttpClient);
  private _statsIndex = 'logstash-ia-stats-*';
  private _deviancesIndex = 'logstash-ia-deviance-*';
  private _calendarIndex = 'logstash-ia-agendas-*';
  private _actorsIndex = 'logstash-ia-acteurs-*';
  private _alertsIndex = 'logstash-ia-alerts-*';
  private _commonService = inject(CommonService);

  getIaStats() {
    return this._http
      .get<IAStats>(
        _webApi+`/documents?index=${this._statsIndex}&page=1&size=1&displayedField[]=timestamp,stats_type,average_fps,current_fps,max_fps,started_at,progress,processed,dropped,error,status&sortedBy=timestamp&orderBy=desc&filter[stats_type]=train`
      )
      .pipe(map((response: any) => response.data[0]), catchError(() => of([])));
  }

  getAreaLineAlerts(time?: number, dateBegin?: string, dateEnd?: string) {
    let req =
      _webApi+`/line-area?index=${this._alertsIndex}` +
      this._commonService.setTime(time, dateBegin, dateEnd);
    return this._http.get<any[]>(req).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }

  getCountAlertAiBySev(time?: number, dateBegin?: string, dateEnd?: string) {
    let req =
      _webApi+`/pie_chart?index=${this._alertsIndex}&fieldAggregation[]=severity&sizeAggregation[]=10` +
      this._commonService.setTime(time, dateBegin, dateEnd);
    return this._http.get<any[]>(req).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }

  getPieChart(time?: number, dateBegin?: string, dateEnd?: string) {
    let req =
      _webApi+`/pie_chart?index=${this._deviancesIndex}&fieldAggregation[]=deviance&sizeAggregation[]=10` +
      this._commonService.setTime(time, dateBegin, dateEnd);
    return this._http.get<any[]>(req).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }

  getLast3Deviances(time?: number, dateBegin?: string, dateEnd?: string) {
    let req =
      _webApi+`/documents?index=${this._alertsIndex}&displayedField[]=_id,timestamp,deviance,src_geoip.geo.country_iso_code,dest_geoip.geo.country_iso_code,confiance,translation,severity,src_ip,dest_ip,flow_id,feedback&page=1&size=3&filter[severity]=1&sortedBy=timestamp&orderBy=desc` +
      this._commonService.setTime(time, dateBegin, dateEnd);
    return this._http
      .get<any[]>(req)
      .pipe(map((response: any) => response.data), catchError(() => of([])));
  }

  getHistogramDeviances(time?: number, dateBegin?: string, dateEnd?: string) {
    let req =
      _webApi+`/areaspline_chart?index=${this._deviancesIndex}&fieldAggregation[]=deviance` +
      this._commonService.setTime(time, dateBegin, dateEnd);
    return this._http.get<any[]>(req).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }

  getHistogramDeviancesNew(
    time?: number,
    dateBegin?: string,
    dateEnd?: string
  ) {
    let req =
      _webApi+`/areaspline_chart?index=${this._deviancesIndex}&fieldAggregation[]=deviance` +
      this._commonService.setTime(time, dateBegin, dateEnd);
    return this._http.get<any[]>(req).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }

  getLineAssets(interval: number, field: string) {
    return this._http
      .get<LineFieldResponse>(
        _webApi+`/documents?index=${this._actorsIndex}&page=1&size=10000&displayedField[]=@timestamp,${field}&timeInterval=${interval}`
      )
      .pipe(
        map((response: any) =>
          response.data.map((item: any) => [Date.parse(item["@timestamp"]), item[field]])
        ),
        catchError(() => of([]))
      );
  }

  getWorldMapSourceDataNew(
    type: string,
    time?: number,
    beginDate?: string,
    endDate?: string
  ) {
    let req =
      _webApi+`/map_chart?index=${this._deviancesIndex}&fieldAggregation[]=${type}_geoip.geo.country_iso_code.keyword&sizeAggregation[]=10` +
      this._commonService.setTime(time, beginDate, endDate);
    return this._http.get<any[]>(req).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }

  getHeatMapDataNew(type: string) {
    let week: boolean;
    switch (type) {
      case 'last':
        week = true;
        break;
      case 'current':
        week = false;
        break;
      default:
        week = true;
    }
    return this._http.get<HeatAlertData>(
      _webApi+`/documents?index=${this._calendarIndex}&page=1&size=1&displayedField[]=data,start_date,end_date&sortedBy=@timestamp&orderBy=desc&filter[active]=${week}&sizeAggregation[]=100`
    ).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }

  getAlertsAreaSpline(time?: number, beginDate?: string, endDate?: string) {
    let req =
      _webApi+`/areaspline_chart?index=${this._alertsIndex}&fieldAggregation[]=severity` +
      this._commonService.setTime(time, beginDate, endDate);
    return this._http.get<any>(req).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }

  getAlertBySevCount(time?: number, dateBegin?: string, dateEnd?: string) {
    let req =
      _webApi+`/pie_chart?index=${this._alertsIndex}&fieldAggregation[]=severity&sizeAggregation[]=10` +
      this._commonService.setTime(time, dateBegin, dateEnd);
    return this._http.get<any[]>(req).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }

  getHeatMapCurrentWeekData() {
    return this._http
      .get<any[]>(
        _webApi+`/documents?index=${this._calendarIndex}&page=1&size=1&displayedField[]=data,start_date,end_date&sortedBy=@timestamp&orderBy=desc&filter[active]=true`
      )
      .pipe(map((response: any) => response.data[0]), catchError(() => of([])));
  }

  getHeatMapLastWeekData() {
    return this._http
      .get<any[]>(
        _webApi+`/documents?index=${this._calendarIndex}&page=1&size=1&displayedField[]=data,start_date,end_date&sortedBy=@timestamp&orderBy=desc&filter[active]=false`
      )
      .pipe(map((response: any) => response.data[0]), catchError(() => of([])));
  }

  getAllAlerts(
    queryParams: IAAlertsQueryParams
  ): Observable<ApiResponse<string>> {
    const {
      display_col,
      page = 1,
      size = 10,
      timeInterval,
      dateBegin,
      dateEnd,
      ...optionalParams
    } = queryParams;
    const displayFields = display_col?.join(',');
    const url = _webApi+'/documents';


    let params = buildHttpParams2(this._alertsIndex, queryParams);
    
    return this._http
      .get<ApiResponse<string>>(url, { params })
      .pipe(catchError(() => of({} as ApiResponse<string>)));
  }

  private addOptionalParams(
    params: HttpParams,
    options: { [key: string]: string | undefined }
  ): HttpParams {
    Object.keys(options).forEach((key) => {
      const value = options[key];
      if (value) {
        const paramKey = paramMapping[key];
        params = params.set(paramKey, value);
      }
    });
    return params;
  }

  getDevianceById(communityId: string, srcIp: string) {
    const queryParams = [
      communityId ? `&match[community_id]=${communityId}` : '',
      srcIp ? `&match[src_ip]=${srcIp}` : '',
    ].join('');

    return this._http
      .get<any>(
        _webApi+`/document?index=${this._deviancesIndex}&size=1${queryParams}`
      )
      .pipe(
        map((response) => {
          return response?.data;
        }),
        catchError(() => of([]))
      );
  }

  getDevBySevBySrc(
    data: { source: string | number; deviances: number[] },
    time?: number,
    beginDate?: string,
    endDate?: string
  ) {
    const str: string = data.deviances.join(',');
    let req =
      _webApi+`/column_chart?index=${this._deviancesIndex}&fieldAggregation[]=${data.source}&filter[deviance]=${str}&sizeAggregation[]=100` +
      this._commonService.setTime(time, beginDate, endDate);
    return this._http
      .get<any[]>(req)
      .pipe(catchError(() => of([])));
  }

  sendFeedback(alertId: string, payload: any): Observable<any> {
    return this._http.put(_webApi+`/feedback/${alertId}`, payload, { responseType: 'json' });
  }
}
