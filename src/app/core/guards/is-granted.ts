import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const isGranted = (isRole: boolean) => {
    
    const router = inject(Router);

    if (!isRole) {
        router.navigateByUrl('page-not-found');
        return false;
    }

    return true;
}