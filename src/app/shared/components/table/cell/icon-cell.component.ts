import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from './base-cell.component';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

@Component({
    selector: 'app-default-cell',
    template: `
    <mat-chip-set aria-label="Fish selection">
      @if(element.devPresentLastScan == 1){
        <mat-chip class="custom-chip green-chip"><i class="fa-solid fa-plug"></i> {{element.devStatus}}</mat-chip>
        
      } @else {
        <mat-chip class="custom-chip"><i class="fa-solid fa-plug-circle-xmark"></i> {{element.devStatus}}</mat-chip>
      }
    </mat-chip-set>
  `,
    imports: [MatButtonModule, MatChipsModule],
    styles: `
  .custom-chip {
    font-size: 8px;
    height: 24px;
    pointer-events: none;
    cursor: default;
    background-color: #F44949 !important;
    color: #F44949 !important;
  }

  .green-chip {
    background-color: #2e7d32 !important;
    color: #2e7d32 !important;
  }`,
    changeDetection: ChangeDetectionStrategy.OnPush
    // styleUrl: ''
})
export class IconCellComponent extends BaseCellComponent {

  ngOnInit() {
  }
}