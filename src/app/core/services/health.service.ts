import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { proxyPath } from '@configs/api-url.config';
import { HeatlthcheckStats } from '@core/interfaces/heatlthcheck-stats';
import { map, Observable } from 'rxjs';

const _webApi = proxyPath.web;
export interface LineFieldResponse {
  data: any[];
  total: any;
}

@Injectable({
  providedIn: 'root'
})
export class HealthService {

  private _http = inject(HttpClient);
  private _index = 'logstash-stats-*';

  getStats(): Observable<HeatlthcheckStats[]> {
    return this._http.get<HeatlthcheckStats[]>(_webApi+`/documents?index=${this._index}&page=1&size=1&displayedField[]=stats.uptime,stats.capture.kernel_drops,stats.decoder.pkts,stats.tcp.invalid_checksum,stats.tcp.memuse,stats.memcap_pressure,stats.detect.engines.rules_loaded,stats.detect.engines.rules_failed,stats.detect.engines.rules_skipped,stats.detect.engines.last_reload,stats.detect.alert,stats.detect.alerts_suppressed,stats.tcp.syn,stats.tcp.synack,stats.tcp.rst,stats.tcp.overlap,stats.app_layer.error.tls.parser,stats.app_layer.error.http.parser,stats.app_layer.error.rdp.parser,stats.app_layer.error.ssh.parser,stats.tcp.memuse,stats.ftp.memuse,stats.http.memuse&sortedBy=timestamp&orderBy=desc`)
    .pipe(map((response: any) => response.data[0] as HeatlthcheckStats[]));
  }

  getLineData(interval:number, field:string){
    return this._http.get<LineFieldResponse>(
      _webApi+`/histo-field?index=${this._index}&page=1&size=0&fieldAggregation[]=${field}&timeInterval=${interval}`).pipe(map((response: any) => response.data));
  }
}
