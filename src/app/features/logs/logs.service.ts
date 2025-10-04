import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { proxyPath } from '@configs/api-url.config';
import { map, Observable } from 'rxjs';

export type LogType = 'system' | 'suricata' | 'users';

const _manageApi = proxyPath.management;

@Injectable({
  providedIn: 'root',
})
export class LogsService {
  private _http = inject(HttpClient);
  getLogs(type: LogType): Observable<string[]> {
    return this._http.get<string[]>(_manageApi+`/logs/${type}`);
  }

  getFileContent(type: LogType, fileName: string): Observable<string> {
    return this._http.get(_manageApi+`/logs/${type}/${fileName}`, {
      responseType: 'text',
    });
  }

  download(type: LogType, fileName: string): Observable<Blob> {
    return this._http.get(_manageApi+`/logs/download/${type}/${fileName}`, {
      responseType: 'blob',
    });
  }
}
