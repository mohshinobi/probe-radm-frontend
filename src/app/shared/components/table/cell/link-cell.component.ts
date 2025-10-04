import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router'; // <--- Add this import
import { BaseCellComponent } from './base-cell.component';

@Component({
    selector: 'app-link-cell',
    template: `
    <span [title]="getDataKeyValue.full">
      <a [routerLink]="tableColumn.url+'/'+getDataKeyValue.full">{{ getDataKeyValue.truncated }}</a>
    </span>
  `,
    styles: `
  a:link { 
  // text-decoration: none; 
  color: rgb(255, 247, 63);
} 
a:visited { 
  text-decoration: none; 
  color: rgb(255, 247, 63);
} 
a:hover { 
  text-decoration: none; 
  color: #FF0000;
} 
a:active { 
  text-decoration: none; 
  color: rgb(255, 247, 63);
}
`,
    imports: [
        MatTableModule,
        MatSortModule,
        RouterModule // <--- Add this to the imports array
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkCellComponent extends BaseCellComponent {}