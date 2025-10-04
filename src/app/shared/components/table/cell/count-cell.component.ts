import { Component } from '@angular/core';
import { BaseCellComponent } from './base-cell.component';

@Component({
    selector: 'app-count-cell',
    imports: [],
    template: `
    <button mat-button>
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
        border-radius: 15px;
        padding: 6px 12px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        outline: none;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f44336;
        color: white;
      }
    `,
    ]
})
export class CountCellComponent extends BaseCellComponent {}
