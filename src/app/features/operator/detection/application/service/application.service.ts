import {inject, Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {CommonService} from "@core/services";
import {proxyPath} from "@configs/api-url.config";
import {BaseField, DateField, SelectField, TextField} from "@shared/components/form/fields";
import {FormControl, FormGroup} from "@angular/forms";
const _webApi = proxyPath.web;
@Injectable({
  providedIn: 'root',
})

export class ApplicationService {
  private _http = inject(HttpClient);
  private _index = 'logstash-alert-*';
  private _commonService = inject(CommonService);

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
        key: 'src_port',
        label: 'Source Port',
      }),
      new TextField({
        key: 'dest_port',
        label: 'Destination Port',
      }),
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

  getCountByPortDest(interval?: number, dateBegin?: string, dateEnd?: string) {
    return this._http.get<any>(
      _webApi+`/pie_chart?index=${this._index}&fieldAggregation[]=dest_port&sizeAggregation[]=10`+
      this._commonService.setTime(interval, dateBegin, dateEnd)
    );
  }

  getAreaAlertByAppProto(time?: number, beginDate?: string, endDate?: string) {
    let req =
      _webApi+`/areaspline_chart?index=${this._index}&fieldAggregation[]=app_proto.keyword` +
      this._commonService.setTime(time, beginDate, endDate);
    return this._http.get<any[]>(req);
  }
}
