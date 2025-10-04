import { Component, inject, ChangeDetectionStrategy, ViewChild, TemplateRef  } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { RuleFlowService } from './flow/rule-flow.service';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-rules',
    imports: [
        RouterLink,
        CommonModule,
        FormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        MatDividerModule,
        RouterOutlet,
        MatTooltipModule
    ],
    templateUrl: './rules.component.html',
    styleUrl: './rules.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RulesComponent {
  private _service  = inject(RuleFlowService);
  private _router   = inject(Router);

  toastr = inject(ToastrService);
  dialog = inject(MatDialog);

  selectedFileName: string | null = null;
  errorMessage: string | null = null;
  selectedFile: File | null = null;
  uploadMessage: string | null = null;

  @ViewChild('uploadFileFormTemplate') uploadFileFormTemplate!: TemplateRef<any>;

  openUploadModal() {
    const dialogRef = this.dialog.open(ModalComponent, {
      disableClose: false,
      width: '600px',
      data: {
        title: 'Upload Rules File',
        contentTemplate: this.uploadFileFormTemplate,
        actionButton : false
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.resetUploadState();
    });
  }

  cancelUpload() {
    this.dialog.closeAll();
    this.resetUploadState();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.name.toLowerCase().endsWith('.rules')) {
        this.setUploadError("Only .rules files are allowed.");
        return;
      }

      if (file.name.includes(' ')) {
        this.setUploadError("The file name must not contain spaces.");
        return;
      }

      const validNameRegex = /^[a-zA-Z0-9_\-.]+\.rules$/;
      if (!validNameRegex.test(file.name)) {
        this.setUploadError("Invalid file name. Use only letters, numbers, dashes, underscores, and dots.");
        return;
      }

      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.errorMessage = null;
    }
  }

  uploadFile() {
    if (!this.selectedFile) {
      this.setUploadError("Please select a file first.");
      return;
    }

    this._service.uploadRulesFile(this.selectedFile).subscribe({
      next: () => {
        this.handleUploadSuccess();
      },
      error: () => {
        this.setUploadError("File upload failed.");
      },
      complete: () => {
        this.resetUploadState();
        this.dialog.closeAll();
      }
    });
  }

  private resetUploadState() {
    this.selectedFile = null;
    this.selectedFileName = null;
    this.errorMessage = null;
    this.uploadMessage = null;
  }

  private setUploadError(message: string) {
    this.errorMessage = message;
    this.selectedFile = null;
    this.selectedFileName = null;
  }

  private handleUploadSuccess() {
    this.uploadMessage = "File uploaded successfully!";
    this.errorMessage = null;
    this.messageSuccess(this.uploadMessage);
  }

  private messageSuccess(message: string) {
    setTimeout(() => {
      this._service.onListRulesFiles.update((update) => update + 1);
    }, 5000);

    this.toastr.success(`Wait, processing the update of the List Rules...`, message, {
      timeOut: 5000,
      extendedTimeOut: 5000,
      tapToDismiss: false,
      progressBar: true
    });
  }
}
