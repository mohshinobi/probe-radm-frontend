import { Injectable, inject } from "@angular/core";
import { JwtHelperService } from "@auth0/angular-jwt";
import { DecodedTokenInterface } from "@core/interfaces/decoded-token.interface";

const TOKEN_KEY = 'access_token';

export interface User {
    roles: string[];
    username: string;
    enabled: boolean;
    authorized: boolean;
    firstConnection: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class TokenService {

    private _jwtHelper = inject(JwtHelperService);

    setToken(token: string): void {
        this.removeToken();
        localStorage.setItem(TOKEN_KEY, token);
    }

    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    removeToken(): void {
        localStorage.removeItem(TOKEN_KEY);
    }

    getDecodedToken(): DecodedTokenInterface | null {
        const token = this.getToken() as string;
        return this._jwtHelper.decodeToken(token) as DecodedTokenInterface;;
    }

    isTokenExpired(): boolean {
        return this._jwtHelper.isTokenExpired(this.getToken());
    }

    getUser(): User | null {
        return this.getDecodedToken() as User;
    }
}