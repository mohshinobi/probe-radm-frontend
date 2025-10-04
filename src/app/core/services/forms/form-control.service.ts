import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BaseField } from '@shared/components/form/fields';

@Injectable()
export class FormControlService {

  formGroup(fields: BaseField<string>[]) {
    const group: any = {};
    fields.forEach(field => {
      group[field.key] = new FormControl(field.value || '', field.validation.constraints)
    });
    return new FormGroup(group);
  }
}