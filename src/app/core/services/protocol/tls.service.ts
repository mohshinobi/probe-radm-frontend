import { Injectable } from '@angular/core';
import { BaseParamsInterface } from '@core/interfaces/base-params.interface';

export interface TlsAlertsQueryParams extends BaseParamsInterface {
  src_port?: string;
  dest_port?: string;
  proto?: string;
  direction?: string;
}
@Injectable({
  providedIn: 'root',
})
export class TlsService {

}
