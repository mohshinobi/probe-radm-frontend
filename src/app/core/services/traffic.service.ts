import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { CommonService } from './common.service';
import { proxyPath } from '@configs/api-url.config';

const _webApi = proxyPath.web;
const _configApi = proxyPath.config;

export interface licenseInfos { 
  hit_time_span_sec: number;
  hit_threshold_gigabits: number;
  hit_threshold_margin_percentage: number;
  hit_count_time_span_hour: number;
  hit_count: number;
  expiry_date: string;
  ip_address: string;
  mac_hash: string; 
}

@Injectable({
  providedIn: 'root',
})
export class TrafficService {
  private _http = inject(HttpClient);
  private _commonService = inject(CommonService);
  private _indexLicenceTraffic = 'logstash-licence-traffic-*';

  getBandwidth() {
    return this._http
      .get<number>(
        _webApi+`/documents?index=${this._indexLicenceTraffic}&page=1&size=1&displayedField[]=bandwidth_bps,bandwidth_mbps,bandwidth_gbps,exceed_count&sortedBy=timestamp&orderBy=desc`
      )
      .pipe(
        map((response: any) => {
          return response.data[0];
        })
      );
  }

  getTrafficByField(
    field: string,
    interval?: number,
    dateBegin?: string,
    dateEnd?: string
  ) {
    return this._http
      .get(
        _webApi+`/histo-field?index=${this._indexLicenceTraffic}&page=1&size=0&fieldAggregation[]=${field}` +
          this._commonService.setTime(interval, dateBegin, dateEnd)
      )
      .pipe(map((response: any) => response));
  }

  getLicenceInfo (){
    return this._http.get<licenseInfos>(_configApi+'/license').pipe(
      map((response: any) => response?.license || {}),
      catchError(() => of({}))
    );
  }

  getVersion(): Observable<any> {
    return this._http.get<any>(_configApi+'/version').pipe(
      map(response => {
        return response;
      }),
      catchError(() => of({
        "software_name": "RADM By Sidratech",
        "version": {
            "major": 0,
            "minor": 0,
            "patch": 0,
            "metadata": {
                "build": "1"
            }
        },
        "full_version": "0.0.0.0"
    }))
    );
  }

  getTrafficByPas(field:string, time?: number, beginDate?: string, endDate?: string) {

    let req =
          _webApi+`/documents-by-time?index=${this._indexLicenceTraffic}&displayedField[]=${field}` +
          this._commonService.setTime(time, beginDate, endDate);
        return this._http
          .get<any[]>(req)
          .pipe(
            map((response: any) => response.data),
            catchError(() => of([])));
  }

}




