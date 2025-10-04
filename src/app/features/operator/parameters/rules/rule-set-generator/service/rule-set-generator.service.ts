import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { proxyPath } from "@configs/api-url.config";
import { catchError, forkJoin, map, Observable, shareReplay, throwError } from "rxjs";
import { Category } from "../rule-set-generator.types";

const _rulesetApi = proxyPath.ruleset;

@Injectable({
    providedIn: 'root'
})
export class RuleSetGeneratorService {

    private _http = inject(HttpClient);

    private readonly RULE_ENDPOINTS = [
        'attack_vectors',
        'detection_methods',
        'confidences',
        'severities',
        'impacts',
        'protocols',
        'rule_directions',
    ] as const;

    /**
     * utility method to convert strings to title case
     */
    private toTitle(s: string): string {
        if (typeof s !== 'string') return String(s);
        return s
            .replace(/_/g, ' ')
            .replace(/\b\w/g, ch => ch.toUpperCase());
    }

    private downloadFile(content: string, filename: string): void {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    /**
     * transforms API response data into Category format
     */
    private transformToCategory(endpoint: string, data: Array<string | number>): Category {
        const options = data.map(item => ({
            label: typeof item === 'string' ? this.toTitle(item) : String(item),
            value: item
        }));

        return {
            key: endpoint,
            title: this.toTitle(endpoint),
            options
        };
    }

    getAllRuleSet(): Observable<Category[]> {
        const requests = this.RULE_ENDPOINTS.map(
            ep => this._http.get<any>(`${_rulesetApi}/rules/${ep}`)
        );

        return forkJoin(requests).pipe(
            map(results => {
                const dataMap = Object.fromEntries(
                    this.RULE_ENDPOINTS.map((ep, idx) => [ep, results[idx]?.data ?? []])
                );

                return this.RULE_ENDPOINTS.map(ep =>
                    this.transformToCategory(ep, dataMap[ep] ?? [])
                );
            }),
            catchError(err => throwError(() => err)),
            shareReplay(1)
        );
    }

    getOneRuleSet(key: string): Observable<Category> {
        return this._http.get<any>(`${_rulesetApi}/rules/${key}`).pipe(
            map(result => {
                return this.transformToCategory(key, result.data ?? []);
            }),
            catchError(err => throwError(() => err)),
            shareReplay(1)
        );
    }

    countRules(body: any): Observable<any> {
        return this._http.post<any>(`${_rulesetApi}/rules/count`, body).pipe(
            catchError(err => throwError(() => err))
        );
    }

    generateRules(body: Record<string, any>): Observable<string> {
        const json = typeof body === 'string' ? body : JSON.stringify(body);
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'text/plain'
        });

        return this._http.post(`${_rulesetApi}/rules/filter`, json, {
            headers,
            responseType: 'text'
        }).pipe(
            map(content => {
                this.downloadFile(content, 'hoshi.rules');
                return content;
            }),
            catchError(err => throwError(() => err))
        );
    }
}