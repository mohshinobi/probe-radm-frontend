import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AreaSplineChartInterface } from '@core/interfaces';
import { CommonService, TrafficService } from '@core/services';
import { TimeSelectorComponent } from '@shared/components/time-selector/time-selector.component';
import { BytesConvertPipe } from '@shared/pipes/bytes-convert.pipe';
import { LeftDaysPipe } from '@shared/pipes/days-left.pipe';
import {map, switchMap} from 'rxjs';
import { AreaComponent } from '@shared/components/graphs/area/area.component';
import { AreasplineComponent } from '@shared/components/graphs/areaspline/areaspline.component';
import {formatHistoByTime, formatHistoField} from "@core/utils/graph-formater.util";

@Component({
    selector: 'app-traffic-licence',
    imports: [
        AreasplineComponent,
        DatePipe,
        LeftDaysPipe,
        BytesConvertPipe,
        MatCardModule,
        TimeSelectorComponent,
        MatIconModule,
        MatTooltipModule
    ],
    providers: [LeftDaysPipe, BytesConvertPipe],
    templateUrl: './traffic-licence.component.html',
    styleUrl: './traffic-licence.component.scss'
})
export class TrafficLicenceComponent {
  _commonService = inject(CommonService);
  _trafficService = inject(TrafficService);

  title = 'Traffic & Licence Management';

  // Créer les filtres temporels
  timeFilterOptions = [
    { value: 1, label: 'Last hour' },
    { value: 12, label: 'Last 12H' },
    { value: 24, label: 'Last 24H' },
    { value: 'Custom', label: 'Custom' }
  ];

  // Initialiser le filtre temporel à 24 heures
  currentTime = signal(24);
  currentBeginDate = signal(undefined);
  currentEndDate = signal(undefined);

  // Récupérer les valeurs du traffic capturé
  telemetryCaptured = toSignal(
    toObservable(computed(() => ({
      interval: this.currentTime(),
      beginDate: this.currentBeginDate(),
      endDate: this.currentEndDate()
    }))).pipe(
      switchMap(({ interval, beginDate, endDate }) => {
        const begin = beginDate ? this._commonService.convertDateToString(beginDate): undefined;
        const end = endDate ? this._commonService.convertDateToString(endDate): undefined;
        return this._trafficService.getTrafficByPas('packets_captured_since_last', interval, begin, end).pipe(map(data => formatHistoByTime(data, 'packets_captured_since_last')));
      })
    )
  );

   readonly areaGraphOptions =  computed<AreaSplineChartInterface>(() => {
     const traffic = this.telemetryCaptured();
     const trafficData = traffic?.data ?? [];

    const dataSpline: any[] = [
       {
        name: 'Captured Packets',
        type: 'line',
        data: trafficData,
       }
    ];

    return {
      title: undefined,
      data: dataSpline,
      colors: ['#f44949', '#7B5DFF'],
      label: '',
      height: 500,
      backgroundColor: '#1F1F1F',
      formatter: true,
      convertBytes: false
    };
  });

  // Récupérer les informations de la bande passante
  bandwidthInfos = toSignal( this._trafficService.getBandwidth());

  // Récupérer les informations de la licence
  licenceInfo = toSignal(this._trafficService.getLicenceInfo());

  // Récuperer les valeurs du traffic
  traffic = toSignal(
    toObservable(computed(() => ({
      interval: this.currentTime(),
      beginDate: this.currentBeginDate(),
      endDate: this.currentEndDate()
    }))).pipe(
      switchMap(({ interval, beginDate, endDate }) => {
        const begin = beginDate ? this._commonService.convertDateToString(beginDate): undefined;
        const end = endDate ? this._commonService.convertDateToString(endDate): undefined;

        return this._trafficService.getTrafficByPas('bandwidth_bps', interval, begin, end).pipe(map(data => formatHistoByTime(data, 'bandwidth_bps')));
      }))
  );

  // Afficher les valeurs du traffic dans un areasplie graph en rajoutant la valeur de la licence max flow comme étant une seuil
      trafficAreaGraphOptions = computed<AreaSplineChartInterface>(() => {
    const traffic = this.traffic();
    const trafficData = traffic?.data ?? [];

    const licenceTraffic = this.licenceInfo()?.flow_max || 0; // S'assurer que licenceInfo() renvoie une valeur numérique ou 0

    const dataSpline: any[] = [

      {
        name: 'Licence',
        type: 'line',
        data: trafficData.map((item: any) => [item[0], licenceTraffic]), // Créer une ligne avec les mêmes timestamp du traffic avec la valeur du flow max de la licence
      },
       {
        name: 'Bandwidth Per Second',
        type: 'line',
        data: trafficData,
       }
    ];

    return {
      title: undefined,
      data: dataSpline,
      colors: ['#f44949', '#7B5DFF'],
      label: '',
      height: 500,
      backgroundColor: '#1F1F1F',
      formatter: true,
      convertBytes: true
    };
  });

  onTimeChange(value: number | string) {
    if (typeof value === "number") {
      this.currentBeginDate.set(undefined);
      this.currentEndDate.set(undefined);
      this.currentTime.set(value);
    }
  }

  onCustomSelected(event: any) {
    this.currentBeginDate.set(event.beginDate);
    this.currentEndDate.set(event.endDate);
  }
}
