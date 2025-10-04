import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '@core/services/token.service';
import { ToastrService } from 'ngx-toastr';


export const firstConnectionGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const tokenService = inject(TokenService);
    const toastr = inject(ToastrService);

    try {
        const user = tokenService.getUser();
        
        if (!user) {
            return true;
        }

        const isChangePasswordRoute = state.url === '/auth/change-password';
        const isFirstConnection = user.firstConnection;

        if (!isFirstConnection && isChangePasswordRoute) {
            router.navigateByUrl('/');
            return false;
        }

        if (isFirstConnection && !isChangePasswordRoute) {
            router.navigateByUrl('/auth/change-password');
            toastr.success('First connection detected: you must change your password!');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in firstConnectionGuard:', error);
        return false;
    }
};