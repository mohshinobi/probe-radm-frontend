import { Injectable } from '@angular/core';
import { BaseParamsInterface } from '@core/interfaces/base-params.interface';

export interface Krb5AlertsQueryParams extends BaseParamsInterface {
  src_ip?: string;
  src_port?: string;
  krb5cname?: string;
  krb5realm?: string;
  timestamp?: string;
  krb5sname?: string;
  dest_ip?: string;
  dest_port?: string;
  proto?: string;
  eventoriginale?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Krb5Service {

}
