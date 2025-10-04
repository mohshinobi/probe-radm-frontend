import { Injectable } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { FormService } from "@core/interfaces/form-service.interface";
import { BaseField, DateField, TextField } from "@shared/components/form/fields";

@Injectable({
  providedIn: 'root'
})
export class SshFormService implements FormService {

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
            label: 'Source PORT',
          }),
          new TextField({
            key: 'dest_ip',
            label: 'Dest IP',
          }),
          new TextField({
            key: 'dest_port',
            label: 'Dest Port',
          }),
          new TextField({
            key: 'ssh.server.proto_version',
            label: 'SSH SERVER PROTO VERSION',
          }),

          new TextField({
            key: 'ssh.server.software_version',
            label: 'SSH SERVER SOFTWEAR VERSION',
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