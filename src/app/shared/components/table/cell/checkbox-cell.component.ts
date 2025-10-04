import {ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from './base-cell.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
    selector: 'app-checkbox-cell',
    template: `
    <!-- <input type="checkbox" [checked]="getDataKeyValue.full" (change)="onCheck($event.checked)" /> -->
    <mat-slide-toggle class="locked-file-toggle" (change)="onCheck($event.checked)" [checked]="onChecked()"></mat-slide-toggle>
  `,
    imports: [
        MatSlideToggle
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
    // styleUrl: ''
})
export class CheckboxCellComponent extends BaseCellComponent {

  onCheck(value: boolean) {
    this.element['actionName'] = 'checkbox';
    this.element['checkboxValue'] = value;
    this.cellDatas.emit(this.element);
  }

  onChecked() {
    const enabledStates = ['enabled', 'enable', 'active', true];
    return enabledStates.includes(this.getDataKeyValue.full);
  }
}