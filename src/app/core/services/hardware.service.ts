import {inject, Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs";
import { proxyPath } from "@configs/api-url.config";

const _webApi = proxyPath.web;
@Injectable({
  providedIn: 'root',
})
export class HardwareService{
  private _http = inject(HttpClient);
  private _index = 'logstash-hw-metrics-*';

  getRamUsage(){
    return this._http.get<any[]>(_webApi+`/documents?index=${this._index}&page=1&size=1&displayedField%5B%5D=ram_usage&sortedBy=timestamp&orderBy=desc`)
    .pipe(map((response: any) => { return response?.data }));
  }

  getDiskUsage(){
    return this._http.get<any[]>(_webApi+`/documents?index=${this._index}&page=1&size=1&displayedField%5B%5D=disk_usage&sortedBy=timestamp&orderBy=desc`)
    .pipe(map((response: any) => { return response?.data }))
  }

  getCpuUsage(){
    return this._http.get<any[]>(_webApi+`/documents?index=${this._index}&page=1&size=1&displayedField%5B%5D=cpu_usage&sortedBy=timestamp&orderBy=desc`)
    .pipe(map((response: any) => { return response?.data }))
  }
}
