import { Injectable } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { FormService } from "@core/interfaces/form-service.interface";
import { BaseField, DateField, TextField } from "@shared/components/form/fields";

@Injectable({
    providedIn: 'root'
})
export class HttpFormService implements FormService {

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
                key: 'src_ip',
                label: 'Source IP',
            }),
            new TextField({
                key: 'src_port',
                label: 'Destination Port',
            }),

            new TextField({
                key: 'dest_ip',
                label: 'Destination IP',
            }),

            new TextField({
                key: 'dest_port',
                label: 'Destination Port',
            }),
            new TextField({
                key: 'http_method',
                label: 'Http Methode',
            }),
            new TextField({
                key: 'httphostname',
                label: 'Http Host Name',
            }),
            new TextField({
                key: 'http.url',
                label: 'URL',
            })];

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