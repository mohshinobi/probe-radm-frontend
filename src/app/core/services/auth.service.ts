import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { apiUrlConfig, proxyPath } from '@configs/api-url.config';
import { TokenService } from './token.service';
import { HttpClient } from '@angular/common/http';
import { LoginInterface } from '@core/interfaces/login.interface';
import { RolesEnum } from '@core/enums/roles.enum';
import { appUrl } from '@configs/app-url.config';
import { ToastrService } from 'ngx-toastr';

const _webApi = proxyPath.web;
@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private _router = inject(Router);
	private _tokenService = inject(TokenService);
	private _http = inject(HttpClient);
	private _toastr = inject(ToastrService);

	get username(): string | null {
		return this._tokenService.getUser()?.username ?? null;
	}

	login(login: LoginInterface) {
		return this._http.post<LoginInterface>('api/login', login)
			.subscribe({
				next: (response: any) => {
					this._tokenService.setToken(response?.token);
					this.roleRedirect(this._tokenService.getUser()?.roles);
				},
				error: (error: any) => {
					this._toastr.error(`${error.error?.message}`, 'Login failed');
				}
			});
	}

	getPingBack() {
		return this._http.get<any>(_webApi + '/ping', { observe: 'response' });
	}

	logout(): void {
		this._router.navigateByUrl(appUrl.auth.login);
		localStorage.clear();
	}

	roleRedirect(userRoles: string[] | undefined) {
		const roleToRoute: { [key: string]: string; } = {
			[RolesEnum.ADMINISTRATOR]: appUrl.administrator.basePath,
			[RolesEnum.OPERATOR]: appUrl.operator.basePath,
			[RolesEnum.AUDITOR]: appUrl.auditor.basePath,
		};

		if (!userRoles) return;

		const route = userRoles.find(role => roleToRoute[role]);
		if (route) {
			this._router.navigate([roleToRoute[route]]);
		}
	}
}
