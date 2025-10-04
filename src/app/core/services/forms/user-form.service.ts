import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  BaseField,
  DateField,
  SelectField,
  TextField,
} from '@shared/components/form/fields';

@Injectable({
  providedIn: 'root',
})
export class UsersFormService {
  getFormFields(): BaseField<string | number>[] {
    const form: BaseField<string | number>[] = [
      new TextField({
        key: 'username',
        label: 'Username',
      }),
      new SelectField({
        key: 'roles',
        label: 'Role',
        options: [
          {key: 'ROLE_ADMIN', value: 'ADMIN'},
          {key: 'ROLE_OPERATOR', value: 'OPERATOR'},
         // {key: 'ROLE_AUDITOR', value: 'AUDITOR'}
        ]
      }),
      new DateField({
        key: 'createdAt[after]',
        label: 'Created At',
      }),

      new DateField({
        key: 'updateAt[after]',
        label: 'Updated At',
      }),

      new SelectField({
        key: 'enabled',
        label: 'enabled',
        options: [
          {key: 'true', value: 'Enabled'},
          {key: 'false', value: 'Disabled'},
        ]
      }),
      new SelectField({
        key: 'authorized',
        label: 'authorized',
        options: [
          {key: 'true', value: 'Authorized'},
          {key: 'false', value: 'Not Authorized'},
        ]
      }),

      new SelectField({
        key: 'firstConnection',
        label: 'First Connection',
        options: [
          {key: 'true', value: 'true'},
          {key: 'false', value: 'false'},
        ]
      }),
    ];

    return form.sort((a, b) => a.order - b.order); 
  }
  roles: string[] = ['ROLE_ADMIN', 'ROLE_OPERATOR', 'ROLE_AUDITOR'];

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
