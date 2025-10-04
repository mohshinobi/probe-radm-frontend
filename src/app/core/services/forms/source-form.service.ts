import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  BaseField,
  DateField,
  TextField,
} from '@shared/components/form/fields';

@Injectable({
  providedIn: 'root',
})
export class SourceFormService {
  getFormFields(): BaseField<string | number>[] {

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
        key: 'src_ip',
        label: 'Source IP',
      }),
      new TextField({
        key: 'alert.signature',
        label: 'Signature',
      }),
      new TextField({
        key: 'src_port',
        label: 'Source Port',
      }),
    ];

    return form.sort((a, b) => a.order - b.order);
  }

  getFormGroup(): FormGroup<any> {
    const group: any = {};
    this.getFormFields().forEach((field) => {
      group[field.key] = new FormControl(
        field.value || '',
        field.validation.constraints
      );
    });
    return new FormGroup(group);
  }
}
