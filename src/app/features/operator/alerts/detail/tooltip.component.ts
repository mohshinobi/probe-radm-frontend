import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";

@Component({
    selector: 'app-tooltip-dialog',
    template: `
      <h1 mat-dialog-title>Informations</h1>
      <div mat-dialog-content [innerHTML]="data.content"></div>
      <div mat-dialog-actions>
          <button mat-button (click)="onClose()">Fermer</button>
      </div>
  `,
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatButton
    ]
})
export class TooltipDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { content: string }, private dialogRef: MatDialogRef<TooltipDialogComponent>) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
