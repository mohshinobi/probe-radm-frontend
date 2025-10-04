import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BaseInputModule } from './base-input.module';
import { BaseInputComponent } from './base-input.component';
import {CommonService} from "@core/services";

@Component({
    selector: 'jizo-date',
    template: `
    <mat-form-field [formGroup]="form" class="field" jizoearance="outline">
      <mat-label [attr.for]="field.key">{{ field.label }}</mat-label>
      <input
        type="datetime-local"
        matInput
        [formControlName]="field.key"
        [min]="getMinDate(field.key)"
        [max]="getToday()"
        placeholder="Choose a date"
      >
    </mat-form-field>
  `,
    imports: [
        BaseInputModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    styleUrl: 'field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateInputComponent extends BaseInputComponent<string> {

  private _commonService = inject(CommonService)

  getMinDate(fieldKey: string): string | null {
    if (fieldKey === 'endDate') {
      const dateFromValue = this.form.get('startDate')?.value;
      return dateFromValue ? this._commonService.formatDateTimeLocal(new Date(dateFromValue)) : null;
    }
    return null;
  }

  getToday(): string {
    return new Date().toISOString().slice(0, 16);
  }
}
