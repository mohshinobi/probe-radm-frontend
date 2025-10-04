import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DynamicInputComponent } from '../form/dynamic-input.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { LdapService } from '../configuration/ldap/ldap.service';

@Component({
    selector: 'app-dialog',
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatSlideToggleModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        DynamicInputComponent,
        CommonModule,
        MatIconModule,
        MatAutocompleteModule,
        MatOptionModule,
    ],
    templateUrl: './dialog.component.html',
    styleUrl: './dialog.component.scss'
})
export class DialogComponent {

  data = signal<any>(inject(MAT_DIALOG_DATA));

  toggleUpload = false;
  onSave = new EventEmitter();

  _ldapService = inject(LdapService);
  _toastrService = inject(ToastrService);
  selectedCertificateFile: File | null = null;

  parseSubnets(subnetsStr: string): { valid: { item: string }[], except: { item: string }[] } {
    // Supprimer les crochets et diviser la chaîne en sous-réseaux
    const subnets = subnetsStr.trim().replace(/^\[|\]$/g, '').split(',').map(item => item.trim());

    // Initialiser les listes de sous-réseaux valides et exclus
    const validSubnets: { item: string }[] = [];
    const exceptSubnets: { item: string }[] = [];

    // Itérer sur les sous-réseaux
    subnets.forEach(subnet => {
      // Vérifier si le sous-réseau est exclu
      if (subnet.startsWith('!')) {
        // Ajouter le sous-réseau exclu à la liste
        exceptSubnets.push({ item: subnet.substring(1).trim() }); // Trim pour enlever les espaces
      } else {
        // Ajouter le sous-réseau valide à la liste
        validSubnets.push({ item: subnet });
      }
    });

    // Retourner l'objet JSON
    return { valid: validSubnets, except: exceptSubnets };
  }

  reset(data: any) {
    this.dialogRef.close({ action: 'reset', section: data.section, config: data.configuration });
  }
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>
  ) { }

  file = undefined;
  getFile(key: string, event: any) {
    switch (key) {
      case 'client_private_key': this.data().form.value.client_private_key = event[0]; break;
      case 'client_certificate': this.data().form.value.client_certificate = event[0]; break;
      case 'server_certificate': this.data().form.value.server_certificate = event[0]; break;
      case 'certificate':
        this.data().form.value.certificate = event[0];
        this.selectedCertificateFile = event[0];
        break;
    }
  }

  showFileInput = false;
  changeTls() {
    this.showFileInput = this.data().form.value.tls;
    // tester si tls est true
    if (this.data().form.value.tls && this.data().section == "LDAP") {
      this.data.update((currentData) => ({
        ...currentData,
        title: currentData.title + 'S'
      }));
    }
    else if (!this.data().form.value.tls && this.data().section == "LDAP") {
      this.data.update((currentData) => ({
        ...currentData,
        title: currentData.title.replace('S', '')
      }));
    }

  }

  submitForm(type: string) {
    let label = '';
    console.log(type);
    
    switch (type) {
      case 'add':
        label = this.data().form.value.label;
        this.dialogRef.close({ form: this.data().form.value, action: this.data().action, section: this.data().section, label: label, deletable: this.data().deletable });
        break;
      case 'update':
        label = this.data().data.configuration;
        this.dialogRef.close({ form: this.data().form.value, action: this.data().action, section: this.data().section, label: label, deletable: this.data().deletable });
        break;
      case 'add_syslog':
        label = this.data().form.value.label;
        this.dialogRef.close({ form: this.data().form.value, action: this.data().action, section: this.data().section, label: label, deletable: this.data().deletable });
        break;
      case 'update_syslog':
        label = this.data().data.template;
        this.dialogRef.close({ form: this.data().form.value, action: this.data().action, section: this.data().data.template, label: label });
        break;
      case 'update_severity': this.dialogRef.close({ action: 'update_severity', key: this.data().data.key, severity: this.data().form.value.severity }); break;

      case 'update_ldap': this.dialogRef.close({ form: this.data().form.value, action: this.data().action, section: this.data().section }); break;

      case 'add_ldap': this.dialogRef.close({ form: this.data().form.value, action: this.data().action, section: this.data().section }); break;
    }

  }

  deleteConfig(section: string, config: string) {
    this.dialogRef.close({ action: 'delete_ldap', section: section, config: config });
  }

  deleteMultiConfig(section: string, config: string[]) {
    this.dialogRef.close({ action: 'multi_delete', section: section, config: config });
  }

  resetAll(section: string) {
    this.dialogRef.close({ action: 'reset-all', section: section });
  }

  deleteSyslog(section: string) {
    this.dialogRef.close({ action: 'delete-syslog', section: section });
  }

  enableSyslog(section: string) {
    this.dialogRef.close({ action: 'enable-syslog', section: section });
  }

  disableSyslog(section: string) {
    this.dialogRef.close({ action: 'disable-syslog', section: section });
  }

  close() {
    this.dialogRef.close();
  }

  ldapconnectionStatus = false;

  testConnectivity(configuration: any) {

    const config = {
      host: configuration.get('host').value,
      port: configuration.get('port').value,
      baseDn: configuration.get('baseDn').value,
      uidKey: configuration.get('uidKey').value,
      tls: configuration.get('tls').value,
      username: configuration.get('username').value,
      password: configuration.get('password').value,
      certificate: this.selectedCertificateFile
    }

    this._ldapService.pingLdapServerWithParams(config).subscribe({
      next: (response) => {
        this.ldapconnectionStatus = true;
        this._toastrService.success(response.message);
      },
      error: (err) => {
        this.ldapconnectionStatus = false;
        const errorMessage = err?.error.error || 'Unknown error.';
        this._toastrService.error(`Failed to connect to LDAP Server : ${errorMessage}`);
        console.error('Failed to connect to LDAP Server :', err);
      }
    });
  }

  addLdap(configuration: any) {
    const config = {
      host: configuration.get('host').value,
      port: configuration.get('port').value,
      baseDn: configuration.get('baseDn').value,
      uidKey: configuration.get('uidKey').value,
      tls: configuration.get('tls').value,
      certificate: this.selectedCertificateFile
    }

    this._ldapService.addConfigurationLdap(config).subscribe({
      next: () => {
        //this.ldap.update((item) => [...item, confLdap]);
        this._toastrService.success(`LDAP configuration updated successfuly`);
      },
      error: (err: { message: any; }) => {
        this._toastrService.error(`Failed to update LDAP configuration`);
      },
    });
  }

  updateLdap(configuration: any) {
    const config = {
      host: configuration.get('host').value,
      port: configuration.get('port').value,
      baseDn: configuration.get('baseDn').value,
      uidKey: configuration.get('uidKey').value,
      tls: configuration.get('tls').value,
      certificate: this.selectedCertificateFile
    }

    this._ldapService.updateConfigurationLdap(config).subscribe({
      next: () => {
        //this.ldap.update((item) => [...item, confLdap]);
        this._toastrService.success(`LDAP configuration updated successfuly`);
      },
      error: (err: { message: any; }) => {
        this._toastrService.error(`Failed to update LDAP configuration`);
      },
    });

  }

  updateSeverity(key: string, severity: string) {
    this.dialogRef.close({ action: 'update-severity', key: key, severity: severity });
  }

  isNotFormEmpty(form: FormGroup): boolean {
    const fields = ['host', 'port', 'baseDn', 'uidKey', 'username', 'password'];
    return fields.every(field => form.get(field)?.value);
  }


  isFormInvalid(): boolean {
  const form = this.data().form;
  if (form.invalid) return true;
  
  if (form.value.tls) {
    const serverCert = form.value.server_certificate;
    const clientCert = form.value.client_certificate;
    const clientKey = form.value.client_private_key;
    
    if (!serverCert || !clientCert || !clientKey) {
      return true;
    }
  }
  
  return false;
}
}
