import { Injectable } from '@angular/core';
import { BaseParamsInterface } from '@core/interfaces/base-params.interface';

export interface SshQueryParams extends BaseParamsInterface {
  src_ip?: string;
  dest_ip?: string;
  dest_port?: string;
  proto?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SshService {

}
