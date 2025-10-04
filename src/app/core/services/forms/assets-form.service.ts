import { Injectable } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { BaseField, DateField, TextField, NumberField } from '@shared/components/form/fields';

@Injectable({
  providedIn: 'root'
})
export class AssetsFormService {

  getFormFields(): BaseField<string | number>[] {
 
         const form: BaseField<string | number>[] = [
           new TextField({
             key: 'devName',
             label: 'Name',
           }),
           new TextField({
             key: 'devType',
             label: 'Type',
           }),
           new TextField({
             key: 'devVendor',
             label: 'Vendor',
           }),
           new TextField({
             key: 'devLastConnection',
             label: 'Last Connection',
           }),
           new TextField({
             key: 'devStatus',
             label: 'Status',
           }),
           new TextField({
             key: 'devLastIP',
             label: 'Last IP',
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
}
