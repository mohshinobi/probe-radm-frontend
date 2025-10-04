import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from './base-cell.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-default-cell',
    template: `
    <span [title]="getDataKeyValue.full">
      {{ getDataKeyValue.truncated }}
    </span>
  `,
    imports: [MatButtonModule],
    styles: `
  span {
    white-space: wrap;
    // overflow: hidden;
    text-overflow: ellipsis; 
    display: inline-block;
    max-width: 350px;
    cursor: pointer;
    // padding: 10px;

  }

  span:hover { 
    color: rgb(255, 247, 63);
  } 
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
    // styleUrl: ''
})
export class DefaultCellComponent extends BaseCellComponent {}