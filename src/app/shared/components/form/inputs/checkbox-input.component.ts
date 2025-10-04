import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseInputComponent } from './base-input.component';
import { BaseInputModule } from './base-input.module';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
    selector: 'jizo-checkbox',
    template: `
    <div [formGroup]="form" >
        <mat-checkbox [id]="field.key" [formControlName]="field.key" class="field" >{{ field.label }}</mat-checkbox>
    </div>
  `,
    imports: [
        BaseInputModule,
        MatCheckboxModule
    ],
    styleUrl: 'field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxInputComponent extends BaseInputComponent<boolean> {}