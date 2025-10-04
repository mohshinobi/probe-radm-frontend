import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/components/header/header.component';
import { PageFooterComponent } from '@layout/page.footer.component';
import { navItemsByRules } from '@configs/roles-nav-bar/nav-bar.config';
import { RoleService } from '@core/services/role.service';
import { MenuInterface } from '@core/interfaces';
import { SideNavComponent } from '@shared/components/side-nav/side-nav.component';

@Component({
    selector: 'app-layout',
    imports: [
        RouterOutlet,
        SideNavComponent,
        HeaderComponent,
        PageFooterComponent
    ],
    template: `
  <app-header (sideNavAction)="toggleSideNav()" class="header-nav"/>
  <app-side-nav [navItems]="navItems" [isCollapsed]="isCollapsed" >
    <div class="div-content">
      <router-outlet></router-outlet>
    </div>
  </app-side-nav>
  <app-footer id="footer"/>
  `,
    styles: `
    .header-nav {
      position: fixed;
      z-index: 100;
      width: 100%;
      height: var(--navbar-height);
    } 
    .div-content { 
      gap:1rem;
      padding-top: 14px; 
      height: calc(100vh - var(--navbar-height) - var(--footer-height));
      overflow-y: auto; 
    }
  `
})
export class AppLayoutComponent {
  private _roleService = inject(RoleService);
  isCollapsed = false;
  navItems: MenuInterface[] = navItemsByRules(this._roleService);
  toggleSideNav() {
    this.isCollapsed = !this.isCollapsed;
  }
}
