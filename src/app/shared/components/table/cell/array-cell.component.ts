import {ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BaseCellComponent } from './base-cell.component';
import { CommonModule } from '@angular/common';
import {MatChipsModule} from '@angular/material/chips';

@Component({
    selector: 'app-array-cell',
    template: `
    <span [title]="getDataKeyValue.full">
      @if( getDataKeyValue.full.length > 0 ){
        <mat-chip-set class="chips-list">
        @for (item of getDataKeyValue.full; track $index) {
          <mat-chip class="custom-chips">{{ item }}</mat-chip>
        }
        </mat-chip-set>
      }
    </span>
  `,
    imports: [
        MatTableModule,
        MatSortModule,
        CommonModule,
        MatChipsModule
    ],
    styles: `
  .chips-list {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      flex-direction: row;
      font-size: 10px;
    }
    :host {

      .custom-chips {
        color: #e6e6e6;
        border: 1px solid #454443;
        background-color: #252525;
        border-radius: 4px;
        padding: 0 0px;
      }

      .custom-chips.mat-mdc-standard-chip {

        --mdc-chip-label-text-color: white;
        --mdc-chip-container-height: 25px;
      }
    }`,
    changeDetection: ChangeDetectionStrategy.OnPush
    // styleUrl: ''
})
export class ArrayCellComponent extends BaseCellComponent {
}
