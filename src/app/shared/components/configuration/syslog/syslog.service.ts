import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError } from 'rxjs';
import { proxyPath } from '@configs/api-url.config';

const _configApi = proxyPath.config;

@Injectable({
  providedIn: 'root',
})
export class SyslogService {

  private _http = inject(HttpClient);

  getConfigurationSyslog(): Observable<any[]> {
    return this._http.get<any[]>(_configApi+`/conf/syslog`).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }

  addConfigurationSyslog(config: {
    template: string;
    ip: string;
    port: number;
    protocol: string;
    enabled: boolean;
    permitted_peer: string;
    tls: boolean;
    server_certificate?: File;
    client_certificate?: File;
    client_private_key?: File;
  }) {

    let formAdd = new FormData();
    formAdd.append('template', config.template);
    formAdd.append('ip', config.ip);
    formAdd.append('port', config.port.toString());
    formAdd.append('protocol', config.protocol);
    formAdd.append('enabled', config.enabled.toString());
    formAdd.append('permitted_peer', config.permitted_peer);
    formAdd.append('tls', config.tls ? 'true' : 'false');

    // Ajout des fichiers seulement s'ils existent
    if (config.server_certificate) {
      formAdd.append('server_certificate', config.server_certificate, 'server_certificate_'+config.template.toLowerCase()+'.pem');
    }
    if (config.client_certificate) {
      formAdd.append('client_certificate', config.client_certificate, 'client_certificate_'+config.template.toLowerCase()+'.pem');
    }
    if (config.client_private_key) {
      formAdd.append('client_private_key', config.client_private_key, 'client_private_key_'+config.template.toLowerCase()+'.pem');
    }

    // Envoi de la requête HTTP (Ne PAS définir `Content-Type` manuellement)

    return this._http.post(_configApi+`/conf/syslog`, formAdd).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }

  updateConfigurationSyslog(config: {
    template: string;
    ip: string;
    port: number;
    protocol: string;
    permitted_peer: string;
    tls: boolean;
    server_certificate?: File;
    client_certificate?: File;
    client_private_key?: File;
  }) {

    let formUpdate = new FormData();
    formUpdate.append('template', config.template);
    formUpdate.append('ip', config.ip);
    formUpdate.append('port', config.port.toString());
    formUpdate.append('protocol', config.protocol);
    formUpdate.append('permitted_peer', config.permitted_peer);
    formUpdate.append('tls', config.tls ? 'true' : 'false');

    // Ajout des fichiers seulement s'ils existent
    if (config.server_certificate) {
      formUpdate.append('server_certificate', config.server_certificate, 'server_certificate_'+config.template.toLowerCase()+'.pem');
    }
    if (config.client_certificate) {
      formUpdate.append('client_certificate', config.client_certificate, 'client_certificate_'+config.template.toLowerCase()+'.pem');
    }
    if (config.client_private_key) {
      formUpdate.append('client_private_key', config.client_private_key, 'client_private_key_'+config.template.toLowerCase()+'.pem');
    }

    return this._http.patch(_configApi+`/conf/syslog`, formUpdate).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }

  deleteConfigurationSyslog(config: { template: string }) {
    return this._http.delete(_configApi+`/conf/syslog`, { body: config }).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }

  changeStatusConfigurationSyslog(config: { template: string }) {
    return this._http.patch(_configApi+`/conf/syslog/changeStatus`, config).pipe(
      map(response =>response),
      catchError(() => of([]))
    );
  }

}
