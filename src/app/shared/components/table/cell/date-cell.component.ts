import {ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BaseCellComponent } from './base-cell.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-date-cell',
    template: `
    <span [title]="getDataKeyValue.full">
    @if(getDataKeyValue.full && getDataKeyValue.full !== 'N/A'){
      {{ getDataKeyValue.full|date : 'yyyy-MM-dd HH:mm:ss': 'UTC'}}
    }
    </span>
  `,
    imports: [
        MatTableModule,
        MatSortModule,
        CommonModule
    ],
    // styles: `
    // span {
    //   white-space: nowrap;
    //   overflow: hidden;
    //   text-overflow: ellipsis;
    //   display: inline-block;
    //   max-width: 100%;
    //   cursor: pointer;
    // }`,
    changeDetection: ChangeDetectionStrategy.OnPush
    // styleUrl: ''
})
export class DateCellComponent extends BaseCellComponent {}
