import { Injectable } from '@angular/core';
import { BaseParamsInterface } from '@core/interfaces/base-params.interface';

export interface RdpAlertsQueryParams extends BaseParamsInterface {
  src_ip?: string;
  src_port?: string;
  dest_ip?: string;
  dest_port?: string;
  rdpevent_type?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RdpService {

}
