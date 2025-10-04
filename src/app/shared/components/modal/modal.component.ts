// modal.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, Input, TemplateRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';

@Component({
    selector: 'app-modal',
    imports: [
        MatDialogContent,
        MatDialogActions,
        MatButtonModule,
        CommonModule,
        MatDialogTitle,
        MatCardModule
    ],
    template: `
    <div class="custom-dialog-content">
    <mat-card class="dialog-card">
      <mat-card-content>
        <h2 mat-dialog-title>{{ data.title }}</h2>
        <mat-dialog-content>
          <ng-container *ngTemplateOutlet="data.contentTemplate; context: { $implicit: data.contentContext }"></ng-container>
        </mat-dialog-content>
        @if (data.actionButton) {
          <mat-dialog-actions align="end">
            <button mat-button class="cancel-button" (click)="onCancel()">Cancel</button>
            <button mat-button color="warn" color="primary" (click)="onConfirm()" [disabled]="!data.contentContext.getFormValidity()">Confirm</button>
          </mat-dialog-actions>
        }
      </mat-card-content>
    </mat-card>
  </div>
  `,
    styleUrl: './modal.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {

  @Input() actionButton: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      panelClass?: string;
      title: string;
      contentTemplate: TemplateRef<any>;
      contentContext: any;
      disableConfirm?: () => boolean;
      actionButton: boolean;
    }
  ) {
    if(data.actionButton === undefined) {
      data.actionButton = true;
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}