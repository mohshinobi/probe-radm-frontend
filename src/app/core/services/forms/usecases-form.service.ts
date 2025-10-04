import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BaseField, DateField, NumberField, SelectField, TextField } from '@shared/components/form/fields';

@Injectable()
export class UsecasesFormService {

    getFormFields(): BaseField<string | number>[] {

        const form: BaseField<string | number>[] = [
            new DateField({
                key: 'startDate',
                label: 'From'
            }),
            new DateField({
                key: 'endDate',
                label: 'To'
            }),
            new TextField({
                key: 'name',
                label: 'Name',
            }),
            new TextField({
                key: 'timespan',
                label: 'Timespan'
            }),
            new NumberField({
                key: 'progress',
                label: 'Progress'
            }),
            new NumberField({
                key: 'severity',
                label: 'Dest Port',
            })
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