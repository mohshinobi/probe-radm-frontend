import {ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { BaseCellComponent } from './base-cell.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-image-cell',
    template: `
    <div class="flag-container">
      @if(getFlag()){
        <img [src]="getFlag()" alt="flag src ip" class="image" />
      }
      <span>{{getDataKeyValue.full}}</span>
      <!-- <button mat-button >{{ getDataKeyValue.full }}</button> -->
    </div>
    `,
    imports: [MatButtonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: `
    .image {
      width:25px;
      height:auto;
    }
    .flag-container {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    span:hover { 
    color: rgb(255, 247, 63);
  } 
  `
})
export class FlagCellComponent extends BaseCellComponent {

  clickTimeout: any;

  @HostListener('click')
  onClicked() {
    clearTimeout(this.clickTimeout); 
    this.clickTimeout = setTimeout(() => {
      if(this.tableColumn.filtarable !== false) {
        this.sendCellDatas()
      }
    }, 30);
 
  }

  sendCellDatas() {
    this.element['srcCellData'] = this.tableColumn.dataKey
    this.cellDatas.emit(this.element);
  }

  getFlag() {
    var link = null;

    if ((this.tableColumn.dataKey==='src_ip' || this.tableColumn.dataKey==='id.orig_h') && this.element?.src_geoip) {
      link = 'assets/images/' + this.element?.src_geoip?.geo?.country_iso_code.toLowerCase() + '.svg';
    }

    if ((this.tableColumn.dataKey==='dest_ip' || this.tableColumn.dataKey==='id.resp_h') && this.element?.dest_geoip ) {
      link = 'assets/images/' + this.element?.dest_geoip?.geo?.country_iso_code.toLowerCase() + '.svg';
    }

    return link;
  }
  
}