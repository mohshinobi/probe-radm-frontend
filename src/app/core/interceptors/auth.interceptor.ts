import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject, isDevMode } from "@angular/core";
import { Router } from "@angular/router";
import { appUrl } from "@configs/app-url.config";
import { TokenService } from "@core/services/token.service";
import { ToastrService } from "ngx-toastr";
import { catchError, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {

    const tokenService  = inject(TokenService);
    const toastr        = inject(ToastrService);
    const router        = inject(Router);

    if (tokenService.isTokenExpired()) {
        inject(Router).navigateByUrl(appUrl.auth.login);
        return next(req);
    }

    let reqWithHeader = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${tokenService.getToken()}`),
    });

    return next(reqWithHeader).pipe(
        catchError(error => {
            const body = error.error;

            const handleAuthError = (title: string, message: string) => {
                toastr.error(`${message}. Please contact support.`, title);
                localStorage.clear();
                router.navigate(['/auth/login']);
            };

            switch (error.status) {
                case 403:
                    const licenseMessage = body?.license_error?.message;
                    if (licenseMessage) {
                        handleAuthError('License Error', licenseMessage);
                    }
                    break;

                case 401:
                    const authMessage = body?.message;
                    if (authMessage) {
                        handleAuthError('Authentication Error', authMessage);
                    }
                    break;
            }

            return throwError(() => error);
        })
    );
}
