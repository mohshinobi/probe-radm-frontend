import {inject, Injectable} from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AlertsService, IAService, CommonService } from '@core/services';
import {ZeekConnService} from "@core/services/zeek-conn.service";
import {
  AIDetail,
  AlertDetails,
  AppProto,
  ZeekConnDetail,
  ZeekSslDetail
} from "@features/operator/alerts/detail/detail.interface";
import {AlertTimelineResponse} from "@core/interfaces";
import {FlowService} from "@features/operator/alerts/detail/service/flow.service";

@Injectable({
  providedIn: 'root',
})
export class DetailService {
  _alertsService = inject(AlertsService);
  _zeekConnService = inject(ZeekConnService);
  _flowService = inject(FlowService);
  _IAService = inject(IAService);
  _commonService = inject(CommonService);

  fetchZeekData(communityId: string, srcIp: string): Observable<ZeekConnDetail> {
    return this._zeekConnService.getZeekConnDetail(communityId, srcIp).pipe(
      map(data => data[0] as ZeekConnDetail),
      catchError(() => of({} as ZeekConnDetail))
    );
  }

  fetchZeekSslData(uid: string, displayCol: string[]): Observable<ZeekSslDetail> {
    return this._zeekConnService.getZeekSslDetail(uid, displayCol).pipe(
      map(data => data[0] as ZeekSslDetail),
      catchError(() => of({} as ZeekSslDetail))
    );
  }

  fetchAppProto(communityId: string, srcIp: string): Observable<AppProto> {
    return this._flowService.getFlowData(communityId, srcIp).pipe(
      map(data => data[0] as AppProto),
      catchError(() => of({} as AppProto))
    );
  }

  fetchAIData(community_id: string, srcIp: string): Observable<AIDetail> {
    return this._IAService.getDevianceById(community_id, srcIp).pipe(
      map(data => ({
        deviance: data[0]?.deviance.toString() || '0',
        translation: data[0]?.translation || '',
      } as AIDetail)),
      catchError(() => of({ deviance: 0, translation: '' } as AIDetail))
    );
  }

  fetchAlertTimeline(srcIp: string, destIp: string, timeline: string, displayCol: string[]): Observable<any> {
    return this._alertsService.getAlertTimeline(srcIp, destIp, displayCol, timeline).pipe(
      map(data => data),
      catchError(err => {
        console.error('Error fetching alert data:', err);
        return of(null);
      })
    )
  }

  processZeekSslData(zeekData: ZeekConnDetail, alertDetails: AlertDetails, aiData: AIDetail, appProto: AppProto, previousAlerts: any[], nextAlerts: any[], displayedZeekSslColumns: string[]
  ): Observable<AlertDetails> {
    if (!zeekData || !zeekData.uid) {
      return of({
        ...alertDetails,
        aiData,
        zeekData,
        appProto,
        previous: previousAlerts,
        next: nextAlerts,
      } as AlertDetails);
    }

    return this.fetchZeekSslData(zeekData.uid, displayedZeekSslColumns).pipe(
      map(sslData => ({
        ...alertDetails,
        sslData,
        aiData,
        zeekData,
        appProto,
        previous: previousAlerts,
        next: nextAlerts,
      } as AlertDetails))
    );
  }


  prepareTimelineData(timeline: AlertTimelineResponse, alertDetails: AlertDetails, type: string, maxElements = 5
  ): { previousAlerts: any[]; nextAlerts: any[]; dataCount: any[] } {

    if (!timeline){
      const dataCount = [ alertDetails]
        .map(alert => ({
          src_ip: alert.src_ip,
          dest_ip: alert.dest_ip,
          signature_id: alert.alert?.signature_id,
          rev: alert.alert?.rev,
        }));
      return {nextAlerts: [], previousAlerts: [], dataCount };
    }

    const twoPreviousAlerts = timeline.data.two_previous_alerts.top_hits_alerts.hits.hits.map(
      hit => ({ ...hit._source, _id: hit._id })
    );
    const twoNextAlerts = timeline.data.two_next_alerts.top_hits_alerts.hits.hits.map(hit => ({
      ...hit._source,
      _id: hit._id,
    }));

    if (twoPreviousAlerts.length === 0 && twoNextAlerts.length === 0){
      return { previousAlerts: [], nextAlerts: [], dataCount: [] };
    }


    // Déterminer combien d'éléments doivent être affichés de chaque côté
    const half = Math.floor((maxElements - 1) / 2);

    let previousAlerts = twoPreviousAlerts.slice(-half).reverse(); // Inverser pour conserver l'ordre chronologique
    let nextAlerts = twoNextAlerts.slice(0, half);

    // Calculer les slots restants pour équilibrer les alertes précédentes et suivantes
    const remainingSlots = maxElements - (1 + previousAlerts.length + nextAlerts.length);
    if (remainingSlots > 0) {
      if (previousAlerts.length < half) {
        nextAlerts = twoNextAlerts.slice(0, half + remainingSlots);
      }
      else if (nextAlerts.length < half) {
        previousAlerts = twoPreviousAlerts.slice(-half - remainingSlots).reverse();
      }
    }

    // Préparer les données nécessaires pour calculer le nombre d'alertes
    const dataCount = [...previousAlerts, alertDetails, ...nextAlerts]
      .map(alert => ({
        src_ip: alert.src_ip,
        dest_ip: alert.dest_ip,
        signature_id: alert.alert?.signature_id,
        rev: alert.alert?.rev,
      }));

    return { previousAlerts, nextAlerts, dataCount };
  }

  handleAlertCount(alertCount: any, alertDetails: AlertDetails, previousAlerts: AlertDetails[], nextAlerts: AlertDetails[]
  ): void {
    if (!alertCount) {
      console.warn('No alert count data provided');
      return;
    }
    const alertKeys = Object.keys(alertCount);
    const allAlerts = [...previousAlerts, alertDetails, ...nextAlerts];
    allAlerts.forEach((alert, index) => {

      // Obtenir la clé correspondante(alert_x) pour l'alerte
      const alertKey = alertKeys[index];

      // Ajouter le `alert_count` à l'alerte si la clé et les données existent
      if (alertKey && alertCount[alertKey]) {
        alert.alert_count = alertCount[alertKey].doc_count;
      } else {
        alert.alert_count = 0;
      }
    });
  }

  getSeverity(alertDetails: AlertDetails): number {
    return alertDetails.alert?.severity ?? alertDetails.severity ?? 0;
  }

  validateResponse(response: any): AlertDetails {
    if (!response || !response.data || response.data.length === 0) {
      throw new Error('No alert details found');
    }
    return response.data[0] as AlertDetails;
  }
}
