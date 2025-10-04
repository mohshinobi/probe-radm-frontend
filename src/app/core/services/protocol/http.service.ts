import { Injectable } from '@angular/core';
import { BaseParamsInterface } from '@core/interfaces/base-params.interface';

export interface HttpAlertsQueryParams extends BaseParamsInterface {
  httpurl?: string;
  dest_port?: string;
  httpuser_agentname?: string;
  httpuser_agentversion?: string;
  httpstatus?: string;
  httphostname?: string;
  httpuser_agentosfull?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {

}
