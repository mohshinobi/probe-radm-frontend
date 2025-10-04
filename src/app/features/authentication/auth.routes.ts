import { Route } from '@angular/router';
import { firstConnectionGuard } from '@core/guards/first-connection.guard';

export const authRoutes: Route =
{
  path: 'auth',
  canActivate: [firstConnectionGuard],
  canActivateChild: [firstConnectionGuard],
  loadComponent: () => import('./authentication.component').then(c => c.AuthenticationComponent),
  children: [
    {
      path: 'login',
      loadComponent: () => import('./login/login.component').then(c => c.LoginComponent)
    },
    {
      path: 'change-password',
      loadComponent: () => import('./change-password/change-password.component').then(c => c.ChangePasswordComponent)
    },
  ]
};
