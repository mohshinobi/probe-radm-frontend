import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { DialogFormService } from '../dialog-form.service';
import { FormGroup, Validators } from '@angular/forms';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { BaseField, SelectField, TextField, SlideToggleField, FileField } from '@shared/components/form/fields';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, switchMap } from 'rxjs';
import { RoleService } from '@core/services/role.service';
import { ModalData } from '../modal-data.interface';
import { SyslogService } from './syslog.service';

@Component({
    selector: 'app-syslog',
    imports: [MatCardModule, MatIconModule, MatTableModule, MatTooltipModule, MatButtonModule],
    templateUrl: './syslog.component.html',
    styleUrl: './syslog.component.scss'
})
export class SyslogComponent {

    // Injection de services
    private _toastrService  = inject(ToastrService);
    private _syslogService  = inject(SyslogService);
    private _dialogService  = inject(DialogFormService);
    private _dialog         = inject(MatDialog);
    private _roleService    = inject(RoleService);

     // 

    isAdmin = this._roleService.isAdministrator();

    openDialog(data: any, title: string, type: string, section: string) {
        let modalDatas: ModalData = {
          title: title,
          data: data,
          type: type,
        };
    
        let fields: BaseField<string>[] = [];
        switch (type) {
          case 'add_syslog':
          fields = this.addSyslogFormFields;
          this.getNotConfiguratedSyslog();
    
          this.formAddSyslog = this._dialogService.getFormGroup(fields);
          this.formAddSyslog.controls['protocol'].disable();
    
    
          // Prepare modal data
          modalDatas = {
            ...modalDatas,
            fields: fields,
            form: this.formAddSyslog,
            action: type,
            section: section,
          };
    
          break;
          case 'update_syslog':
            // Cloner et modifier les labels des champs concernés
            fields = this.updateSyslogFormFields.map(field => {
              if (field.key === 'server_certificate') {
                return { ...field, label: data.tls && data.server_certificate ? data.server_certificate : 'Server Certificate' };
              }
              if (field.key === 'client_certificate') {
                return { ...field, label: data.tls && data.client_certificate ? data.client_certificate : 'Client Certificate' };
              }
              if (field.key === 'client_private_key') {
                return { ...field, label: data.tls && data.client_private_key ? data.client_private_key : 'Client Private Key' };
              }
              return field; // les autres restent inchangés
            });
    
            this.formUpdateSyslog = this._dialogService.getFormGroup(fields);
    
            modalDatas = {
              ...modalDatas,
              fields: fields,
              form: this.formUpdateSyslog,
              action: type,
              section: section,
              data: modalDatas.data,
            };
    
            // Remplissage du formulaire comme avant
            this.formUpdateSyslog.controls['template'].setValue(data.template);
            this.formUpdateSyslog.controls['template'].disable();
            this.formUpdateSyslog.controls['ip'].setValue(data.ip);
            this.formUpdateSyslog.controls['port'].setValue(data.port);
            this.formUpdateSyslog.controls['protocol'].setValue('RELP');
            this.formUpdateSyslog.controls['protocol'].disable();
            this.formUpdateSyslog.controls['permitted_peer'].setValue(data.permitted_peer);
            this.formUpdateSyslog.controls['tls'].setValue(data.tls);
    
          break;
    
        }
        const dialogRef = this._dialog.open(DialogComponent, {
          data: modalDatas,
          backdropClass: 'bdrop',
          panelClass: 'modal-body',
          width: '700px',
        });
    
    
        dialogRef.afterClosed().subscribe((res:any | undefined) => {
          if(res)
          switch (res.action) {
            // SYSLOG
            case 'add_syslog':
              this.addSyslog(res.form);
            break;
            case 'update_syslog':
              res.form.template = res.section;
              this.updateSyslog(res.form);
            break;
            case 'delete-syslog':
              this.deleteSyslog(res.section);
            break;
            case 'enable-syslog':
              this.enableSyslog(res.section);
            break;
            case 'disable-syslog':
              this.disableSyslog(res.section);
            break;
          }
        });
    }
    
    // Forms

    formAddSyslog!: FormGroup;
    formUpdateSyslog!: FormGroup;

    addSyslogFormFields: BaseField<string>[] = [
        new SelectField({
          key: 'template',
          label: 'Template',
          options: [],
          validation : {
            constraints: [
              Validators.required,
            ],
            errorMessages: {
              required: 'Template is required',
            }
          }
        }),
        new TextField({
          key: 'ip',
          label: 'IP',
          validation : {
            constraints: [
              Validators.required,
              Validators.pattern('^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')
            ],
            errorMessages: {
              required: 'IP is required',
              pattern: 'IP must be valid'
            }
          }
        }),
        new TextField({
          key: 'port',
          label: 'Port',
          validation: {
            constraints: [
              Validators.required,
              Validators.pattern('^[0-9]*$')
            ],
            errorMessages: {
              required: 'Port is required',
              pattern: 'Port must be valid. It should be a number'
            }
          }
        }),
        new TextField({
          key: 'protocol',
          label: 'Protocol',
          value: 'RELP',
        }),
        new TextField({
          key: 'permitted_peer',
          label: 'Permitted Peer',
          validation: {
            constraints: [
              Validators.required
            ],
            errorMessages: {
              required: 'Server Certificate is required'
            }
          }
        }),
        new SlideToggleField({
          key: 'tls',
          label: 'TLS',
          value: false
        }),
        new FileField({
          key: 'server_certificate',
          label: 'Server Certificate',
          accept: '.pem',
        }),
        new FileField({
          key: 'client_certificate',
          label: 'Client Certificate',
          accept: '.pem'
    
        }),
        new FileField({
          key: 'client_private_key',
          label: 'Client Key',
          accept: '.pem'
        })
    ];
    
    updateSyslogFormFields: BaseField<string>[] = [
      new TextField({
        key: 'template',
        label: 'Template',
  
      }),
      new TextField({
        key: 'protocol',
        label: 'Protocol',
        value: 'RELP',
      }),
      new TextField({
        key: 'ip',
        label: 'IP',
        validation : {
          constraints: [
            Validators.required,
            Validators.pattern('^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')
          ],
          errorMessages: {
            required: 'IP is required',
            pattern: 'IP must be valid'
          }
        }
      }),
      new TextField({
        key: 'port',
        label: 'Port',
        validation: {
          constraints: [
            Validators.required,
            Validators.pattern('^[0-9]*$')
          ],
          errorMessages: {
            required: 'Port is required',
            pattern: 'Port must be valid. It should be a number'
          }
        }
      }),
      new TextField({
        key: 'permitted_peer',
        label: 'Permitted Peer',
      }),
      new SlideToggleField({
        key: 'tls',
        label: 'TLS',
        value: false
      }),
      new FileField({
        key: 'server_certificate',
        label: 'Server Certificate',
        accept: '.pem'
      }),
      new FileField({
        key: 'client_certificate',
        label: 'Client Certificate',
        accept: '.pem'
      }),
      new FileField({
        key: 'client_private_key',
        label: 'Client Key',
        accept: '.pem'
      })
    ];

    // CRUD

    syslog = signal<any[]>([]);
  
    configurationSyslog = toSignal(
      combineLatest([
        toObservable(this.syslog),
      ]).pipe(
        switchMap(() =>{
            return this._syslogService.getConfigurationSyslog();
          }
        )
        ),
      { initialValue : [] }
    );
  
    addSyslog(form:any) {
      this._syslogService.addConfigurationSyslog(
        {
          template: form.template,
          ip: form.ip,
          port: form.port,
          protocol: 'RELP',
          enabled: true,
          tls: form.tls,
          permitted_peer: form.permitted_peer,
          server_certificate: form.server_certificate,
          client_certificate: form.client_certificate,
          client_private_key: form.client_private_key
        }).subscribe({
        next: () => {
          this.syslog.update((value:any) => [...value, form]);
          this._toastrService.success(
            `Syslog ${form.template} added successfully`
          );
        },
        error: (err) => {
          this._toastrService.error(
            `Failed to add syslog ${form.template} : ${err.error.detail[0].msg}`
          );
        },
      })
    }
  
    updateSyslog(form:any) {
      this._syslogService.updateConfigurationSyslog(
        {
          template: form.template,
          ip: form.ip,
          port: form.port,
          protocol: 'RELP',
          tls: form.tls,
          permitted_peer: form.permitted_peer,
          server_certificate: form.server_certificate,
          client_certificate: form.client_certificate,
          client_private_key: form.client_private_key
        }).subscribe({
        next: () => {
          this.syslog.update((value:any) => [...value, form]);
          this._toastrService.success(
            `Syslog ${form.tag} updated successfully`
          );
        },
        error: (err) => {
          this._toastrService.error(
            `Failed to update syslog ${form.template} : ${err.error.detail[0].msg}`
          );
        },
      })
    }
  
    deleteSyslog(template: string) {
      this._syslogService.deleteConfigurationSyslog({ template: template }).subscribe({
        next: () => {
          this.syslog.update((value:any) => [...value, template]);
          this._toastrService.success(
            `Syslog ${template} deleted successfully`
          );
        },
        error: (err: { message: any; }) => {
          this._toastrService.error(
            `Failed to delete syslog ${template} : ${err.message}`
          );
        },
      });
    }
  
    enableSyslog(template: string) {
  
      this._syslogService.changeStatusConfigurationSyslog({ template: template }).subscribe({
        next: () => {
          this.syslog.update((value:any) => [...value, template]);
          this._toastrService.success(
            `Syslog ${template} enabled successfully`
          );
        },
        error: (err: { message: any; }) => {
          this._toastrService.error(
            `Failed to enable syslog ${template} : ${err.message}`
          );
        },
      });
    }
  
    disableSyslog(template: string) {
      this._syslogService.changeStatusConfigurationSyslog({ template: template }).subscribe({
        next: () => {
          this.syslog.update((value:any) => [...value, template]);
          this._toastrService.success(
            `Syslog ${template} disabled successfully`
          );
        },
        error: (err: { message: any; }) => {
          this._toastrService.error(
            `Failed to disable syslog ${template} : ${err.message}`
          );
        },
      });
    }
  
    getConfigValues(config: {
      enabled: boolean;
      ip: string;
      port: string;
      protocol: string;
      tls: boolean;
      permitted_peer?: string;
      server_certificate?: string;
      client_certificate?: string;
      client_private_key?: string;
    }) {
      let objectConfig = [
        { label: 'IP', value: config.ip },
        { label: 'Port', value: config.port },
        { label: 'Protocol', value: 'RELP' },
        { label: 'TLS', value: config.tls ? 'Enabled' : 'Disabled' },
        { label: 'Permitted peer', value: config.permitted_peer },
      ];
  
      if (config.tls) {
        const tlsConfigs: any = [
          config.server_certificate && { label: 'Server certificate', value: config.server_certificate },
          config.client_certificate && { label: 'Client certificate', value: config.client_certificate },
          config.client_private_key && { label: 'Client private key', value: config.client_private_key }
        ].filter(Boolean);
  
        objectConfig.push(...tlsConfigs);
      }
  
      return objectConfig;
    }
    
    // Utils
    getNotConfiguratedSyslog(): void {
      const allowedConfigurations = ['Alert', 'System'];

      // Récupérer les templates déjà configurés
      const existingTemplates: string[] = this.configurationSyslog().map((syslog: any) => syslog.template);

      // Filtrer les templates autorisés non encore configurés
      const availableTemplates = allowedConfigurations
        .filter(template => !existingTemplates.includes(template))
        .map(template => ({ key: template, value: template }));

      // Mettre à jour les options du champ 'template'
      this.addSyslogFormFields.forEach(field => {
        if (field.key === 'template') {
          field.options = availableTemplates;
        }
      });
    }

}
