import { Injectable } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { BaseField, DateField, TextField } from "@shared/components/form/fields";

@Injectable()
export class AssetOrdersActifsFormService {

    getFormFields(): BaseField<string>[] {

        const form: BaseField<string>[] = [
            new DateField({
                key: 'startDate',
                label: 'From'
            }),
            new DateField({
                key: 'endDate',
                label: 'To'
            }),
            new TextField({
                key: 'ip',
                label: 'IP ADDRESS'
            }),
            new TextField({
                key: 'mac',
                label: 'MAC ADRESS',
            }),
            new TextField({
                key: 'hostname',
                label: 'HOSTNAME',
            }),
            new TextField({
                key: 'os',
                label: 'OS',
            }),
            new TextField({
                key: 'type',
                label: 'TYPE',
            }),
            new TextField({
                key: 'status',
                label: 'STATUS',
            }),
            new TextField({
                key: 'connectivity',
                label: 'CONNECTIVITY',
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


@Injectable()
export class AssetOrdersVulnerabilitiesFormService {

    getFormFields(): BaseField<string>[] {

        const form: BaseField<string>[] = [
            new DateField({
                key: '@timestamp',
                label: 'Created at',
            }),
            new TextField({
                key: 'vulnerability',
                label: 'VULNERABILITY',
            }),
            new TextField({
                key: 'fixes',
                label: 'FIXES',
            }),
            new TextField({
                key: 'hostname',
                label: 'HOSTNAME',
            }),
            new TextField({
                key: 'update_status',
                label: 'UPDATE STATUS',
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