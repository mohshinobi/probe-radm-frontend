import {Component, inject} from '@angular/core';
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {OtManagementService} from "@core/services/ot-management.service";
import {CommonModule} from "@angular/common";
import {ToastrService} from "ngx-toastr"; 
import {MatTooltip} from "@angular/material/tooltip";
import { PageHeaderComponent } from "@layout/header/page-header.component";


@Component({
    selector: 'app-ot',
    imports: [
    MatCard,
    MatCardContent,
    MatTableModule,
    MatButtonModule,
    MatIcon,
    CommonModule, 
    MatTooltip,
    PageHeaderComponent
],
    templateUrl: './ot.component.html',
    styleUrl: './ot.component.scss'
})
export class OtComponent {
  title = 'OT Management';
  private _otService = inject(OtManagementService);
  private _toast = inject(ToastrService);

  // List of file types available for upload/download
  fileTypes = [
    {fullName: 'levels.csv', displayName: 'Levels' , icon :'layers'},
    {fullName: 'zones.csv', displayName: 'Zones' , icon :'grid_view'},
    {fullName: 'assets.csv', displayName: 'Assets' , icon :'memory'}
  ];

  displayedColumns: string[] = ['fileName', 'actions'];

  // Tracks the file currently being uploaded
  loadingFile: string | null = null;
  // Tracks the file currently being downloaded
  downloadingFile: string | null = null;

  uploadFile(fileName: string): void {
    const input = this.createFileInput();
    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      // Validate if the selected file matches the required name
      if (file && file.name === fileName) {
        this.manageFileUpload(fileName, file);
      } else {
        this._toast.error("The selected file is not authorized");
      }
    };

    input.click();
  }

  // Creates a file input element dynamically
  private createFileInput(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'file';
    // Restrict file type to CSV
    input.accept = '.csv';
    return input;
  }

  private manageFileUpload(fileName: string, file: File): void {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', fileName);
    this.loadingFile = fileName;
    this._otService.upload(fileName, formData).subscribe({
      next: () => {
        this._toast.success(`File "${fileName}" uploaded successfully!`);
        this.loadingFile = null;
      },
      error: (err) => {
        this._toast.error("Error while uploading the file! "+  err.error);
        this.loadingFile = null;
      }
    });
  }

  downloadFile(fileName: string): void {
    this.downloadingFile = fileName;
    this._otService.download(fileName).subscribe({
      next: (blob) => {
        this.downloadBlob(blob, fileName);
        this._toast.success(`File "${fileName}" downloaded successfully!`);
        this.downloadingFile = null;
      },
      error: (err) => {
        this._toast.error("Error while downloading the file!" + err.error);
        this.downloadingFile = null;
      }
    });
  }

  // Converts a Blob into a downloadable file
  private downloadBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }
}
