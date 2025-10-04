import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { proxyPath } from '@configs/api-url.config';
import { AUTHORIZED_QUESTIONS, AuthorizedQuestion, MISTRAL_CONFIG } from '@core/constants/mistral.constants';
import { AnalysisResponse, MistralRequest, MistralResponse } from '@core/interfaces/mistral-response-interface';
import { environment } from '@env/environment';
import { map, Observable } from 'rxjs';

const _mistralApi = proxyPath.mistral;

@Injectable({
  providedIn: 'root',
})
export class MistralAnalysisService {
  private _http = inject(HttpClient);

  aiAnalysis(question: AuthorizedQuestion, alertDescription: string): Observable<AnalysisResponse> {
    
    // prepare request
    const payload: MistralRequest = {
      model: MISTRAL_CONFIG.API.MODEL,
      messages: [
        {
          role: 'user',
          content: `${alertDescription} ${question}`
        }
      ]
    };

    return this._http
      .post<MistralResponse>(_mistralApi+'/v1/chat/completions', payload)
      .pipe(
        map(response => ({
          content: response.choices[0]?.message?.content || 'No response available'
        }))
      );
  }
}

