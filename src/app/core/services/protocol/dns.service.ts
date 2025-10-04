import { Injectable } from '@angular/core';
import { BaseParamsInterface } from '@core/interfaces/base-params.interface';

export interface DnsQueryParams extends BaseParamsInterface {
  type?: string,
  rrname?: string,
  rrtype?: string,
  src_ip?: string;
  src_port?: string;
  dest_ip?: string;
  dest_port?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DnsService {

}
