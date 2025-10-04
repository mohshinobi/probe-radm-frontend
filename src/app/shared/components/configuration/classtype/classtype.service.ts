import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { of, catchError } from 'rxjs';
import { proxyPath } from '@configs/api-url.config';

const _configApi = proxyPath.config;

@Injectable({
  providedIn: 'root',
})
export class ClasstypeService {

  private _http = inject(HttpClient);

  getClassification() {
    return this._http.get<any[]>(_configApi+`/conf/classtype`).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }

  updateSeverity(config: {key: string, severity: number}){
    return this._http.patch(_configApi+`/conf/classtype`, config).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }

}
