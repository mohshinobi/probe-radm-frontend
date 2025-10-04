import { Component, Input } from '@angular/core';
import { BaseCellComponent } from './base-cell.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-icon-cell',
    imports: [CommonModule],
    template: `
    <button mat-button [ngStyle]="getSeverityStyle()">
       {{ getDataKeyValue.full }}
    </button>
  `,
    styles: [
        `
      button {
        display: flex;
        justify-content: center;
        align-items: center;
        border: none;
        border-radius: 50%;
        padding: 6px 10px;
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
        outline: none;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: center;
        align-items: center;
      }
    `,
    ]
})
export class SeverityCellComponent extends BaseCellComponent {
  @Input() severity: number | undefined;

  getSeverityStyle() {
    switch (this.getDataKeyValue.full) {
      case 1:
        return { border: '1px solid rgba(244, 73, 73, 1)', backgroundColor: 'rgba(244, 73, 73, 0.3)', color: 'rgba(244, 73, 73, 1)' };
      case 2:
        return { border: '1px solid rgba(255, 102, 51, 1)', backgroundColor: 'rgba(255, 102, 51, 0.3)', color: 'rgba(255, 102, 51, 1)' };
      case 3:
        return { border: '1px solid rgba(248, 146, 0, 1)', backgroundColor: 'rgba(248, 146, 0, 0.3)', color: 'rgba(248, 146, 0, 1)' };
      default:
        return { border: '1px solid rgba(255, 192, 128, 1)', backgroundColor: 'rgba(255, 192, 128, 0.3)', color: 'rgba(255, 192, 128, 1)' };
    }
  }
}
