import { HttpClient } from '@angular/common/http';
import { WritableSignal, inject, signal } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { UserInterface } from '@core/interfaces';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

export interface UserQueryParams {
  id?:string;
  username?: string;
  enabled?: string;
  password?: string;
  repeatPassword?: string;
  authorized?: string;
  firstConnection?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  roles?: string[];
  role?: string;
  type?: string;
  // sortedBy?: string;
  // orderBy?: string;
  page?: number;
  size?: number;
  'createdAt[after]'?: string; // Date au format ISO pour les filtres de création
  'order[username]'?: 'asc' | 'desc'; // Ordre pour le tri sur le champ `username`
  'order[createdAt]'?: 'asc' | 'desc'; // Ordre pour le tri sur le champ `createdAt`
}

export interface ChangePasswordParams {
  currentPassword?: string;
  newPassword: string;
  confirmPassword?: string;
}

export class UsersService {

  private _http = inject(HttpClient);

  getUserByUsername(username: string):Observable<UserInterface>{
      return this._http.get<UserInterface>(`/api/api/users/${username}`);
  }

  getDeleteUsers(ids: number[]):Observable<UserInterface>{
    return this._http.post<UserInterface>(`/api/api/users/bulk-delete`, {ids: ids});
  }

  getAllUsers(queryParams: UserQueryParams): Observable<{ users: UserInterface[]; total: number }>{
    // Générer l'URL avec les paramètres
    let baseUrl = '/api/api/users';
    const fullUrl = this.queryParams(baseUrl, queryParams);
    return this._http
      .get<UserInterface[]>(fullUrl)
      .pipe(
        map((response: any) => ({
          users: response['hydra:member'] as UserInterface[] , // Liste des utilisateurs
          total: response['hydra:totalItems'], // Total des utilisateurs
        }))
      );
  }

  queryParams(baseUrl: string, params: Record<string, any>): string {
    let httpParams = new HttpParams();

    // Ajouter chaque paramètre à HttpParams
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
        if (Array.isArray(params[key])) {
          // Gérer les tableaux en ajoutant chaque élément séparément
          params[key].forEach((item: any) => {
            httpParams = httpParams.append(key, item);
          });
        } else {
          httpParams = httpParams.set(key, params[key].toString());
        }
      }
    }

    // Construire l'URL finale
    const queryString = httpParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  addNewUser(params: UserQueryParams) {
    return  this._http.post<any>(`/api/api/users` , params).pipe(
      map(response => response),
      catchError(error => {
        return of(error);
      })
    )
  }

 /*
 * l'interceptor: content-type.interceptor: ajoutera dans l'en-tête: Content-Type: application/merge-patch+json
 */
  updateUserById(id: number, params: UserQueryParams): Observable<any> {    
    return this._http.put<any>(`/api/api/users/update/${id}`, params).pipe(
      map(response => response),
      catchError(error => {
        return of(error);
      })
    );
  }

  deleteUser(id: number): Observable<any> {
    return this._http.delete<any>(`/api/api/users/${id}`);
  }

  confirmEqualValidator(main: string, confirm: string): ValidatorFn {
    return (ctrl: AbstractControl): null | ValidationErrors => {
        if (!ctrl.get(main) || !ctrl.get(confirm)) {
            return {
                confirmEqual: 'Invalid control names'
            };
        }
        const mainValue = ctrl.get(main)!.value;
        const confirmValue = ctrl.get(confirm)!.value;

        return mainValue === confirmValue ? null : {
            confirmEqual: {
                main: mainValue,
                confirm: confirmValue
            }
        };
    };
  }

  /**
   * Change Password
   */
  // Méthode pour changer le mot de passe
  changePassword(username: string, params: ChangePasswordParams): Observable<any> {
    return this._http.post(`/api/api/users/${username}/change-password`, params);
  }
}
