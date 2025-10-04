import { inject } from '@angular/core';
import { RoleService } from '@core/services/role.service';
import { isGranted } from './is-granted';

export const isGrantedOperatorGuard = () => {
    return isGranted(inject(RoleService).isOperator());
}