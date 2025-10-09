import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BaseField, DateField, NumberField, SelectField, TextField } from '@shared/components/form/fields';

@Injectable()
export class AnomaliesFormService {

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
            new SelectField({
                key: 'type',
                label: 'Type',
                options: [{key: 'zeek-notice', value: 'Notice'},{key: 'zeek-weird', value: 'Weird'}]
            }),
            new TextField({
                key: 'src_ip',
                label: 'Src IP'
            }),
            new TextField({
                key: 'dest_ip',
                label: 'Dest IP'
            }),
            new TextField({
                key: 'dest_port',
                label: 'Dest Port',
            }),
            new TextField({
                key: 'proto',
                label: 'protocol',
            }),
            new TextField({
                key: 'note',
                label: 'Note',
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