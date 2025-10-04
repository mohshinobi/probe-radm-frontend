import { Injectable } from '@angular/core';
import { BaseParamsInterface } from '@core/interfaces/base-params.interface';

export interface SmbAlertsQueryParams extends BaseParamsInterface {
  src_ip?: string;
  smbcommand?: string;
  smbtree_id?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SmbService {

}
