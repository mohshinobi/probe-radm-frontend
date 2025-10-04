import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '@core/services/token.service';


export const authGuard = () => {

    const router       = inject(Router);
    const tokenService = inject(TokenService);
    
    if (tokenService.isTokenExpired()) {
        router.navigateByUrl('auth/login');
        tokenService.removeToken();
        return false;
    }

    return true;
}