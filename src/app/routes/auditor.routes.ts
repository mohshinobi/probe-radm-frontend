import { Route } from '@angular/router';
import { isGrantedAuditorGuard } from '@core/guards/is-granted-auditor.guard';

export const auditorRoutes: Route = 
{
    path: 'auditor',
    canActivate: [() => isGrantedAuditorGuard()],
    canActivateChild: [() => isGrantedAuditorGuard()],
    loadComponent: () => import('@features/auditor/auditor.component').then(c => c.AuditorComponent),
    children: [

    ]
}