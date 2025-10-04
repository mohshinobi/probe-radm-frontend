import {ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from './base-cell.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-true-false-cell',
    template: `
   @if (getDataKeyValue.key !== 'firstConnection') {
  <mat-icon [style.color]="getDataKeyValue.full ? '#00FF00' : '#FF0000'">
    {{ getDataKeyValue.full ? 'check' : 'clear' }}
  </mat-icon>
} @else {
  <mat-icon [style.color]="!getDataKeyValue.full ? '#00FF00' : '#FF0000'">
    {{ !getDataKeyValue.full ? 'check' : 'clear' }}
  </mat-icon>
}

  `,
    imports: [MatIconModule],
    changeDetection: ChangeDetectionStrategy.OnPush
    // styleUrl: ''
})
export class TrueFalseCellComponent extends BaseCellComponent {}
