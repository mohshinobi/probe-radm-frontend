import { Route } from '@angular/router';

export const authenticationRoutes: Route = 
{
    path:'auth',
    children: [
        {
            path: 'login',
            loadComponent: () => import('@features/authentication/login/login.component').then(c => c.LoginComponent)
        },
        {
            path: 'config',
            loadComponent: () => import('@features/authentication/change-password/change-password.component').then(c => c.ChangePasswordComponent)
        }
    ]
}




