import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { proxyPath } from '@configs/api-url.config';
import {map} from "rxjs";

const _webApi = proxyPath.web;

@Injectable({
  providedIn: 'root'
})
export class ZeekConnService{

  private _http = inject(HttpClient);
  private _zeekConnIndex = 'logstash-zeek-conn-*';
  private _zeekSslIndex = 'logstash-zeek-ssl-*';

  getZeekConnDetail(id:string, srcIp:string) {

    const queryParams = [
      id ? `&match[community_id]=${id}` : '',
      srcIp ? `&match[src_ip]=${srcIp}` : '',
    ].join('');

    return this._http.get<any>(_webApi+`/document?index=${this._zeekConnIndex}&size=1${queryParams}`).pipe(map(response =>{ return response?.data}));
  }

  getZeekSslDetail(uid:string,displayCol:string[]) {
    if (uid){
      uid = '&match[uid]=' + uid
    }
    let displayFields
    if (displayCol) {
      displayFields = '&displayedField[]=' + displayCol?.join(',')
    }
    return this._http.get<any>(_webApi+`/document?index=${this._zeekSslIndex}&size=1`+ uid + displayFields).pipe(map(response =>{ return response?.data}));
  }

}
