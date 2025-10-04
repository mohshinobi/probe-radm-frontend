import { UpperCasePipe } from '@angular/common';
import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseField, CheckboxField, TextField } from '@shared/components/form/fields';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, switchMap } from 'rxjs';
import { DialogFormService } from '../dialog-form.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { ModalData } from '../modal-data.interface';
import { FlowService } from './flow.service';

@Component({
    selector: 'app-flow',
    imports: [MatCardModule, MatIconModule, MatTableModule, MatTooltipModule, MatButtonModule],
    templateUrl: './flow.component.html',
    styleUrl: './flow.component.scss'
})

export class FlowComponent {

  // Injection de services
  private _toastrService  = inject(ToastrService);
  private _flowService    = inject(FlowService);
  private _dialogService  = inject(DialogFormService);
  private _dialog         = inject(MatDialog);
  

  // 
  openDialog(data: any, title: string, type: string, section: string) {
      let modalDatas: ModalData = {
        title: title,
        data: data,
        type: type,
      };
  
      let fields: BaseField<string>[] = [];
      switch (type) {
  
        case 'add':
          if (section === 'address-groups') {
            fields = this.addAddressesFormFields;
          } else if (section === 'port-groups') {
            fields = this.addPortFormFields;
          }
          this.formAdd = this._dialogService.getFormGroup(fields);
          modalDatas = {
            ...modalDatas,
            fields: fields,
            form: this.formAdd,
            action: type,
            section: section,
          };
          break;
  
        case 'update':
          if (section === 'address-groups') {
            fields = this.updateAddressesFormFields;
          } else if (section === 'port-groups') {
            fields = this.updatePortFormFields;
          }
          this.formUpdate = this._dialogService.getFormGroup(fields);
          let dataParsed = this.parseData(data.value);
          this.formUpdate.controls['label'].setValue(data.configuration);
          if(!data.deletable) {
            this.formUpdate.controls['label'].disable();
          }
  
          this.formUpdate.controls['valid'].setValue(
            dataParsed.valid
          );
          this.formUpdate.controls['except'].setValue(
            dataParsed.except
          );
  
          modalDatas = {
            ...modalDatas,
            fields: fields,
            form: this.formUpdate,
            action: type,
            section: section,
          };
          break;
        case 'delete':
          modalDatas = { ...modalDatas, action: type, section: section };
          break;
        case 'multi_delete':
          const extra = this.getListOfExtraConfigs(section);
  
          this.multiDeleteFormFields = [];
          extra.map((item: any) => {
            this.multiDeleteFormFields.push(
              new CheckboxField({
                key: item,
                label: item,
              })
            );
          });
  
          const fieldsMulti = this.multiDeleteFormFields;
          this.formMultiDelete =
            this._dialogService.getCheckFormGroup(fieldsMulti);
          modalDatas = {
            ...modalDatas,
            fields: fieldsMulti,
            form: this.formMultiDelete,
            action: type,
            section: section,
          };
          break;
          
        case 'details':
          modalDatas = { ...modalDatas, action: type, section: section };
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
          case 'add':
            res.form = this.extractItems(res.form).toString();
            let confToAdd = {
              label: res.label,
              value: res.form,
              section: res.section
            }
            this.addConfig(confToAdd);
            break;
  
          case 'update':
            res.form = this.extractItems(res.form).toString();
            let confToUpdate = {
              label: res.label,
              value: res.form,
              section: res.section
            }
            this.updateConfig(confToUpdate);
            break;
  
          case 'delete':
            this.deleteConfig({ section: res.section, configuration: [res.config] });
            break;
  
          case 'reset-all':
            this.resetAll(res.section);
            break;
  
          case 'multi_delete': 
            const selectedKeys = Object.entries(res.config || {})
              .filter(([_, value]) => value === true)
              .map(([key]) => key);
            selectedKeys.forEach((configKey) => {
              this.deleteConfig({ section: res.section, configuration: [configKey] });
            });
            break;
        
          case 'reset':
            this.reset({
              label: res.label,
              name: res.config,
              section: res.section,
            });
            break;
        }
      });
  }


  // Forms
  formAdd!: FormGroup;
  formUpdate!: FormGroup;
  formMultiDelete!: FormGroup;

  addAddressesFormFields: BaseField<string>[] = [
      new TextField({
        key: 'label',
        label: 'Label',
        validation: {
          constraints: [
            Validators.required,
            Validators.pattern('^[A-Za-z_][A-Za-z0-9_]*_(SERVERS|NET)$'),
          ],
          errorMessages: {
            required: 'Label is required',
            pattern: 'Label must be formatted as _NET or _SERVERS and be uppercase and cannot start with a number',
          },
        },
      }),
      new TextField({
        key: 'valid',
        label: 'Valid IP/CIDR',
        validation: {
          constraints: [
            Validators.pattern(/^(any|\$[A-Za-z_][A-Za-z0-9_]*|\b[A-Za-z_][A-Za-z0-9_]*_NET\b|(?:(?:\b(?:25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)(?:\/(?:[0-9]|[12]\d|3[0-2]))?))(?:,(any|\$[A-Za-z_][A-Za-z0-9_]*|\b[A-Za-z_][A-Za-z0-9_]*_NET\b|(?:(?:\b(?:25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)(?:\/(?:[0-9]|[12]\d|3[0-2]))?)))*$/)
          ],
          errorMessages: {
            pattern: 'IP must be any, an existing configuration, or one or many valid IP/CIDR seperated by comma'
          },
        },
      }),
      new TextField({
        key: 'except',
        label: 'Except IP/CIDR',
        validation: {
          constraints: [
            Validators.pattern(/^(any|\$[A-Za-z_][A-Za-z0-9_]*|\b[A-Za-z_][A-Za-z0-9_]*_NET\b|(?:(?:\b(?:25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)(?:\/(?:[0-9]|[12]\d|3[0-2]))?))(?:,(any|\$[A-Za-z_][A-Za-z0-9_]*|\b[A-Za-z_][A-Za-z0-9_]*_NET\b|(?:(?:\b(?:25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)(?:\/(?:[0-9]|[12]\d|3[0-2]))?)))*$/)
          ],
          errorMessages: {
            pattern: 'IP must be any, an existing configuration, or one or many valid IP/CIDR seperated by comma'
          },
        },
      })
  ];

  updateAddressesFormFields: BaseField<string>[] = [
    new TextField({
      key: 'label',
      label: 'Label',
      validation: {
        constraints: [
          Validators.required,
          Validators.pattern('^[A-Za-z_][A-Za-z0-9_]*_(SERVERS|NET)$'),
        ],
        errorMessages: {
          required: 'Label is required',
          pattern: 'Label must be formatted as _NET or _SERVERS and be uppercase and cannot start with a number',
        },
      },
    }),
    new TextField({
      key: 'valid',
      label: 'Valid IP/CIDR',
      validation: {
        constraints: [
          Validators.pattern(/^(any|\$[A-Za-z_][A-Za-z0-9_]*|\b[A-Za-z_][A-Za-z0-9_]*_NET\b|(?:(?:\b(?:25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)(?:\/(?:[0-9]|[12]\d|3[0-2]))?))(?:,(any|\$[A-Za-z_][A-Za-z0-9_]*|\b[A-Za-z_][A-Za-z0-9_]*_NET\b|(?:(?:\b(?:25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)(?:\/(?:[0-9]|[12]\d|3[0-2]))?)))*$/)
        ],
        errorMessages: {
          pattern: 'IP must be any, an existing configuration, or one or many valid IP/CIDR seperated by comma'
        },
      },
    }),
    new TextField({
      key: 'except',
      label: 'Except IP/CIDR',
      validation: {
        constraints: [
          Validators.pattern(/^(any|\$[A-Za-z_][A-Za-z0-9_]*|\b[A-Za-z_][A-Za-z0-9_]*_NET\b|(?:(?:\b(?:25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)(?:\/(?:[0-9]|[12]\d|3[0-2]))?))(?:,(any|\$[A-Za-z_][A-Za-z0-9_]*|\b[A-Za-z_][A-Za-z0-9_]*_NET\b|(?:(?:\b(?:25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)(?:\/(?:[0-9]|[12]\d|3[0-2]))?)))*$/)
        ],
        errorMessages: {
          pattern: 'IP must be any, an existing configuration, or one or many valid IP/CIDR seperated by comma'
        },
      },
    })
  ];
  
  addPortFormFields: BaseField<string>[] = [
    new TextField({
      key: 'label',
      label: 'Label',
      validation: {
        constraints: [
          Validators.required,
          Validators.pattern('^[A-Za-z_][A-Za-z0-9_]*_(PORTS)$'),
        ],
        errorMessages: {
          required: 'Label is required',
          pattern: 'Label must be formatted as _PORTS and be uppercase and cannot start with a number',
        },
      },
    }),
    new TextField({
      key: 'valid',
      label: 'Valid Port',
      validation: {
        constraints: [Validators.pattern('^(?!,)([0-9]+(,[0-9]+)*)?(?<!,)$')],
        errorMessages: { pattern: 'Port must be valid. It should be a number or a succession of numbers separated by commas.' },
      },
    }),
    new TextField({
      key: 'except',
      label: 'Except Port',
      validation: {
        constraints: [Validators.pattern('^(?!,)([0-9]+(,[0-9]+)*)?(?<!,)$')],
        errorMessages: { pattern: 'Port must be valid. It should be a number or a succession of numbers separated by commas.' }
      },
    }),
  ];

  updatePortFormFields: BaseField<string>[] = [
    new TextField({
      key: 'label',
      label: 'Label',
      validation: {
        constraints: [
          Validators.required,
          Validators.pattern('^[A-Za-z_][A-Za-z0-9_]*_(PORTS)$'),
        ],
        errorMessages: {
          required: 'Label is required',
          pattern: 'Label must be formatted as _PORTS and be uppercase and cannot start with a number'},
      },
    }),
    new TextField({
      key: 'valid',
      label: 'Valid Ports',
      validation: {
        constraints: [Validators.pattern('^(?!,)([0-9]+(,[0-9]+)*)?(?<!,)$')],
        errorMessages: { pattern: 'Port must be valid. It should be a number or a succession of numbers separated by commas.' }
      },
    }),
    new TextField({
      key: 'except',
      label: 'Except Port',
      validation: {
        constraints: [Validators.pattern('^(?!,)([0-9]+(,[0-9]+)*)?(?<!,)$')],
        errorMessages: { pattern: 'Port must be valid. It should be a number or a succession of numbers separated by commas.' }
      },
    }),
  ];

  multiDeleteFormFields: BaseField<boolean>[] = [];


  // Signals et récupération des configurations flow

  flow = signal<any[]>([]);

  configurationFlow = toSignal(
    combineLatest([
      toObservable(this.flow),
    ]).pipe(
      switchMap(() =>{
          return this._flowService.getConfigurationFlow();
        }
      )
      ),
    { initialValue : [] }
  );

  addresses = computed(() => {
    return this.configurationFlow().filter(
      (item: any) => item.section === 'address-groups'
    );
  });

  ports = computed(() => {
    return this.configurationFlow().filter(
      (item: any) => item.section === 'port-groups'
    );
  });

  defaultAddressesConfig = computed(() => {
    return this.configurationFlow().filter((item: any) => item.section === 'address-groups').filter((item: any) => !item.deletable);
  });

  defaultPortsConfig = computed(() => {
    return this.configurationFlow().filter((item: any) => item.section === 'port-groups').filter((item: any) => !item.deletable);
  });

  extraAddressesConfigs = computed(() => {
      return this.configurationFlow()
        .filter((item: any) => item.section === 'address-groups')
        .filter((item: any) => item.deletable) // Comparaison avec un booléen
        .map((item: any) => item.configuration);
  });
  
  // CRUD

  addConfig(newConf: {label:string; value:string; section:string;}) {

    const uppercasePipe = new UpperCasePipe();

    // Check for existing config
    const existingConfig = this.configurationFlow().find(
      (item: any) => item.configuration === newConf.label
    );

    if (existingConfig) {
      this._toastrService.error(`Configuration ${newConf.label} already exist`);
      return;
    }

    const value = {
      section: newConf.section,
      configuration: `${uppercasePipe.transform(newConf.label)}`,
      value: newConf.value,
    };

    this._flowService.addConfigurationFlow(value).subscribe({
      next: () => {

        this.flow.update((item) => [...item, value]);

        this._toastrService.success(
          `Configuration ${newConf.label} added successfully`
        );
      },
      error: (err) => {
        this._toastrService.error(
          `Failed to add configuration ${newConf.label}`
        );
      },
    });
  }

  updateConfig(newConf: any) {
    const uppercasePipe = new UpperCasePipe();
    let updatedItem = {
      section: newConf.section,
      configuration: `${uppercasePipe.transform(newConf.label)}`,
      value: newConf.value,
    };

    let updated = false;

    updated = !this.valueChanged(this.configurationFlow().find((item: any) => item.configuration === updatedItem.configuration), updatedItem);

    if(!updated) {
      this._toastrService.warning(`Update skipped: No changes detected for the configuration "${updatedItem.configuration}".`);
    }
    else {

      this._flowService.updateConfigurationFlow(updatedItem).subscribe({
        next: () => {
          this.flow.update((item) => [...item, updatedItem]);
          this._toastrService.success(
            `Configuration ${newConf.label} updated successfully`
          );
        },
        error: (err) => {
          this._toastrService.error(
            `Failed to update ${newConf.section} : ${newConf.label}`
          );
        },
      });
    }

  }

  reset(config: any) {
    const uppercasePipe = new UpperCasePipe();
    let resetItem = {
      section: `${config.section}`,
      configuration: `${uppercasePipe.transform(config.name)}`,
    };

    let updated = false;

    updated = this.valueIsDefault(resetItem);

    if(updated) {
      this._toastrService.warning(`Reset skipped: the configuration "${resetItem.configuration}" is already set to its default value.`);
    }
    else {
      this._flowService.resetConfigurationFlow(resetItem).subscribe({
        next: () => {
          this.flow.update((item) => [...item, resetItem]);
          this._toastrService.success(
            `Configuration ${config.name} reseted successfully`
          );
        },
        error: (err) => {
          this._toastrService.error(
            `Failed to reset configuration ${config.label}`
          );
        },
      });
    }
  }

  resetAll(section: string) {
    let resetSection = {
      section: `${section}`,
    };
    let updated = false;

      switch(section) {
      case 'address-groups' : updated = this.allValuesAreNotDefault(this.addresses()); break;
      case 'port-groups': updated = this.allValuesAreNotDefault(this.ports()); break;
    }
    if(!updated) {
      this._toastrService.warning(`Reset skipped: the configuration "${resetSection.section}" is already set to its default value.`);
    }
    else {
      this._flowService.resetAllConfigurationFlow(resetSection).subscribe({
        next: () => {
          this.flow.update((item) => [...item, resetSection]);
          if(updated) {
            this._toastrService.success(
              `Configuration ${resetSection.section} reseted successfully`
            );
          }
        },
        error: (err) => {
          this._toastrService.error(
            `Failed to reset configuration ${resetSection.section}`
          );
        },
      });
    }
  }

  deleteConfig(config: {section: string; configuration: string[]}) {
    this._flowService
      .deleteConfigurationFlow(config)
      .subscribe({
        next: () => {
          this.flow.update((item) => [...item, config]);
          this._toastrService.success(
            `Configuration ${config.configuration} deleted successfully`
          );
        },
        error: (err) => {
          this._toastrService.error(
            `Failed to delete configuration ${config.configuration}: ${err.message}`
          );
        },
      });
  }

  // Utils

  allValuesAreNotDefault(items: any[]): boolean {
    return items.every(item => item.value !== item.default);
  }

  valueIsDefault(item: any): boolean {
    // search for the item in the configurationFlow
    const foundItem = this.configurationFlow().find((i: any) => i.configuration === item.configuration);
    if (!foundItem) {
      return false; // Item not found, cannot determine if it's default
    }
    // Compare the value of the found item with its default value
    if (foundItem.value === undefined || foundItem.default === undefined) {
      return false; // If either value or default is undefined, we cannot determine if it's default
    }
    // Return true if the value is equal to the default value, false otherwise
    if (foundItem.value === foundItem.default) {
      return true;
    }
    // If the value is not equal to the default value, return false
    return false;
  }


  valueChanged(initialItem: any, updatedItem: any): boolean {
    return initialItem.value === updatedItem.value && initialItem.configuration === updatedItem.configuration;
  }
  
  extractValues(obj: { [key: string]: any }): string[] {
      const result: string[] = [];
  
      for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
              const value = obj[key];
  
              // Traitement de la propriété 'valid'
              if (key.startsWith('valid') && typeof value === 'string') {
                  // Diviser la chaîne par des virgules et ajouter chaque élément
                  const validElements = value.split(',').map(item => item.trim()).filter(item => item !== '');
                  result.push(...validElements); // Ajouter tous les éléments valides
              }
  
              // Traitement de la propriété 'except'
              if (key.startsWith('except') && Array.isArray(value)) {
                  for (const element of value) {
                      if (typeof element === 'string' && element.trim() !== '') {
                          result.push('!' + element.trim()); // Ajouter chaque élément avec un '!'
                      }
                  }
              }
          }
      }
  
      return result;
  }
  
  getListOfExtraConfigs(section: string) {
    return this.configurationFlow()
      .filter((item: any) => item.section === section)
      .filter((item: any) => item.deletable == true)
      .map((item: any) => item.configuration);
  }
  
  parseSubnets(subnetsStr: string): {
    valid: { item: string }[];
    except: { item: string }[];
  } {
    // Supprimer les crochets et diviser la chaîne en sous-réseaux
    const subnets = subnetsStr
      .trim()
      .replace(/^\[|]$/g, '')
      .split(',');

    // Initialiser les listes de sous-réseaux valides et exclus
    const validSubnets: { item: string }[] = [];
    const exceptSubnets: { item: string }[] = [];

    // Itérer sur les sous-réseaux
    subnets.forEach((subnet) => {
      // Vérifier si le sous-réseau est exclu
      if (subnet.startsWith('!')) {
        // Ajouter le sous-réseau exclu à la liste
        exceptSubnets.push({ item: subnet.substring(1) });
      } else {
        // Ajouter le sous-réseau valide à la liste
        validSubnets.push({ item: subnet });
      }
    });
    // Retourner l'objet JSON
    return { valid: validSubnets, except: exceptSubnets };
  }
  
  extractItems(obj: { [key: string]: any }): string {
      let result: string = '';
  
      // Traitement de la propriété 'valid'
      if (typeof obj['valid'] === 'string' && obj['valid'].trim() !== "") {
          // Diviser la chaîne par des virgules et ajouter chaque élément
          const validElements = obj['valid'].split(',').map(item => item.trim()).filter(item => item !== '');
          result += validElements.join(','); // Joindre les éléments valides par une virgule
      }
  
      // Traitement de la propriété 'except'
      if (typeof obj['except'] === 'string' && obj['except'].trim() !== "") {
          // Ajouter chaque élément de 'except' avec un '!'
          const exceptElements = obj['except'].split(',').map(item => item.trim()).filter(item => item !== '');
          const exceptFormatted = exceptElements.map(item => '!' + item).join(','); // Préfixer avec '!'
          result += (result ? ',' : '') + exceptFormatted; // Ajouter les exceptions à la chaîne
      }
  
      // Ajouter des crochets si la chaîne n'est pas vide
      if (result != '') {
          result = `[${result}]`;
      }
  
      return `${result}`;
  }
  
  parseData(str: string): { valid: string, except: string } {
    // Supprimer les crochets
    const result = str.replace(/^\[|\]$/g, '');
  
    // Diviser par des virgules et supprimer les espaces
    const items = result.split(',').map(item => item.trim());
  
    // Initialiser les listes pour les sous-réseaux valides et exclus
    const validItems: string[] = [];
    const exceptItems: string[] = [];
  
    // Itérer sur les éléments
    items.forEach(item => {
        if (item.startsWith('!')) {
            // Ajouter à except en retirant le '!'
            exceptItems.push(item.substring(1).trim());
        } else {
            // Ajouter à valid
            validItems.push(item);
        }
    });
  
    // Retourner l'objet avec les sous-réseaux valides et exclus
    return {
        valid: validItems.join(','),
        except: exceptItems.join(',')
    };
  }

}
