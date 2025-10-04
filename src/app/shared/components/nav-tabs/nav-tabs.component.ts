import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { NavTabsInterface } from '@core/interfaces/nav-tabs.interface';

@Component({
    selector: 'app-nav-tabs',
    imports: [
        MatTabsModule,
        MatButtonModule,
        RouterLinkActive,
        RouterModule
    ],
    templateUrl: './nav-tabs.component.html',
    styleUrl: './nav-tabs.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavTabsComponent {
  
  @Input({required: true}) links:NavTabsInterface [] = []
  activeLink = this.links[0]?.link;
}
