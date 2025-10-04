import { Routes } from '@angular/router';
import { administratorRoutes, auditorRoutes, operatorRoutes } from './routes';
import { authGuard } from '@core/guards/auth.guard';
import { firstConnectionGuard } from '@core/guards/first-connection.guard';
import { isGrantedOperatorGuard } from '@core/guards/is-granted-operator.guard';
import { isGrantedAdministratorGuard } from '@core/guards/is-granted-administrator.guard';
import { authRoutes } from '@features/authentication/auth.routes';


export const routes: Routes = [
    { path: '', redirectTo: '/operator/overview', pathMatch: 'full' },
    authRoutes,
    {
        path: '',
        canActivate: [() => authGuard(), firstConnectionGuard],
        canActivateChild: [() => authGuard(), firstConnectionGuard],
        loadComponent: () => import('@layout/app-layout.component').then(c => c.AppLayoutComponent),
        children: [
            {
              path: '',
              canActivateChild: [isGrantedAdministratorGuard],
              loadChildren : () => administratorRoutes
            },
            {
              path: '',
              canActivateChild: [isGrantedOperatorGuard],
              loadChildren : () => operatorRoutes
            },
            auditorRoutes,
            {
                path: '**',
                loadComponent: () => import('@features/not-found-page/not-found-page.component').then(c => c.NotFoundPageComponent)
            }
        ]
    }
];
