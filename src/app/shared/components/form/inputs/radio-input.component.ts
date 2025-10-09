import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseInputModule } from './base-input.module';
import { MatRadioModule } from '@angular/material/radio';
import { BaseInputComponent } from './base-input.component';

@Component({
    selector: 'radm-radio',
    template: `
    <mat-radio-group [formGroup]="form" [id]="field.key" [formControlName]="field.key" [attr.aria-label]="field.label">
      @if (field.options) {
        @for (opt of field.options; track opt) {
          <mat-radio-button [value]="opt.key">{{ opt.value }}</mat-radio-button>
        }
      }
    </mat-radio-group>
  `,
    imports: [
        BaseInputModule,
        MatRadioModule
    ],
    styleUrl: 'field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioInputComponent extends BaseInputComponent<any> {}