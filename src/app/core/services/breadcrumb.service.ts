import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly _breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);
  readonly breadcrumbs$ = this._breadcrumbs$.asObservable();

  constructor(private router: Router, private route: ActivatedRoute) {

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const breadcrumbs: Breadcrumb[] = [];
      let currentRoute = this.route.root;
      let url = '';

      while (currentRoute.firstChild) {
        currentRoute = currentRoute.firstChild;
        const routeSnapshot = currentRoute.snapshot;
        const label = routeSnapshot.data?.['breadcrumb'];
        const path = routeSnapshot.url.map(segment => segment.path).join('/');
        if (path) url += `/${path}`;
        if (label) {
          breadcrumbs.push({ label, url });
        }
      }

      this._breadcrumbs$.next(breadcrumbs);
    });
  }
}
