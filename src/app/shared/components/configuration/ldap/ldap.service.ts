import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LdapService {

  private _http = inject(HttpClient);

  getConfigurationLdap(): Observable<any> {
    return this._http.get<any[]>(`/api/api/ldap/config`).pipe(
      map(response => response),
      catchError(() => of([]))
    );
  }

  getLdapConfigStatus() {
    return this._http.get<any>(`/api/api/ldap/status`).pipe(
      map(response => response),
      catchError(() => of([]))
    );
  }

  pingLdapServer(): Observable<any> {
    return this._http.get<any>(`/api/api/pingLdap`).pipe(
      map(response => response),
      catchError(() => of([]))
    );
  }

  pingLdapServerWithParams(config: { host: string, port: number, baseDn: string, uidKey: string, tls: boolean, username: string, password: string, certificate?: File | null }): Observable<any> {

    const data = new FormData();

    if (config.tls.toString() === "") {
      config.tls = false;
    }

    data.append('host', config.host);
    data.append('port', config.port.toString());
    data.append('baseDn', config.baseDn);
    data.append('uidKey', config.uidKey);
    data.append('tls', config.tls.toString());
    data.append('username', config.username);
    data.append('password', config.password);

    if (config.certificate) {
      data.append('certificate', config.certificate, config.certificate.name);
    }

    return this._http.post<any>('/api/api/ldap/test-config', data);
  }

  addConfigurationLdap(config: {
    host: string,
    port: number,
    baseDn: string,
    uidKey: string,
    tls: boolean,
    certificate?: File | null
  }) {
    const data = new FormData();

    if (config.tls.toString() === "") {
      config.tls = false;
    }

    data.append('host', config.host);
    data.append('port', config.port.toString());
    data.append('baseDn', config.baseDn);
    data.append('uidKey', config.uidKey);
    data.append('tls', config.tls.toString());

    if (config.tls && config.certificate) {
      data.append('certificate', config.certificate, config.certificate.name);
    }

    return this._http.post(`/api/api/ldap/save-config`, data);
  }

  updateConfigurationLdap(config: {
    host: string,
    port: number,
    baseDn: string,
    uidKey: string,
    tls: boolean,
    certificate?: File | null
  }) {
    const data = new FormData();

    if (config.tls.toString() === "") {
      config.tls = false;
    }

    data.append('host', config.host);
    data.append('port', config.port.toString());
    data.append('baseDn', config.baseDn);
    data.append('uidKey', config.uidKey);
    data.append('tls', config.tls.toString());

    if (config.tls && config.certificate) {
      data.append('certificate', config.certificate, config.certificate.name);
    }

    return this._http.post(`/api/api/ldap/save-config`, data);
  }

  changeStatusLdap(config: { enabled: boolean }) {
    return this._http.patch(`api/api/ldap/status`, config).pipe(
      map(response => response),
      catchError(() => of([]))
    )
  }

  checkCertificateLdap(): Observable<{ exists: boolean; path: string | null }> {
    return this._http.get<{ exists: boolean; path: string | null }>(`/api/api/ldap/check-tls-certificate`).pipe(
      catchError((error) => {
        console.error('Error while checking certificate LDAP :', error);
        return of({ exists: false, path: null });
      })
    );
  }

  deleteConfigurationLdap() {
    return this._http.delete(`/api/api/ldap/delete-config`).pipe(
      map(response => response),
      catchError(() => of([]))
    );
  }
}
