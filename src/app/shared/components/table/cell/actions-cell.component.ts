import {ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from './base-cell.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-default-cell',
    template: `
    <div class="action-container">
        @for (item of tableColumn.actions; track $index) {
            @if (!item.condition || item.condition(element)) {
                <button mat-icon-button [title]="item.label" (click)="sendCellDatas(item.name)" ><mat-icon>{{item.icon}}</mat-icon></button>
            }
        }
    </div>
  `,
    imports: [MatButtonModule, MatIcon],
    styles: `
  .action-container {
    display: block ruby;
  }
  button:hover {
    color: rgb(255, 247, 63);
  }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsCellComponent extends BaseCellComponent {

  sendCellDatas(actionName:string) {
    this.element['actionName'] = actionName
    this.cellDatas.emit(this.element);
  }
}
