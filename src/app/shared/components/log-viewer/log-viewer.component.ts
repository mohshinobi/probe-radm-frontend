import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-log-viewer',
    imports: [],
    templateUrl: './log-viewer.component.html',
    styleUrl: './log-viewer.component.scss'
})
export class LogViewerComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: string, private dialogRef: MatDialogRef<LogViewerComponent>, private http:HttpClient) { }

  lines: string[] = [];

  ngOnInit(): void {
    this.lines = this.data.split('\n');
  }

  onClose() {
    this.dialogRef.close();
  }
  
}
