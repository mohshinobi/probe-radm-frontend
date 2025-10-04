import { Injectable } from '@angular/core';
import { BaseParamsInterface } from '@core/interfaces/base-params.interface';

export interface FileInfoQueryParams extends BaseParamsInterface {
  filename?: string,
  type?: string,
  file_size?: string,
  stored?: string,
  state?: string,
  gaps?: string,
  url?: string,
  hostname?: string,
  status?: string,
  http_method?: string,
  http_user_agent?: string,
  os_full?: string,
}

@Injectable({
  providedIn: 'root',
})
export class FileinfoService {

}

