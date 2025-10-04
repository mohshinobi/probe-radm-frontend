import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseInputComponent } from './base-input.component';
import { BaseInputModule } from './base-input.module';

@Component({
    selector: 'jizo-text-area',
    template: `
    <mat-form-field [formGroup]="form" class="field" jizoearance="outline">
      <mat-label [attr.for]="field.key">{{ field.label }}</mat-label>
      <textarea matInput [placeholder]="field.placeholder" 
        [value]="field.value" 
        [formControlName]="field.key" 
        [id]="field.key" 
        [type]="field.type"></textarea>
    </mat-form-field>
  `,
    imports: [
        BaseInputModule
    ],
    styleUrl: 'field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextAreaInputComponent extends BaseInputComponent <string>{}