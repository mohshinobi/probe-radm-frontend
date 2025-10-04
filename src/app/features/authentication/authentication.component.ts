import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TrafficService } from '@core/services/traffic.service';
import { LdapService } from '@shared/components/configuration/ldap/ldap.service';

@Component({
    selector: 'app-authentication',
    imports: [
        MatIconModule,
        RouterOutlet
    ],
    templateUrl: './authentication.component.html',
    styleUrl: './authentication.component.scss'
})
export class AuthenticationComponent {

    private readonly authService = inject(AuthService);
    private readonly ldapService = inject(LdapService);
    private readonly trafficService = inject(TrafficService);

    readonly ping = toSignal(this.authService.getPingBack());
    readonly version = toSignal(this.trafficService.getVersion());
    readonly ldapStatus = toSignal(this.ldapService.getLdapConfigStatus());
}
