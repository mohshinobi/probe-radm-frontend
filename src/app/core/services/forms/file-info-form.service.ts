import { Injectable } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { FormService } from "@core/interfaces/form-service.interface";
import { BaseField, DateField, TextField } from "@shared/components/form/fields";

@Injectable({
  providedIn: 'root'
})
export class FileDetailsFormService  implements FormService{

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
            label: 'SRC PORT',
          }),
          new TextField({
            key: 'dest_port',
            label: 'DEST PORT',
          }),
          new TextField({
            key: 'filename',
            label: 'FILENAME',
          }),
          new TextField({
            key: 'type',
            label: 'TYPE',
          }),
          new TextField({
            key: 'file_size',
            label: 'SIZE',
          }),
          new TextField({
            key: 'stored',
            label: 'STORED',
          }),
          new TextField({
            key: 'state',
            label: 'STATE',
          }),
          new TextField({
            key: 'http_method',
            label: 'METHOD',
          }),
          new TextField({
            key: 'proto',
            label: 'PROTO',
          }),
          new TextField({
            key: 'http.url',
            label: 'URL',
          }),
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


@Injectable()
export class HttpDetailsFormService {

    getFormFields(): BaseField<string>[] {

        const form: BaseField<string>[] = [
            // new DateField({
            //     key: '@timestamp',
            //     label: 'Created at',
                
            // }),

            new TextField({
                key: 'url',
                label: 'URL',
            }),
            new TextField({
                key: 'hostname',
                label: 'HOSTNAME',
            }),
            new TextField({
                key: 'status',
                label: 'STATUS',
            }),
            new TextField({
                key: 'http_method',
                label: 'METHOD',
            }),
            new TextField({
                key: 'http_user_agent',
                label: 'USER AGENT',
            }),
            new TextField({
                key: 'os_full',
                label: 'OS',
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