import { Route } from '@angular/router';

export const administratorRoutes: Route[] = [
  {
  path: 'administrator',
  loadComponent: () => import('@features/administrator/administrator.component').then((c) => c.AdministratorComponent),
  children: [
    { path: '', redirectTo: 'overview', pathMatch: 'full' },
    {
      path: 'overview',
      loadComponent: () => import('@features/operator/overview/overview.component').then(c => c.OverviewComponent),
    },
    {
      path: 'parameters',
      loadComponent: () =>
        import('@features/administrator/parameters/parameters.component').then(
          (c) => c.ParametersComponent
        ),
      children: [
        { path: '', redirectTo: 'healthcheck', pathMatch: 'full' },
        {
          path: 'healthcheck',
          loadComponent: () => import('@features/healthcheck/healthcheck.component').then((c) => c.HealthcheckComponent),
        },
        {
          path: 'logs',
          loadComponent: () => import('@features/logs/logs.component').then((c) => c.LogsComponent),
        },
        {
          path: 'configuration',
          loadComponent: () =>import('@shared/components/configuration/configuration.component').then((c) => c.ConfigurationComponent)
        },
      ],
    },
    {
      path: 'users',
      loadComponent: () => import('@features/administrator/users/users.component').then( (c) => c.UsersComponent ),
    },
    {
      path: 'parameters',
      loadComponent: () => import('@features/operator/parameters/parameters.component').then(c => c.ParametersComponent),
      children: [
        { path: '', redirectTo: 'healthcheck', pathMatch: 'full' },
        {
          path: 'healthcheck',
          loadComponent: () => import('@features/healthcheck/healthcheck.component').then(c => c.HealthcheckComponent)
        },
        {
          path: 'logs',
          loadComponent: () => import('@features/logs/logs.component').then(c => c.LogsComponent)
        },
        {
          path: 'configuration',
          loadComponent: () => import('@shared/components/configuration/configuration.component').then(c => c.ConfigurationComponent)
        },
        {
          path: 'traffic_licence',
          loadComponent: () => import('@features/operator/parameters/traffic-licence/traffic-licence.component').then(c => c.TrafficLicenceComponent)
        }
      ]
    }
  ],
}];
