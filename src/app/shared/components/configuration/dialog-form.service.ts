
import { Injectable } from "@angular/core";
import { BaseField } from "@shared/components/form/fields";
import { FormControl, FormGroup } from "@angular/forms";

@Injectable()
export class DialogFormService {

  getFormGroup(formFields: BaseField<string>[]): FormGroup<any> {
    const group: any = {};
    formFields.forEach(field => {
      group[field.key] = new FormControl(field.value || '', field.validation.constraints)
    });
    return new FormGroup(group);
  }

  getCheckFormGroup(formFields: BaseField<boolean>[]): FormGroup<any> {
    const group: any = {};
    formFields.forEach(field => {
      group[field.key] = new FormControl(field.value || '', field.validation.constraints)
    });
    return new FormGroup(group);
  }
}
