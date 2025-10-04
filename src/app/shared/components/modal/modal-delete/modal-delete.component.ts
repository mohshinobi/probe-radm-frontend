import {Component, EventEmitter, Inject, Output} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatCheckbox} from "@angular/material/checkbox";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";
import {CommonModule} from "@angular/common";
import {MatButton} from "@angular/material/button";

@Component({
    selector: 'app-modal-delete',
    imports: [
        CommonModule,
        MatDialogContent,
        MatDialogActions,
        MatDialogTitle,
        MatCheckbox,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatButton
    ],
    templateUrl: './modal-delete.component.html',
    styleUrl: './modal-delete.component.scss'
})
export class ModalDeleteComponent {
  data: any = null;
  checkedIds: string[] = [];
  @Output() confirm = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  deleteAllAlertsBySignature = false;
  deleteAllAlertsBySource = false;
  deleteByDate = false;
  startDate = '';
  endDate = '';

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: any) {
    this.data = dialogData.data;
    this.checkedIds = dialogData.checkedIds;
  }

  onConfirm() {
    this.confirm.emit({
      checkedIds: this.checkedIds,
      data: this.data,
      deleteAllAlertsBySignature: this.deleteAllAlertsBySignature,
      deleteAllAlertsBySource: this.deleteAllAlertsBySource,
      deleteByDate: this.deleteByDate,
      startDate: this.startDate,
      endDate: this.endDate
    });
  }
}
