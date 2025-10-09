import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { BaseInputModule } from './base-input.module';
import { BaseInputComponent } from './base-input.component';

@Component({
    selector: 'radm-select',
    template: `
    <mat-form-field [formGroup]="form" class="field" radmearance="outline">
      <mat-label [attr.for]="field.key">{{ field.label }}</mat-label>
      <mat-select [id]="field.key" [formControlName]="field.key">
        @for (opt of field.options; track opt) {
          <mat-option [value]="opt.key">{{ opt.value }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
    imports: [
        BaseInputModule,
        MatSelectModule
    ],
    styleUrl: 'field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectInputComponent extends BaseInputComponent<any> {}