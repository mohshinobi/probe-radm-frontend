import { Route } from '@angular/router';
import { isGrantedAlertDetailGuard} from "@core/guards/is-granted-alert-detail.guard";
import { rulesRoutes } from '@features/operator/parameters/rules/rules.routes';

export const operatorRoutes: Route[] = [

  {
    path: 'operator',
    loadComponent: () => import('@features/operator/operator.component').then(c => c.OperatorComponent),

    children: [
        { path: '', redirectTo: 'overview', pathMatch: 'full' },
        {
          path: 'overview',
          loadComponent: () => import('@features/operator/overview/overview.component').then(c => c.OverviewComponent),
        },
        {
          path: 'forensics',
          loadComponent: () => import('@features/operator/forensics/forensics.component').then(c => c.ForensicsComponent)
        },
        {
          path: 'topology',
          loadComponent: () => import('@features/operator/topology/topology.component').then(c => c.TopologyComponent),
          children: [
            { path: '', redirectTo: 'activity', pathMatch: 'full' },
            {
              path: 'activity',
              loadComponent: () => import('@features/operator/topology/activity/activity.component').then(c => c.ActivityComponent)
            },
            {
              path: 'asset',
              loadComponent: () => import('@features/operator/topology/asset/asset.component').then(c => c.AssetComponent)
            },
            {
              path: 'asset/details',
              loadComponent: () => import('@features/operator/topology/asset/details/details.component').then(c => c.DetailsComponent)
            }
            // {
            //   path: 'traffic',
            //   loadComponent: () => import('@features/operator/topology/traffic/traffic.component').then(c => c.TrafficComponent)
            // }
          ]
        },
        {
          path: 'ai',
          loadComponent: () => import('@features/operator/ai/ai.component').then(c => c.AiComponent),
          children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
              path: 'dashboard',
              loadComponent: () => import('@features/operator/ai/dashboard/dashboard.component').then(c => c.DashboardComponent),
            },
            {
              path: 'detection',
              loadComponent: () => import('@features/operator/ai/detection/detection.component').then(c => c.DetectionComponent),
            },
            {
              path: 'deviances',
              loadComponent: () => import('@features/operator/ai/deviances/deviances.component').then(c => c.DeviancesComponent),
            }
          ]
        },
        {
          path: 'detection',
          loadComponent: () => import('@features/operator/detection/detection.component').then(c => c.DetectionComponent),
          children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            {
              path: 'overview',
              loadComponent: () => import('@features/operator/detection/overview/overview.component').then(c => c.OverviewComponent)
            },
            {
              path: 'protocol',
              loadComponent: () => import('@features/operator/detection/protocol/overview/overview.component').then(c => c.OverviewComponent)
            },
            {
              path: 'source',
              loadComponent: () => import('@features/operator/detection/source/source.component').then(c => c.SourceComponent)
            },
            {
              path: 'category',
              loadComponent: () => import('@features/operator/detection/category/category.component').then(c => c.CategoryComponent)
            },
            {
              path: 'application',
              loadComponent: () => import('@features/operator/detection/application/application.component').then(c => c.ApplicationComponent)
            },
            {
              path: 'rule',
              loadComponent: () => import('@features/operator/detection/rule/rule.component').then(c => c.RuleComponent)
            },
            {
              path: 'anomalies',
              loadComponent: () => import('@features/operator/detection/anomalies/anomalies.component').then(c => c.AnomaliesComponent)
            },
            {
              path: 'alerts-list',
              loadComponent: () => import('@features/operator/detection/alerts-list/alerts-list.component').then(c => c.AlertsListComponent)
            }
          ]
        },
        {
          path: 'ot',
          loadComponent: () => import('@features/operator/ot/ot.component').then(c => c.OtComponent),
          children: [
            { path: '', redirectTo: 'topology', pathMatch: 'full' },
            {
              path: 'topology',
              loadComponent: () => import('@features/operator/ot/topology/topology.component').then(c => c.TopologyComponent),
            },
            {
              path: 'assets',
              loadComponent: () => import('@features/operator/ot/asset/asset.component').then(c => c.AssetComponent)
            },
            {
              path: 'conversation',
              loadComponent: () => import('@features/operator/ot/conversation/conversation.component').then(c => c.ConversationComponent),
            },
            {
              path: 'alerts',
              loadComponent: () => import('@features/operator/ot/alerts/ot.alerts.component').then(c => c.OtAlertsComponent),
            },
            {
              path: 'asset/details/:id',
              loadComponent: () => import('@features/operator/ot/asset/view/view.component').then(c => c.ViewComponent),

            },
            {
              path: 'alert/details/:id',
              loadComponent: () => import('@features/operator/ot/alerts/details/ot.alert.details.component').then(c => c.OtAlertDetailsComponent),
            },
            {
              path: 'conversation/details/:id',
              loadComponent: () => import('@features/operator/ot/conversation/view/view.component').then(c => c.ViewComponent),

            }
          ]
        },
        {
            path: 'alerts',
            loadComponent: () => import('@features/operator/alerts/alerts.component').then(c => c.AlertsComponent),
            children: [
                { path: '', redirectTo: 'flows', pathMatch: 'full' },
                {
                  path: 'detail',
                  canActivate: [isGrantedAlertDetailGuard],
                  loadComponent: () => import('@features/operator/alerts/detail/detail.component').then(c => c.DetailComponent)
                }
            ]
        },
        {
          path: 'uc',
          loadComponent: () =>
            import('@features/operator/uc/uc.component').then(c => c.UcComponent),
          children: [
            { path: '', redirectTo: 'usecases', pathMatch: 'full' },
            {
              path: 'usecases',
              loadComponent: () =>
                import('@features/operator/uc/usecases/usecases.component').then(c => c.UsecasesComponent)
            },
            {
              path: 'usecases/details',
              loadComponent: () =>
                import('@features/operator/uc/usecases/details/details.component').then(c => c.DetailsComponent)
            },
            {
              path: 'alerts',
              loadComponent: () =>
                import('@features/operator/uc/alerts/alerts.component').then(c => c.AlertsComponent)
            },
            {
              path: 'alerts/details',
              loadComponent: () =>
                import('@features/operator/uc/alerts/details/details.component').then(c => c.DetailsComponent)
            },
          ]
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
            rulesRoutes,
            {
              path: 'ot',
              loadComponent: () => import('@features/operator/parameters/ot/ot.component').then(c => c.OtComponent)
            },
            {
              path: 'traffic_licence',
              loadComponent: () => import('@features/operator/parameters/traffic-licence/traffic-licence.component').then(c => c.TrafficLicenceComponent)
            }
          ]
        }
    ]
}

]
