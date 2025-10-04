import {inject, Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {Observable} from "rxjs";
import { proxyPath } from "@configs/api-url.config";

const _manageApi = proxyPath.management;

@Injectable({
  providedIn: 'root'
})
export class OtManagementService {
  private _http = inject(HttpClient);

  upload(fileName: string, formData: FormData): Observable<any> {
    return this._http.post(_manageApi+`/ot/upload/${fileName}`, formData, { responseType: 'text' });
  }

  download(fileName: string): Observable<Blob> {
    return this._http.get(_manageApi+`/ot/download/${fileName}`, { responseType: 'blob' });
  }
}
