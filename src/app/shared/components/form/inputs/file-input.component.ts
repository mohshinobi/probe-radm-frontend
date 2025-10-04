import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { BaseInputModule } from './base-input.module';
import { BaseInputComponent } from './base-input.component';
@Component({
    selector: 'jizo-file',
    template: `


    <mat-form-field [formGroup]="form" class="field" jizoearance="outline">
      <mat-label [attr.for]="field.key">{{ field.label }}</mat-label>
      <!-- Display the selected file name in a text input -->
      <input type="text" matInput
        [placeholder]="filename || 'Choose a file'"
        [value]="filename"
        (click)="inputFile.click()"
        [accept]="field.accept"
      />

      <!-- Hidden file input field to select the file -->
      <input
        type="file"
        [accept]="field.accept"
        multiple
        hidden
        #inputFile
        (change)="handleFileInputChange(inputFile.files)"
      />
      @if(errors) {
          <mat-error>{{errors}}</mat-error>
        }
        @if (field.icon) {
          <mat-icon matSuffix>{{field.icon}}</mat-icon>
        }
        @if(errors) {
          <mat-error>{{errors}}</mat-error>
        }
    </mat-form-field>
  `,
    imports: [BaseInputModule],
    styleUrl: 'field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileInputComponent extends BaseInputComponent<string> {

  @Output() files: EventEmitter<FileList> = new EventEmitter<FileList>();
  filename = '';


  handleFileInputChange(files: FileList | null) {
    if (files && files.length > 0) {
      this.files.emit(files);
      this.filename = files[0].name;  // Set the filename to display in the text input field
    }
  }
}
