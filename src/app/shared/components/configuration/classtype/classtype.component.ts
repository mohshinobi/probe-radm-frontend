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
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { BaseField, SelectField } from '@shared/components/form/fields';
import { combineLatest, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ModalData } from '../modal-data.interface';
import { ClasstypeService } from './classtype.service';

@Component({
    selector: 'app-classtype',
    imports: [MatCardModule, MatIconModule, MatTableModule, MatTooltipModule, MatButtonModule, CommonModule],
    templateUrl: './classtype.component.html',
    styleUrl: './classtype.component.scss'
})
export class ClasstypeComponent {

  // Injection de services
    private _toastrService        = inject(ToastrService);
    private _classTypeService = inject(ClasstypeService);
    private _dialogService        = inject(DialogFormService);
    private _dialog               = inject(MatDialog);
    
  
  //
  openDialog(data: any, title: string, type: string, section: string) {
      let modalDatas: ModalData = {
        title: title,
        data: data,
        type: type,
      };
  
      let fields: BaseField<string>[] = [];
      switch (type) {
        case 'update_severity':
          fields = this.updateSeverityFormFields;
          this.formUpdateSeverity = this._dialogService.getFormGroup(fields);
          modalDatas = {
            ...modalDatas,
            fields: fields,
            form: this.formUpdateSeverity,
            action: type,
            section: section,
            data: modalDatas.data,
          };
          this.formUpdateSeverity.controls['severity'].setValue(data.severity);
  
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
  
          case 'update_severity':
            let sevToUpdate = {
              key: res.key,
              severity: parseInt(res.severity),
            }
            this.updateSeverity(sevToUpdate);
            break;
        }
      });
  }

  // forms
  formUpdateSeverity!: FormGroup;
  updateSeverityFormFields: BaseField<string>[] = [
      new SelectField({
        key: 'severity',
        label: 'Severity',
        options: [
          { key:'1' , value:'1'},
          { key:'2' , value:'2'},
          { key:'3' , value:'3'},
          { key:'4' , value:'4'},
        ],
        validation: {
          constraints: [
            Validators.required
          ],
          errorMessages: {
            required: 'Severity is required'
          }
        }
      })
  ];
      
  // Configurations 
  classification = signal<any[]>([]);
      
  configurationClassType = toSignal(
    combineLatest([
      toObservable(this.classification),
    ]).pipe(
      switchMap(() =>{
          return this._classTypeService.getClassification();
        }
      )
      ),
    { initialValue : [] }
  );

  // Mise a jour de la sevirity
  updateSeverity(updatedClassification: any) {
    this._classTypeService.updateSeverity(updatedClassification).subscribe({
      next: () => {
        this.classification.update((item) => [...item, updatedClassification]);
        this._toastrService.success(
          `Classification ${updatedClassification.key} updated successfully to severity ${updatedClassification.severity}`
        );
      },
      error: (err) => {
        this._toastrService.error(
          `Failed to update ${updatedClassification.key}`
        );
      },
    });
  }
      


}
