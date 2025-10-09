import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseInputModule } from './base-input.module';
import { BaseInputComponent } from './base-input.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; // Import MatSlideToggleModule

@Component({
    selector: 'radm-slide-toggle',
    template: `
    <div [formGroup]="form" class="field" style="margin-bottom:20px;">
      <mat-slide-toggle [id]="field.key" [formControlName]="field.key" class="field">
        {{ field.label }}
      </mat-slide-toggle>
    </div>
  `,
    imports: [
        BaseInputModule,
        MatSlideToggleModule // Add MatSlideToggleModule to imports
    ],
    styleUrls: ['./field.component.scss'], // Make sure the style URL is correct
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideToggleInputComponent extends BaseInputComponent<boolean> {} // Change type to boolean
