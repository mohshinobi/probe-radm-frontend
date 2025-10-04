import { Injectable, inject } from '@angular/core';
import { TokenService } from './token.service';
import { RolesEnum } from '@core/enums/roles.enum';

@Injectable({
    providedIn: 'root',
})
export class RoleService {

    private _tokenService = inject(TokenService);

    role: string[] = [];

    getRoles(): string[] {
        return this._tokenService.getUser()?.roles || [];
    }

    isAdministrator(): boolean {
        return this.getRoles().includes(RolesEnum.ADMINISTRATOR);
    }

    isAuditor(): boolean {
        return this.getRoles().includes(RolesEnum.AUDITOR);
    }

    isOperator(): boolean {
        return this.getRoles().includes(RolesEnum.OPERATOR);
    }

    getRole() {
        this.role = this._tokenService.getUser()?.roles || [];
        return this.getKeyByValue(RolesEnum, this.role[0])
    }

    getKeyByValue(object: any, value: any) {
        return Object.keys(object).find(key => object[key] === value);
    }
}