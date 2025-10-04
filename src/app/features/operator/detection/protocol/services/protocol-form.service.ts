
import { Injectable } from "@angular/core";
import { BaseField, DateField, NumberField, SelectField, TextField } from "@shared/components/form/fields";
import { FormControl, FormGroup } from "@angular/forms";

@Injectable()
export class ProtocolFormService {

  protocolFormFields: BaseField<string | number>[] = [
    new DateField({
      key: 'startDate',
      label: 'From'
    }),
    new DateField({
      key: 'endDate',
      label: 'To'
    }),
    new TextField({
      key: 'alert.signature',
      label: 'Signature',
    }),
    new SelectField({
      key: 'alert.severity',
      label: 'Severity',
      options: [
        { key: '1', value: '1' },
        { key: '2', value: '2' },
        { key: '3', value: '3' },
      ],
    }),
    new TextField({
      key: 'app_proto',
      label: 'App Proto',
    }),
    new TextField({
      key: 'threat',
      label: 'Threat',
    }),
    new TextField({
      key: 'src_ip',
      label: 'Source IP',
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
      key: 'src_port',
      label: 'Source Port',
    }),
    new TextField({
      key: 'query',
      label: 'RR NAME',
    }),
    new TextField({
      key: 'qtype_name',
      label: 'RR TYPE',
    }),
    new TextField({
      key: 'ssh.server.proto_version',
      label: 'SSH SERVER PROTO VERSION',
    }),
    new TextField({
      key: 'ssh.server.software_version',
      label: 'SSH SERVER SOFTWEAR VERSION',
    }),
    new TextField({
      key: 'version',
      label: 'TLS Version',
    }),
    new TextField({
      key: 'smb.command',
      label: 'SMB Command',
    }),
    new TextField({
      key: 'rdp.event_type',
      label: 'RDP Event TYPE',
    }),
    new TextField({
      key: 'rdp.cookie',
      label: 'RDP Cookie',
    }),
    new TextField({
      key: 'rdp.tx_id',
      label: 'Transaction',
    }),
    new TextField({
      key: 'krb5.cname',
      label: 'REQUEST ORIGIN',
    }),
    new TextField({
      key: 'krb5.realm',
      label: 'KERBEROS REALM',
    }),
    new TextField({
      key: 'krb5.sname',
      label: 'SERVICE TO ACCESS',
    }),
    new TextField({
      key: 'http.http_method',
      label: 'Http Methode',
    }),
    new TextField({
      key: 'http.hostname',
      label: 'Http Host Name',
    }),
    new TextField({
      key: 'http.url',
      label: 'URL',
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
      key: 'proto',
      label: 'PROTO',
    }),
    new TextField({
      key: 'client',
      label: 'Client',
    }),
    new TextField({
      key: 'server',
      label: 'Server',
    }),
    new TextField({
      key: 'auth_attempts',
      label: 'Auth Attemps',
    }),
    new TextField({
      key: 'auth_success',
      label: 'Auth Success',
    }),
    new TextField({
      key: 'id.orig_h',
      label: 'SRC IP',
    }),
    new TextField({
      key: 'id.orig_p',
      label: 'SRC PORT',
    }),
    new TextField({
      key: 'id.resp_h',
      label: 'DEST IP',
    }),
    new TextField({
      key: 'id.resp_p',
      label: 'DEST PORT',
    }),
    new TextField({
      key: 'answers',
      label: 'Answers',
    })
  ];

  getFormGroup(): FormGroup<any> {
    const group: any = {};
    this.protocolFormFields.forEach(field => {
      group[field.key] = new FormControl(field.value || '', field.validation.constraints)
    });
    return new FormGroup(group);
  }

  addFieldsFromKeys(form: FormGroup, keys: string[]) {

    Object.keys(form.controls).forEach(control => {
      form.removeControl(control);
    });

    const selectedFields = this.protocolFormFields.filter(field => keys.includes(field.key));
    
    selectedFields.forEach(field => {
      form.addControl(
        field.key,
        new FormControl(field.value || '', field.validation ? field.validation.constraints : [])
      );
    });
    return selectedFields
  }
}
