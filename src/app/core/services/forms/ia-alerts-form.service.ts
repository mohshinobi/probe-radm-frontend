import { Injectable } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import {BaseField, DateField, SelectField, TextField} from "@shared/components/form/fields";

@Injectable()
export class IAAlertsFormService {

    getFormFields(): BaseField<string|number>[] {

        const form: BaseField<string|number>[] = [
            new DateField({
                key: 'startDate',
                label: 'From'
            }),
            new DateField({
                key: 'endDate',
                label: 'To'
            }),
            new TextField({
                key: 'flow_id',
                label: 'Flow ID',
            }),
           new SelectField({
                       key: 'severity',
                       label: 'Severity',
                       options: [
                         { key: '1', value: '1' },
                         { key: '2', value: '2' },
                         { key: '3', value: '3' },
                       ],
                     }),
          new SelectField({
            key: 'deviance',
            label: 'Deviance',
            options: [
              { key: '4', value: 'Critical' },
              { key: '3', value: 'High' },
            ],
          }),
            new TextField({
                key: 'src_ip',
                label: 'Source IP',
            }),
            new TextField({
                key: 'translation',
                label: 'Translation',
            }),
          new SelectField({
            key: 'confiance',
            label: 'Confidence',
            options: [
              { key: '4', value: 'Very High' },
              { key: '3', value: 'High' },
            ],
          }),
        ]

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
