import {ActivatedRouteSnapshot, Router, CanActivateFn} from '@angular/router';
import {inject} from "@angular/core";

export const isGrantedAlertDetailGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router= inject(Router);
  const type = route.queryParamMap.get('type');
  const id = route.queryParamMap.get('id');

  if (id && type) {
    return true;
  } else {
    return router.createUrlTree(['/not-found']);
  }
};
