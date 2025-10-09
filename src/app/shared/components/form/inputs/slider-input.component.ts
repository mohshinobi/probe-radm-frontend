import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseInputComponent } from './base-input.component';
import { BaseInputModule } from './base-input.module';
import { MatSliderModule } from '@angular/material/slider';
import { NumberInput } from '@angular/cdk/coercion';

@Component({
    selector: 'radm-slider',
    template: `
    <div [formGroup]="form" >
      <mat-slider>
        <input [id]="field.key" [formControlName]="field.key" [value]="field.value" matSliderThumb>
      </mat-slider>
    </div>
  `,
    imports: [
        BaseInputModule,
        MatSliderModule
    ],
    styleUrl: 'field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderInputComponent extends BaseInputComponent<NumberInput> {}