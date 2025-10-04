import {ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseCellComponent } from './base-cell.component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-image-cell',
    template: `
    <!-- @if(getDataKeyValue.full === "N/A"){
      <span class="image">No flag</span>
    } @else {
      <img [src]="'assets/images/' + getDataKeyValue.full?.toLowerCase() + '.svg'" class="image" />
    } -->
    <div [innerHTML]="domSanitizer.bypassSecurityTrustHtml(decodeBase64Icon(getDataKeyValue.full))"></div>
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
export class IconBase64CellComponent extends BaseCellComponent {

  domSanitizer = inject(DomSanitizer);

  decodeBase64Icon(encoded: string): string {
    try {
      return atob(encoded);
    } catch (error) {
      console.error("Error Base64 :", error);
      return "";
    }
  }
}