import {ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from './base-cell.component';

@Component({
    selector: 'app-image-cell',
    template: `
    @if(getDataKeyValue.full === "N/A"){
      <span class="image">No flag</span>
    } @else {
      <img [src]="'assets/images/' + getDataKeyValue.full?.toLowerCase() + '.svg'" class="image" />
    }
    `,
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: `
    .image {
      width:25px;
      height:auto;
    }
  `
})
export class ImageCellComponent extends BaseCellComponent {}