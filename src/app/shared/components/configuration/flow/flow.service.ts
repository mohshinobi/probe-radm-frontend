import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError } from 'rxjs';
import { proxyPath } from '@configs/api-url.config';

const _configApi = proxyPath.config;

@Injectable({
  providedIn: 'root',
})
export class FlowService {

  private _http = inject(HttpClient);

  getConfigurationFlow(): Observable<any[]> {
    return this._http.get<any[]>(_configApi+`/conf/flows`);
  }

  addConfigurationFlow(config: { section: string; configuration: string; value: string }) {
    return this._http.post(_configApi+`/conf/flows`, config).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }

  updateConfigurationFlow(config: { section: string; configuration: string; value: string }) {
    return this._http.put(_configApi+`/conf/flows`, config).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }
  resetConfigurationFlow(config: { section: string; configuration: string }) {
    return this._http.post(_configApi+`/conf/flows/reset`, config).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }
  resetAllConfigurationFlow(config: { section: string }) {
    return this._http.post(_configApi+`/conf/flows/resetAll`, config).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }
  deleteConfigurationFlow(config: { section: string; configuration: string[] }) {
    return this._http.delete(_configApi+`/conf/flows`, { body: config }).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }

}
