import {Component, Input} from '@angular/core';

@Component({
  selector: 'page-header',
  imports: [],
  template: `
    <div class="page-header-section">
      <div class="title-section">
        <h1 class="title">{{ title }}</h1>      
        @if(subtitle){<h2 class="subtitle">{{ subtitle }}</h2>}
      </div> 
      <div class="content-section">
        <ng-content></ng-content>
      </div>
    </div> 
  `,
  styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent {
  @Input({required: true}) title: string ='Title Here';
  @Input({required: false}) subtitle?: string;
}
