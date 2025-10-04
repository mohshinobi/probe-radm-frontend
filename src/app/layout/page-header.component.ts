import {Component, Input} from '@angular/core';

@Component({
  selector: 'page-header',
  imports: [],
  template: `
    <div class="container-section p-32 border-section">
      <h1 class="title">{{ title }}</h1>
      @if(subtitle){
        <h2 class="subtitle">{{ subtitle }}</h2>
      }
      <div id="extra-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: `
    :host {
      --mat-card-border-radius:0;
      --mat-sidenav-container-background-color: #252525;
    }
    #extra-content{
      margin-left:auto;
    }
    .container-section {
      display:flex; 
      background-color: #252525;
      border: 1px solid #454443; 
      position: sticky;
      top: 0;
      z-index:99;
      align-items: center;
    }
    section {
      min-height: 704px;
      background-color: #252525;
    }
    .button-action {
      border: 1px solid #00ff98 !important;
      background-color: rgba(0, 255, 152, 0.09);
      border-radius: 4px !important;
    }
    .content {
      padding: 0;
      border-left: 1px solid #454443;
    }
    .p-32 {
      padding: 15px 0 3px 15px;
    }
    .title {
      line-height: 38px;
      font-size: 34px;
      color: white;
      font-family: Sesame;
    }

    .subtitle {
      font-size: 16px;
      font-family: Inter,sans-serif;
      line-height: 0px;
      color: #9B9B96;
    }

    .border-section {
      border-bottom: 1px solid #454443;
    }


  `
})
export class PageHeaderComponent {
  @Input({required: true}) title: string ='Title Here';
  @Input({required: false}) subtitle?: string;
}
