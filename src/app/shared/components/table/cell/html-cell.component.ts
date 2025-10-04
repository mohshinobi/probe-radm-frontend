import {ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BaseCellComponent } from './base-cell.component';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-htmp-cell',
    template: `
    <div [innerHTML]="domSanitizer.bypassSecurityTrustHtml(getDataKeyValue.full)"></div>
  `,
    imports: [
        MatTableModule,
        MatSortModule,
        CommonModule,
        MatButtonModule
    ],
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
    // styleUrl: ''
})
export class HtmlCellComponent extends BaseCellComponent {
  domSanitizer = inject( DomSanitizer);



}
