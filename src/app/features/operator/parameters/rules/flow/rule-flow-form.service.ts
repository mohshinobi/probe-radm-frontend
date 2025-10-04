import { FormControl, FormGroup } from "@angular/forms";
import { BaseField, NumberField, SelectField, TextField } from "@shared/components/form/fields";

export class RuleFlowFormService {

    getFormFields(): BaseField<string>[] {


        const form: BaseField<any>[] = [
            new TextField({
                key:    'src_ip',
                label:  'Src IP',
            }),
            new TextField({
                key:    'src_port',
                label:  'Src Port',
            }),
            new TextField({
                key:    'direction',
                label:  'Direction',
            }),
            new TextField({
                key:    'dest_ip',
                label:  'Destination IP',
            }),
            new TextField({
                key:    'dest_port',
                label:  'Destination Port',
            }),
            new TextField({
                key:    'protocol',
                label:  'Protocol',
            }),
            new TextField({
                key:    'options',
                label:  'Options',
            }),
            new TextField({
                key:    'threshold',
                label:  'Threshold',
            }),
            new TextField({
              key:   'msg',
              label: 'Message',
            }),
            new TextField({
                key:   'sid',
                label: 'SID',
            }),
            // new TextField({
            //     key:   'severity',
            //     label: 'Severity',
            // }),
            new TextField({
                key:   'action',
                label: 'Action',
            }),
            new SelectField({
                key:   'status',
                label: 'Status',
                options: [
                    { key:'enable' , value:'enable'},
                    { key:'disable' , value:'disable'},
                ],
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