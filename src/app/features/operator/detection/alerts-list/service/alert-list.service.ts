import {inject, Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {AlertQueryParams} from "@core/services";
import {proxyPath} from "@configs/api-url.config";
import {BaseField, DateField, SelectField, TextField} from "@shared/components/form/fields";
import {FormControl, FormGroup} from "@angular/forms";
import {catchError, Observable, of} from "rxjs";
import {ApiResponse} from "@core/interfaces/api-response.interface";
import {buildHttpParams2} from "@core/services/buildHttpParams";
const _webApi = proxyPath.web;
@Injectable({
  providedIn: 'root',
})

export class AlertListService {
  private _http = inject(HttpClient);
  private _index = 'logstash-alert-*';

  getFormFields(): BaseField<string|number>[] {
    const form: BaseField<string | number>[] = [
      new DateField({
        key: 'startDate',
        label: 'From',
      }),
      new DateField({
        key: 'endDate',
        label: 'To',
      }),
      new TextField({
        key: 'alert.signature',
        label: 'Signature',
      }),
      new SelectField({
        key: 'alert.severity',
        label: 'Severity',
        options: [
          { key: '1', value: '1' },
          { key: '2', value: '2' },
          { key: '3', value: '3' },
        ],
      }),
      new TextField({
        key: 'alert.signature_id',
        label: 'Sid',
      }),
      new TextField({
        key: 'alert.category',
        label: 'Category',
      }),
      new TextField({
        key: 'app_proto',
        label: 'App Proto',
      }),
      new TextField({
        key: 'threat',
        label: 'Threat',
      }),
      new TextField({
        key: 'src_ip',
        label: 'Source IP',
      }),
      new TextField({
        key: 'dest_ip',
        label: 'Destination IP',
      }),
      new TextField({
        key: 'dest_port',
        label: 'Destination Port',
      })
    ];

    return form.sort((a, b) => a.order - b.order);
  }

  getFormGroup(): FormGroup<any> {
    const group: any = {};
    this.getFormFields().forEach(field => {
      group[field.key] = new FormControl(field.value || '', field.validation.constraints)
    });
    return new FormGroup(group);
  }

  getAllAlertsForTable(
    queryParams: AlertQueryParams
  ): Observable<ApiResponse<string>> {
    let after = null;
    if (queryParams.after) {
      after = queryParams.after;
      delete queryParams.after;
    }

    let params = buildHttpParams2(this._index, queryParams);
    params = params.append('fieldAggregation[]', 'dest_port');
    params = params.append('fieldAggregation[]', 'dest_ip.keyword');
    params = params.append('fieldAggregation[]', 'alert.signature_id');
    params = params.append('fieldAggregation[]', 'alert.rev');
    if (after) {
      Object.keys(after).forEach((key) => {
        const value = after![key];
        params = params.append(`after[${key}]`, value);
      });
    }

    return this._http
      .get<ApiResponse<string>>(_webApi+'/documents', { params })
      .pipe(catchError(() => of({} as ApiResponse<string>)));
  }

  getTimeLineData(
    queryParams: AlertQueryParams,
    src_ip?: string,
    dest_ip?: string,
    signature_id?: number,
    rev?: number,
    timestamp?: number,
    size?: number,
    page?: number
  ): Observable<ApiResponse<string>> {
    const modifiedQueryParams = {
      ...queryParams,
      size: size ?? queryParams.size,
      page: page ?? queryParams.page,
    };

    let params = buildHttpParams2(this._index, modifiedQueryParams);
    [
      'src_ip.keyword',
      'dest_ip.keyword',
      'alert.signature_id',
      'alert.rev',
    ].forEach((field) => {
      params = params.append('fieldAggregation[]', field);
    });
    const valueParams = [
      src_ip !== undefined && src_ip !== null ? `src_ip:${src_ip}` : null,
      dest_ip ? `dest_ip:${dest_ip}` : null,
      signature_id !== undefined ? `alert.signature_id:${signature_id}` : null,
      rev !== undefined ? `alert.rev:${rev}` : null,
      timestamp !== undefined && timestamp !== null
        ? `timestamp:${timestamp}`
        : null,
    ]
      .filter(Boolean)
      .join(',');

    if (valueParams) {
      params = params.append('value', valueParams);
    }

    return this._http
      .get<ApiResponse<string>>(_webApi+'/timeline', { params })
      .pipe(catchError(() => of({} as ApiResponse<string>)));
  }

  getCountAlertInTimeStamp(selectedTimestamp: number) {
    return this._http.get<any[]>(
      _webApi+`/alert-count?index=${this._index}&field=@timestamp&value=${selectedTimestamp}`
    );
  }
}
