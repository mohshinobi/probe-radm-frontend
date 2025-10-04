import {inject, Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {map} from "rxjs";
import { proxyPath } from "@configs/api-url.config";

const _webApi = proxyPath.web;

@Injectable({
  providedIn: 'root',
})
export class FlowService {
  private _http = inject(HttpClient);
  private _index = 'logstash-flow-*';

  getFlowData(id:string, srcIp:string) {

    const queryParams = [
      id ? `&match[community_id]=${id}` : '',
      srcIp ? `&match[src_ip]=${srcIp}` : '',
    ].join('');

    return this._http.get<any>(_webApi+`/document?index=${this._index}&size=1${queryParams}`).pipe(map(response =>{ return response?.data}));
  }
}
