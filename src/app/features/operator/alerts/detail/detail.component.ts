import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader} from "@angular/material/card";
import {AlertsService, CommonService} from "@core/services";
import {catchError, forkJoin, map, of, Subject, switchMap} from "rxjs";
import {AsyncPipe, DatePipe, NgIf} from "@angular/common";
import {MatIcon, MatIconModule} from "@angular/material/icon";
import {Router} from "@angular/router";
import {MatTooltip} from "@angular/material/tooltip";
import {MatDialog} from "@angular/material/dialog";
import {TooltipDialogComponent} from "@features/operator/alerts/detail/tooltip.component";
import {Observable} from 'rxjs';
import {DateDifferencePipe} from "@shared/pipes/date-difference.pipe";
import {DetailService} from "@features/operator/alerts/detail/detail.service";
import {AIDetail, AlertDetails, AppProto, ZeekConnDetail} from "@features/operator/alerts/detail/detail.interface";
import { MistralAnalysisComponent } from "../../mistral-analysis/mistral-analysis.component";
import {MatIconButton} from "@angular/material/button";

@Component({
    selector: 'app-detail',
    imports: [
        MatCard,
        MatCardContent,
        MatCardHeader,
        MatIconModule,
        AsyncPipe,
        DatePipe,
        MatIcon,
        MatTooltip,
        NgIf,
        DateDifferencePipe,
        MistralAnalysisComponent,
        MatIconButton,
    ],
    templateUrl: './detail.component.html',
    styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit, OnDestroy {
  _alertsService = inject(AlertsService);
  _commonService = inject(CommonService);
  _detailService = inject(DetailService);

  private _router = inject(Router);
  private _dialog = inject(MatDialog);
  private _destroy$ = new Subject<void>();

  @Input() id!: string;
  @Input() type!: string;

  details$!: Observable<AlertDetails | null>;
  scoreRisk!: number | null;
  errorMessage: string | null = null;
  isError = false;

  selectedQuestion: string | null = null;
  isPopupVisible: boolean = false;

  externalUrl = `https://${window.location.hostname}:8000/operator/forensics?communityId=`;

  togglePopup(): void {
    this.isPopupVisible = !this.isPopupVisible;
  }
  // Méthode pour gérer la question choisie
  onQuestionSelected(question: string): void {
    this.selectedQuestion = question;
  }
  connStatesTooltip: string = `
    <ul>
      <li>S0 : Tentative de connexion vue, aucune réponse.</li>
      <li>S1 : Connexion établie, non terminée.</li>
      <li>SF : Établissement et terminaison normaux.</li>
      <li>REJ : Tentative de connexion rejetée.</li>
      <li>S2 : Connexion établie et tentative de fermeture par l'initiateur vue (mais aucune réponse du récepteur).</li>
      <li>S3 : Connexion établie et tentative de fermeture par le récepteur vue (mais aucune réponse de l'initiateur).</li>
      <li>RSTO : Connexion établie, initiateur a envoyé un RST (abandon).</li>
      <li>RSTR : Récepteur a envoyé un RST.</li>
      <li>RSTOS0 : Initiateur a envoyé un SYN suivi d'un RST, nous n'avons jamais vu un SYN-ACK du récepteur.</li>
      <li>RSTRH : Récepteur a envoyé un SYN-ACK suivi d'un RST, nous n'avons jamais vu un SYN de l'initiateur (présumé).</li>
      <li>SH : Initiateur a envoyé un SYN suivi d'un FIN, nous n'avons jamais vu un SYN-ACK du récepteur (d'où la connexion était "à moitié" ouverte).</li>
      <li>SHR : Récepteur a envoyé un SYN-ACK suivi d'un FIN, nous n'avons jamais vu un SYN de l'initiateur.</li>
      <li>OTH : Aucun SYN vu, juste du trafic en cours de flux (un exemple de cela est une "connexion partielle" qui n'a pas été fermée correctement).</li>
    </ul>
  `;

  historyTooltip: string = `
    <ul>
      <li>s : un SYN sans le bit ACK</li>
      <li>h : un SYN+ACK (handshake)</li>
      <li>a : un ACK pur</li>
      <li>d : paquet avec payload ("données")</li>
      <li>f : paquet avec le bit FIN défini</li>
      <li>r : paquet avec le bit RST défini</li>
      <li>c : paquet avec un mauvais checksum (s'applique aussi à l'UDP)</li>
      <li>g : un écart de contenu</li>
      <li>t : paquet avec payload retransmis</li>
      <li>w : paquet avec une publicité de fenêtre zéro</li>
      <li>i : paquet incohérent (par ex. bits FIN+RST définis)</li>
      <li>q : paquet multi-drapeaux (bits SYN+FIN ou SYN+RST définis)</li>
      <li>^ : la direction de la connexion a été inversée par l'heuristique de Zeek</li>
      <li>x : analyse de connexion partielle (par ex. limites dépassées)</li>
    </ul>
  `;

  displayedColumns = [
    'flow_id',
    'timestamp',
    'community_id',
    'src_ip',
    'dest_ip',
    'proto',
    'app_proto',
    'threat',
    'payload',
    'payload_printable',
    'host.name',
    'flow.bytes_toclient',
    'flow.bytes_toserver',
    'flow.pkts_toserver',
    'flow.pkts_toclient',
    'alert.signature',
    'alert.category',
    'category',
    'alert.severity',
    'severity',
    'mitre_techniques',
    'alert.signature_id',
    'src_port',
    'dest_port',
    'alert.rev',
    'translation',
    'src_geoip.geo.country_iso_code',
    'dest_geoip.geo.country_iso_code',
    'dest_geoip.geo.country_name',
    'src_geoip.geo.country_name',
    'alert.metadata',
  ];

  displayedAlertTimeline = [
    'threat',
    'alert.signature',
    'src_ip',
    'dest_ip',
    'proto',
    'app_proto',
    'src_port',
    'dest_port',
    'timestamp',
    'alert.rev',
    'alert.signature_id',
    '_id',
    'translation',
    'severity',
  ];

  displayedZeekSslColumns = [
    'version',
    'cipher',
    'ja3',
    'ja3s',
    'validation_status',
    'orig_alpn',
    'uid',
  ];

  ngOnInit(): void {
    this.details$ = this.allAlert(this.type);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  navigateToDetail(id: string): void {
    if (id && this.type) {
      this.id = id;
      this.allAlert(this.type);
      this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this._router.navigate(['/operator/alerts/detail'], {
          queryParams: {
            id: id,
            type: this.type,
          },
        });
      });
    }
  }

  allAlert(type: string): Observable<AlertDetails | null> {
    return this._alertsService
      .getAlertById(type, { display_col: this.displayedColumns, id: this.id })
      .pipe(
        map(this._detailService.validateResponse),
        switchMap((alertDetails: AlertDetails) => {
          return forkJoin({
            // Récupérer les données Zeek associées à l'alerte
            zeekData: alertDetails.community_id
              ? this._detailService.fetchZeekData(alertDetails.community_id, alertDetails.src_ip)
              : of({} as ZeekConnDetail),

            appProto: alertDetails.community_id
              ? this._detailService.fetchAppProto(alertDetails.community_id, alertDetails.src_ip)
              : of ({} as AppProto),

            // Récupérer les données IA associées à l'alerte
            aiData: alertDetails.community_id
              ? this._detailService.fetchAIData(alertDetails.community_id, alertDetails.src_ip)
              : of({} as AIDetail),

            // Récupérer la timeline des alertes (précédentes et suivantes)
            timeline: this._detailService.fetchAlertTimeline(
              alertDetails.src_ip,
              alertDetails.dest_ip,
              this._commonService.parseDateBack(alertDetails.timestamp),
              this.displayedAlertTimeline
            ),
          }).pipe(
            switchMap(({ zeekData, aiData, timeline, appProto }) => {
              // Préparer les alertes précédentes, suivantes et les données nécessaires pour le compte
              const { previousAlerts, nextAlerts, dataCount } =
                this._detailService.prepareTimelineData(
                  timeline,
                  alertDetails,
                  type
                );

              // Calculer le score de risque
              const severity = this._detailService.getSeverity(alertDetails);
              const deviance = alertDetails.aiData?.deviance ?? 0;
              this.scoreRisk = this._alertsService.calculateRiskScore(
                severity,
                deviance
              );

              if (type !== 'ai' && dataCount.length > 0) {
                return this._alertsService
                  .getAlertCount(dataCount, this.type)
                  .pipe(
                    catchError((err) => {
                      console.error(
                        "Erreur lors de l'appel à getAlertCount :",
                        err
                      );
                      return of([]);
                    }),
                    switchMap((alertCount) => {
                      this._detailService.handleAlertCount(
                        alertCount.data,
                        alertDetails,
                        previousAlerts,
                        nextAlerts,
                      );
                      return this._detailService.processZeekSslData(
                        zeekData,
                        alertDetails,
                        aiData,
                        appProto,
                        previousAlerts,
                        nextAlerts,
                        this.displayedZeekSslColumns
                      );
                    })
                  );
              } else {
                return this._detailService.processZeekSslData(
                  zeekData,
                  alertDetails,
                  aiData,
                  appProto,
                  previousAlerts,
                  nextAlerts,
                  this.displayedZeekSslColumns
                );
              }
            })
          );
        }),
        catchError((err) => {
          this.isError = true;
          this.errorMessage =
            'Erreur lors de la récupération des données d’alert.';
          console.error('Error fetching alert data:', err);
          return of(null);
        })
      );
  }

  openDialog(content: string): void {
    this._dialog.open(TooltipDialogComponent, {
      data: { content: content },
    });
  }

  get scoreClass(): string {
    if (this.scoreRisk !== null && this.scoreRisk <= 35) return 'score-yellow';
    if (this.scoreRisk !== null && this.scoreRisk <= 70) return 'score-orange';
    return 'score-red';
  }
  get metadataSslClass(): string {
    if (this.type === 'ai') {
      return 'column-100';
    }
    return 'column-49';
  }

  protected readonly JSON = JSON;
}
