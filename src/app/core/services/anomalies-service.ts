import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { proxyPath } from '@configs/api-url.config';

const _webApi = proxyPath.web;

@Injectable({
    providedIn: 'root',
})
export class AnomaliesService {
    private _anomaliesIndex: string = 'logstash-zeek-weird-*,logstash-zeek-notice-*';
    private _http = inject(HttpClient);

    getAnomaliesNumber(interval:number) {
        return this._http.get<any[]>(_webApi+`/pie_chart?index=${this._anomaliesIndex}&fieldAggregation[]=type.keyword&sizeAggregation[]=10&timeInterval=${interval}`);
    }
}
