import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

export const contentTypeInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {

  const isAllowedRoute = req.url.indexOf('config/conf') !== -1 || req.url.indexOf('api/api/updateLdap') !== -1;

  if (isAllowedRoute) {
    if (req.method === 'PATCH') {
        // Ajoute les en-têtes nécessaires
        const reqWithHeaders = req.clone({
            headers: req.headers.delete('Content-Type') // Supprime le header problématique
        });

        // Passe au prochain handleur
        return next(reqWithHeaders);
    }
  }

  else {
    if (req.method === 'PATCH') {
        // Ajoute les en-têtes nécessaires
        const reqWithHeaders = req.clone({
            headers: req.headers
                .set('Content-Type', 'application/merge-patch+json')
                .set('Accept', 'application/json') // Optionnel
        });

        // Passe au prochain handleur
        return next(reqWithHeaders);
    }
  }

    // Si ce n'est pas une requête PATCH, passe la requête telle quelle
    return next(req);
};
