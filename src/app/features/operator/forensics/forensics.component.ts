import {Component, inject, OnInit} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {ActivatedRoute} from "@angular/router";



@Component({
    selector: 'app-forensics',
    imports: [],
    template: `
    <div class="iframe-container">
      <iframe [src]='arkimeUrl' frameborder="0"></iframe>
    </div>
  `,
    styles: [`
    .iframe-container {
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  `]
})
export class ForensicsComponent implements OnInit{
  private _route = inject(ActivatedRoute)
  private _sanitizer = inject(DomSanitizer)

  arkimeUrl: SafeResourceUrl | undefined;
  communityId: string = '';
  externalUrl: string = '';

  ngOnInit() {
    this._route.queryParams.subscribe(params => {
      this.communityId = params['communityId'];
    });

    if (this.communityId){
      this.externalUrl = `https://${window.location.hostname}:8005/sessions?expression=communityId=="${this.communityId}"`;
    } else {
      this.externalUrl = `https://${window.location.hostname}:8005`;
    }

    this.arkimeUrl = this._sanitizer.bypassSecurityTrustResourceUrl(this.externalUrl);
  }
}















