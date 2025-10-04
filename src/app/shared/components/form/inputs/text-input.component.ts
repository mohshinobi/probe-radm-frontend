import {ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseInputComponent } from './base-input.component';
import { BaseInputModule } from './base-input.module';

@Component({
    selector: 'jizo-text',
    template: `
    <mat-form-field [formGroup]="form" class="field" jizoearance="outline">
      <mat-label [attr.for]="field.key">{{ field.label }}</mat-label>
      <input matInput [placeholder]="field.placeholder" 
        [formControlName]="field.key" 
        [id]="field.key" 
        [type]="field.type"
        [autocomplete]="field.type === 'password' ?  'current-password' : ''"
        >
        @if (field.icon) {
          <mat-icon matSuffix>{{field.icon}}</mat-icon>
        }
        @if(errors) {
          <mat-error>{{errors}}</mat-error>
        }
    </mat-form-field>
  `,
    imports: [
        BaseInputModule
    ],
    styleUrl: 'field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextInputComponent extends BaseInputComponent<string> {}