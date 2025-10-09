import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TrafficService } from '@core/services';
import { Location, LocationStrategy } from '@angular/common';

@Component({
    selector: 'app-footer',
    imports: [MatIconModule],
    template: `
      <div class="footer" style="height: 50px;">
        <div class="footer-content">
          <div class="footer-links">
            <img src="../../assets/images/radm-logo-navbar.png" alt="logo" style="margin:0 1rem;" class="img-fluid img-logo"/>
            <span>V {{ version }}</span>
            <a class="link" href="http://{{ baseUrl }}:8015" target="_blank"><mat-icon>live_help</mat-icon>Help</a>
            <a class="link"  target="_blank"><mat-icon>perm_phone_msg</mat-icon>Contact Us</a>
          </div>
        </div>
      </div>
    `,
    styleUrls: ['./page.footer.component.scss']
})
export class PageFooterComponent {
  private _trafficService = inject(TrafficService);
  version: string = ' ';
  baseUrl = window.location.hostname;
   constructor(private cdr: ChangeDetectorRef , private location: Location, private locationStrategy: LocationStrategy) {
      this._trafficService.getVersion().subscribe({
        next: (response: any) => {
          if (response && response.full_version) {
            this.version = response.full_version;
          } else {
            this.version = 'Unknown Version';
          }
           this.cdr.detectChanges();
        },
      });
    }
}
