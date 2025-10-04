import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { DialogFormService } from '../dialog-form.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { FormGroup, Validators } from '@angular/forms';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { BaseField, TextField, SlideToggleField, FileField } from '@shared/components/form/fields';
import { combineLatest, switchMap } from 'rxjs';
import { UpperCasePipe } from '@angular/common';
import { RoleService } from '@core/services/role.service';
import { ModalData } from '../modal-data.interface';
import { LdapService } from './ldap.service';
import { PasswordField } from '@shared/components/form/fields/password.field';

@Component({
  selector: 'app-ldap',
  imports: [MatCardModule, MatIconModule, MatTableModule, MatTooltipModule, MatButtonModule, UpperCasePipe, MatSlideToggleModule],
  templateUrl: './ldap.component.html',
  styleUrl: './ldap.component.scss'
})
export class LdapComponent {

  // Injection de services
  private _toastrService = inject(ToastrService);
  private _ldapService = inject(LdapService);
  private _dialogService = inject(DialogFormService);
  private _dialog = inject(MatDialog);
  private _roleService = inject(RoleService);

  isAdmin = this._roleService.isAdministrator();

  openDialog(data: any, title: string, type: string, section: string) {
    let modalDatas: ModalData = {
      title: title,
      data: data,
      type: type,
    };

    let fields: BaseField<string>[] = [];
    switch (type) {

      case 'add_ldap':
        fields = this.addLDAPFormFields;

        this.formAddLDAP = this._dialogService.getFormGroup(fields);

        // DETECT WHEN CHANGE TLS

        this.formAddLDAP.get('tls')?.valueChanges.subscribe((tlsValue: boolean) => {
          const defaultPort = tlsValue ? 636 : 389;
          this.formAddLDAP.patchValue({ port: defaultPort }, { emitEvent: false });
        });

        modalDatas = {
          ...modalDatas,
          fields: fields,
          form: this.formAddLDAP,
          action: type,
          section: section,
          data: modalDatas.data,
        };
        break;

      case 'update_ldap':
        fields = this.updateLDAPFormFields;

        this.formUpdateLDAP = this._dialogService.getFormGroup(fields);

        // SET VALUES

        this.formUpdateLDAP.controls['host'].setValue(data.host);
        this.formUpdateLDAP.controls['port'].setValue(data.port);
        this.formUpdateLDAP.controls['baseDn'].setValue(data.baseDn);
        this.formUpdateLDAP.controls['uidKey'].setValue(data.uidKey);
        this.formUpdateLDAP.controls['tls'].setValue(data.tls);
        this.formUpdateLDAP.controls['certificate'].setValue(this.certificateLdapExists().path);

        // DETECT WHEN CHANGE TLS

        this.formUpdateLDAP.get('tls')?.valueChanges.subscribe((tlsValue: boolean) => {
          const defaultPort = tlsValue ? 636 : 389;
          this.formUpdateLDAP.patchValue({ port: defaultPort }, { emitEvent: false });
        });

        modalDatas = {
          ...modalDatas,
          fields: fields,
          form: this.formUpdateLDAP,
          action: type,
          section: section,
          data: modalDatas.data,
        };
        break;
    }
    const dialogRef = this._dialog.open(DialogComponent, {
      data: modalDatas,
      backdropClass: 'bdrop',
      panelClass: 'modal-body',
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((res: any | undefined) => {
      if (res)
        switch (res.action) {
          case 'update_ldap':
          //this.updateLdap(res.form);
          case 'add_ldap':
            this.ldap.update((item) => [...item, res.form]);
            break;
          case 'delete_ldap':
              this.deleteLdapConfig();
            break;
          default:
            break;
        }
    });
  }

  // forms
  formAddLDAP!: FormGroup;
  formUpdateLDAP!: FormGroup;

  addLDAPFormFields: BaseField<string>[] = [
    new TextField({
      key: 'host',
      label: 'Host',
      validation: {
        constraints: [
          Validators.required
        ],
        errorMessages: {
          required: 'Host is required'
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
      key: 'baseDn',
      label: 'Base DN',
      validation: {
        constraints: [
          Validators.required
        ],
        errorMessages: {
          required: 'Base DN is required'
        }
      }
    }),
    new TextField({
      key: 'uidKey',
      label: 'UID Key',
      validation: {
        constraints: [
          Validators.required
        ],
        errorMessages: {
          required: 'UID Key is required'
        }
      }
    }),
    new SlideToggleField({
      key: 'tls',
      label: 'TLS'
    }),
    new FileField({
      key: 'certificate',
      label: 'Certificate',
      accept: '.pem'
    }),
    new TextField({
      key: 'username',
      label: 'Username',
    }),
    new PasswordField({
      key: 'password',
      label: 'Password',
    })
  ];

  updateLDAPFormFields: BaseField<string>[] = [
    new TextField({
      key: 'host',
      label: 'Host',
      validation: {
        constraints: [
          Validators.required
        ],
        errorMessages: {
          required: 'Host is required'
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
      key: 'baseDn',
      label: 'Base DN',
      validation: {
        constraints: [
          Validators.required
        ],
        errorMessages: {
          required: 'Base DN is required'
        }
      }
    }),
    new TextField({
      key: 'uidKey',
      label: 'UID Key',
      validation: {
        constraints: [
          Validators.required
        ],
        errorMessages: {
          required: 'UID Key is required'
        }
      }
    }),
    new SlideToggleField({
      key: 'tls',
      label: 'TLS'
    }),
    new FileField({
      key: 'certificate',
      label: 'Certificate',
      accept: '.pem'
    }),
    new TextField({
      key: 'username',
      label: 'Username',
    }),
    new PasswordField({
      key: 'password',
      label: 'Password',
    })
  ];

  // LDAP
  ldap = signal<any[]>([]);

  configurationLdap = toSignal(
    combineLatest([
      toObservable(this.ldap),
    ]).pipe(
      switchMap(() => {
        return this._ldapService.getConfigurationLdap();
      }
      )
    ),
    { initialValue: [] }
  );

  certificateLdapExists = toSignal(
    this._ldapService.checkCertificateLdap(), {
    initialValue: { exists: false, path: null }
  }
  );

  extractLDAPData(data: any) {
    return Object.entries(data)
      .filter(([key]) => !['@context', '@id', '@type', 'id', 'enabled', 'unavailable'].includes(key))
      .map(([key, value]) => ({ key, value }));
  }

  toggleLdap(event: MatSlideToggleChange): void {
    switch (event.checked) {
      case true:
        this.changeStatusLdap({ enabled: true });
        break;
      case false:
        this.changeStatusLdap({ enabled: false });
        break;
    }
  }

  changeStatusLdap(config: { enabled: boolean }) {
    this._ldapService.changeStatusLdap(config).subscribe({
      next: () => {
        this.ldap.update((item) => [...item, config]);
        const status = config.enabled ? 'enabled' : 'disabled';
        this._toastrService.success(`LDAP is ${status} successfully.`);
      },
      error: (err) => {
        const status = config.enabled ? 'enablement' : 'desablement';
        this._toastrService.error(`Failed to ${status} LDAP`);
      },
    });
  }
  deleteLdapConfig() {
    this._ldapService.deleteConfigurationLdap().subscribe({
      next: (resp) => {
        this.ldap.update((item) => [...item, resp]);
        this._toastrService.success(
          `LDAP configuration deleted successfully`
        );
      },
      error: (err: { message: any; }) => {
        this._toastrService.error(
          `Failed to delete LDAP configuration : ${err.message}`
        );
      },
    });
  }

  testConnectivity() {
    this._ldapService.pingLdapServer().subscribe({
      next: (response) => {

        // Vérification du code de statut HTTP
        if (response.ldapAvailable) {
          this._toastrService.success(`Connected to LDAP Server successfully`);
        } else {
          this._toastrService.error(response.message);
        }
      },
      error: (err) => {
        // Gestion des erreurs si l'appel échoue
        console.error('Erreur complète :', err);
        this._toastrService.error(`Failed to connect to LDAP Server: ${err.message}`);
      }
    });
  }
}
