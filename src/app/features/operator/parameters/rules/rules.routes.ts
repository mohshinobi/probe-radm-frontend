import { Route } from '@angular/router';

export const rulesRoutes: Route =
{
  path: 'rules',
  loadComponent: () => import('./rules.component').then(c => c.RulesComponent),
  children: [
    {
      path: '',
      loadComponent: () => import('./flow/rule-flow.component').then(c => c.RuleFlowComponent),
      children: [
        {
          path: 'activity',
          loadComponent: () => import('./flow/activity/activity.component').then(c => c.RuleFlowActivityComponent)
        },
        {
          path: 'view-rules',
          loadComponent: () => import('./flow/list/list.component').then(c => c.RuleFlowListComponent)
        },
        {
          path: 'edit-rule',
          loadComponent: () => import('./flow/edit/edit.component').then(c => c.RuleFlowEditComponent)
        }
      ]
    } 
  ]
};