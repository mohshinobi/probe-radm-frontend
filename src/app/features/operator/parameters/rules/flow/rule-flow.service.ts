import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response.interface';
import { Observable ,catchError, of  ,map, tap, throwError, forkJoin, switchMap } from 'rxjs';
import { FileInterface, RulesFlowQueryParams, RuleFlowInterface, RuleFlowActivity, RuleTopAlerts} from '@features/operator/parameters/rules/flow/rule-flow.interface';
import { proxyPath } from '@configs/api-url.config';

const _coreApi = proxyPath.core;
const _webApi = proxyPath.web;
@Injectable({
  providedIn: 'root',
})

export class RuleFlowService {
  private _http = inject(HttpClient);

  rulesFlowFilesNameList = signal<string[]>([]);
  selectedRuleFileName = signal<string>('');
  msg = signal<any>(null);

  onListRules = signal('');
  onListRulesFiles = signal(0);

  getRuleFlowTopAlerts(lastHours: number,topSize: number) : Observable<RuleTopAlerts[]>{
    let datetime:Date = new Date();
    const endDate:string = this.getFormat(datetime);
    datetime.setHours(datetime.getHours() - lastHours)
    const startDate:string = this.getFormat(datetime);

    const params = {
      index: "logstash-alert-*",
      startDate: startDate,
      endDate: endDate,
      histoTop: topSize,
      histoInterval: 1, // 1 one hour
      histoIncludeFields: ["alert.signature_id", "alert.signature.keyword", "alert.category.keyword", "alert.severity"]
    };
    return this._http.post<RuleTopAlerts[]>(_webApi+`/rule/flow/top-alerts`, params).pipe(map((result:any) => result?.data)).pipe(map((object:any) => { return object})) ;
  }

  getRuleFlowActivity(lastHours: number) : Observable<RuleFlowActivity[]>{
    let datetime:Date = new Date();
    const endDate:string = this.getFormat(datetime);
    datetime.setHours(datetime.getHours() - lastHours)
    const startDate:string = this.getFormat(datetime);

    const params = {
      index: "logstash-alert-*",
      startDate: startDate,
      endDate: endDate,
      histoUnit: "h", // hours
      histoInterval: 1, // 1 one hour
      histoField: "alert.signature_id",
      histoFormat: "MM/dd HH:mm"
    };
    return this._http.post<RuleFlowActivity[]>(_webApi+`/rule/flow/activity`, params).pipe(map((result:any) => result?.data)) ;
  }

  getRuleFlowActPrevHour(lastHours: number) : Observable<RuleFlowActivity[]>{
    let datetime:Date = new Date();
    datetime.setHours(datetime.getHours() - lastHours)
    const endDate:string = this.getFormat(datetime);
    datetime.setHours(datetime.getHours() - 1)
    const startDate:string = this.getFormat(datetime);

    const params = {
      index: "logstash-alert-*",
      startDate: startDate,
      endDate: endDate,
      histoUnit: "h", // hours
      histoInterval: 1, // 1 one hour
      histoField: "alert.signature_id",
      histoFormat: "MM/dd HH:mm"
    };
    return this._http.post<RuleFlowActivity[]>(_webApi+`/rule/flow/activity`, params).pipe(map((result:any) => result?.data)) ;
  }

  getListFileRules() : Observable<any>{
    return this._http.get<any>(_coreApi+`/rules/sources`)
    .pipe(tap((response: any) => {
      this.rulesFlowFilesNameList.update(() => {
        const sourcesFiles = response?.data?.sources.map((source: any) => source.name);
        console.log(sourcesFiles)
        if (this.onListRulesFiles() == 0) {
          this.selectedRuleFileName.set(sourcesFiles?.[0]);
        }
        return sourcesFiles;
      });
    }));
  }

  getRulesByFileName(queryParams: RulesFlowQueryParams): Observable<ApiResponse<RuleFlowInterface>> {

    if(this.msg()){
      queryParams.sid = this.msg() as number;
      queryParams.page = 1;
      queryParams.size = 10;
      delete queryParams.source;
      return this.getRulesByFilter(queryParams).pipe(
        tap(() => delete queryParams.sid),
        catchError(() => of({} as ApiResponse<RuleFlowInterface>))
      );

    }

    const {  source } = queryParams;
    const url = _coreApi+`/rules/source/${source}`;
    //delete queryParams.msg;
    let params = new HttpParams()
    .set('page', (queryParams.page || 1).toString())
    .set('size', (queryParams.size || 10).toString());

    Object.keys(queryParams).forEach(key => {
      if (key !== 'page' && key !== 'size') {
        const value = queryParams[key as keyof RulesFlowQueryParams];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      }
    });

    return this._http.get<ApiResponse<RuleFlowInterface>>(url, { params })
    .pipe(
      map(response => response),
      catchError(() => of({} as ApiResponse<RuleFlowInterface>))
    );
  }

  getRuleFlowBySid(sid :number) : Observable<RuleFlowInterface>{
    return this._http.get<RuleFlowInterface>(_coreApi+`/rule/${sid}`);
  }

  getRulesByFilter(queryParams: Partial<RulesFlowQueryParams>): Observable<ApiResponse<RuleFlowInterface>> {
    const buildParams = (queryParams: Partial<RulesFlowQueryParams>): HttpParams => {
      return Object.keys(queryParams).reduce((params, key) => {
        const value = queryParams[key as keyof RulesFlowQueryParams];
        if (value !== undefined && value !== null && value !== '') {
          return params.set(key, value.toString());
        }
        return params;
      }, new HttpParams().set('page', (queryParams.page || 1).toString()).set('size', (queryParams.size || 10).toString()));
    };

    const fetchRules = (url: string, params: HttpParams): Observable<ApiResponse<RuleFlowInterface>> =>
      this._http.get<ApiResponse<RuleFlowInterface>>(url, { params }).pipe(
        catchError(() => of({} as ApiResponse<RuleFlowInterface>))
      );

    const params = buildParams(queryParams);

    return fetchRules(_coreApi+`/rules`, params).pipe(
      switchMap((rulesResponse) => {
        const hasDisabledRule = (rulesResponse.data || []).some(rule => rule.status === 'enable');
        const history$ = hasDisabledRule ? fetchRules(_coreApi+`/rules/history`, params) : of({} as ApiResponse<RuleFlowInterface>);
        return forkJoin({ rules: of(rulesResponse), history: history$ });
      }),
      map(({ rules, history }) => ({
        page: (rules.page || 1) + (history.page || 1),
        size: (rules.size || 10) + (history.size || 10),
        offset: (rules.offset || 0) + (history.offset || 0),
        total: (rules.total || 0) + (history.total || 0),
        data: [...(rules.data || []), ...(history.data || [])]
      }))
    );
  }

  updateRuleFlowBySid(sid :number, body: {}) : Observable<string>{
    return this._http.post(_coreApi+`/rule/${sid}`, body, { responseType: 'text' });
  }

  changeRuleFlowActivation(filesName: string, action: 'activate' | 'deactivate'): Observable<string> {

    const body = { sources: [filesName] };

    return this._http.post(_coreApi+`/rules/sources/${action}`, body, { responseType: 'text' });
  }

  updateRuleStatusBySid(sid: number, status: 'enable' | 'disable'): Observable<string> {
    const body = { status };
    return this._http.patch(_coreApi+`/rule/${sid}`, body, { responseType: 'text' });
  }

  getFormat(datetime:Date):string{
    const year =  datetime.getUTCFullYear();
    const month =  this.formatNumber(datetime.getUTCMonth() + 1); // months are from 0-11
    const date =  this.formatNumber(datetime.getUTCDate());
    const hours =  this.formatNumber(datetime.getUTCHours());
    const minutes =  this.formatNumber(datetime.getUTCMinutes());
    const seconds =  this.formatNumber(datetime.getUTCSeconds());
    return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}`;
  }

  formatNumber(number: number): string {
    return number < 10 ? `0${number}` : number.toString();
  }

  uploadRulesFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this._http.post(_coreApi+`/rules/upload/${file.name}`, formData, { responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Upload error:', error);
    return throwError(() => new Error('File upload failed.'));
  }
}