import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MenuInterface } from '@core/interfaces';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-side-nav',
    imports: [
        MatSidenavModule,
        MatButtonModule,
        MatListModule,
        MatIconModule,
        MatExpansionModule,
        RouterLink,
        RouterLinkActive
    ],
    templateUrl: './side-nav.component.html',
    styleUrl: './side-nav.component.scss',
    animations: [
        trigger('sidenavAnimation', [
            state('open', style({ width: '250px' })),
            state('closed', style({ width: '62px' })),
            transition('open <=> closed', animate('0.4s ease-in-out'))
        ]),
        trigger('sidenavContentAnimation', [
            state('open', style({ marginLeft: '250px' })),
            state('closed', style({ marginLeft: '62px' })),
            transition('open <=> closed', animate('0.4s ease-in-out'))
        ])
    ]
})
export class SideNavComponent {

  @Input() isCollapsed = true;
  @Input() navItems: MenuInterface[] = [];

  // toggleSideNav() {
  //   this.isCollapsed = !this.isCollapsed;
  // }
}