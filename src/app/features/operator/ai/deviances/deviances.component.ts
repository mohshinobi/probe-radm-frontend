import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { HeatChart, MapChartInterface, PackedBubbleChartInterface, PieChartInterface } from '@core/interfaces';
import { CommonService, IAService } from '@core/services';
import { combineLatest, map, switchMap } from 'rxjs';
import { PackedBubbleComponent } from '@shared/components/graphs/packed-bubble/packed-bubble.component';
import { MatCardModule } from '@angular/material/card';
import { PieComponent } from '@shared/components/graphs/pie/pie.component';
import { HeatMapComponent } from '@shared/components/graphs/heat-map/heat-map.component';
import { WorldMapComponent } from '@shared/components/graphs/world-map/world-map.component';
import { MatIconModule } from '@angular/material/icon';
import { Point, Series } from 'highcharts';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { TimeSelectorComponent } from '@shared/components/time-selector/time-selector.component';
import {formatBubble, formatPieAndColumn} from "@core/utils/graph-formater.util";

@Component({
    selector: 'app-deviance',
    imports: [
        MatButtonModule,
        MatButtonToggleModule,
        MatTooltipModule,
        MatIconModule,
        PackedBubbleComponent,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        PieComponent,
        CommonModule,
        HeatMapComponent,
        WorldMapComponent,
        FormsModule,
        TimeSelectorComponent,
        CommonModule
    ],
    templateUrl: './deviances.component.html',
    styleUrl: './deviances.component.scss'
})
export class DeviancesComponent {
  // Injection des services
  private _iaService      = inject(IAService);
  private _commonService  = inject(CommonService);

  // Initialisation des variables
  title = 'Network / Deviances'
  selectedValues: number[] = [];
  weekType = signal('last');
  currentMapType = signal('src');
  currentTime= signal(24);
  currentBeginDate = signal(undefined);
  currentEndDate = signal(undefined);
  colorMap = this._commonService.sourceColor;
  selectedRisks = [3,4];
  selectedCategory = 'src_ip';
  readonly sources = [
      {label:'SRC IP',    value:'src_ip.keyword',     checked: true},
      {label:'DEST IP',   value:'dest_ip.keyword',    checked: false},
      {label:'DEST PORT', value:'dest_port',          checked: false},
      {label:'Protocol',  value:'proto.keyword',  checked: false},

  ];
  readonly deviancesTypes = [
      {label:'Critical Deviance', value:4, checked: true},
      {label:'High Deviance',     value:3, checked: false},
      {label:'Medium Deviance',   value:2, checked: false},
      {label:'Low Deviance',      value:1, checked: false}
  ];

  // Signal pour récuperer les données pour le bubble graph par défaut (timeInterval: 24h, champ: src_ip, deviances: 3 et 4)
  devDatasQuery = signal<{source: string|number, deviances: number[], timeInterval: number}>({source: 'src_ip.keyword', deviances: [3,4], timeInterval: 24});

  // Pie chart data
  abnormalTraficReapartion = toSignal(
    toObservable(
      computed(() => ({
        interval: this.currentTime(),
        beginDate: this.currentBeginDate(),
        endDate: this.currentEndDate()
      }))
    ).pipe(
      switchMap(({interval, beginDate, endDate}) => {
        const begin = beginDate ? this._commonService.convertDateToString(beginDate) : undefined;
        const end = endDate ? this._commonService.convertDateToString(endDate) : undefined;

        return this._iaService.getPieChart(interval, begin, end).pipe(
          map(data => formatPieAndColumn(data))
        );
      })
    )
  );

  // Pie chart Options
  readonly alertsBySevPie = computed<PieChartInterface>(() => {
    const data = this.abnormalTraficReapartion();
    data?.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    const total = data && data.length > 0 ? data.reduce((sum, item) => sum + (item.y || 0), 0).toString() : '';

    return {
      data: data,
      height: '400px',
      colors: ['#FFC080', '#F89200', '#FF6633', '#F44949'],
      label: 'Deviances',
      backgroundColor: '#1F1F1F',
      innerSize: '85%',
      subtitle: {
        useHTML: true,
        text: `<span title="${total}">${total.length > 10 ? total.slice(0, 10) + '...' : total}</span>`,
        align: 'center',
        verticalAlign: 'middle',
        y: -35,
        style: {
          color: 'white',
          fontSize: total.toString().length > 8 ? '18px' : total.toString().length > 5 ? '22px' : '28px',
          cursor: 'pointer',
        }
      },
      legendOption: {
        enabled: true,
        itemStyle: {
          color: 'white'
        },
        itemMarginBottom: 10,
        padding: 5,
        labelFormatter: function (this: Point | Series): string {
            if ('y' in this && this.y !== undefined && 'name' in this && 'series' in this) {
              let riskLevel = '';
              const total = this.series.data.reduce((sum, point) => {
                return sum + (point.y !== undefined ? point.y : 0);
              }, 0);
              const percentage = total > 0 && this.y !== undefined ? ((this.y / total) * 100).toFixed(2) : '0.00';
              switch (this.name.toString()) {
                case '1':
                  riskLevel = 'Low deviance';
                  break;
                case '2':
                  riskLevel = 'Medium deviance';
                  break;
                case '3':
                  riskLevel = 'High deviance';
                  break;
                case '4':
                  riskLevel = 'Critical deviance';
                  break;
                default:
                  riskLevel = this.name;
              }
              return `${riskLevel} : ${this.y} (${percentage}%)`;
            }
            return '';
          }
      },
      dataLabelsOption: { enabled: false,

        }
    };
});

  // fonction pour formatter la valeur de selectedCategory
  formattedCategory(): string {
    return this.selectedCategory.replace(/_/g, ' ');
  }

  // Fonction qui retourne la label de deviances (Critical, High, Medium, Low)
  getDeviancesLabel(dev: any[]) {
    return this.deviancesTypes
    .filter(type => dev.includes(type.value))
    .map(type => type.label)
    .join(' - ');
  }

  // Fonction qui gère le change de la valeur des risques dans le bubble chart (Critical, High, Medium, Low)
  onBtnChange(event: any){
      let deviances = event.value;
      this.selectedRisks = deviances;
      this.devDatasQuery.update(()=>({...this.devDatasQuery(), deviances: deviances as number[]}));
  }

  // Fonction qui gère le change de la valeur de la données à afficher dans le bubble chart (Src IP, Dest IP , Dest Port ou Protocol)
  onSelectChange(event: any) {
    let type = event.target.value;
    this.selectedCategory = type;
    // Ajout .keyword si la valeur de type n'est pas 'dest_port' (car dest_port est un nombre)
      if(type != 'dest_port') {
        type+='.keyword';
      }
      this.devDatasQuery.update(()=>({...this.devDatasQuery(), source: type}));
  }

  // Fonction qui gère le changement du type de semaine (Actuelle, Passée)
  onHeatClick(value: string) {
      this.weekType.set(value);
  }

  // Fonction qui gère le changement du type de carte (Source, Destination)
  onMapChange(value: string) {
      this.currentMapType.set(value);
      switch(value) {
        case 'src': this.colorMap = this._commonService.sourceColor ; break;
        case 'dest': this.colorMap = this._commonService.destinationColor; break;
      }
  }

  //Option du bloc time filter
  timeFilterOptions = [
    { value: 1, label: 'Last hour' },
    { value: 12, label: 'Last 12H' },
    { value: 24, label: 'Last 24H' },
    { value: 'Custom', label: 'Custom' }
  ];
  left = '85%'

  // Fonction qui gère le changement du temps (Last 1h, 12h, 24h)
  onTimeChange(value: number | string) {
    if (typeof value === "number") {
      this.left = '85%';
      this.currentBeginDate.set(undefined);
      this.currentEndDate.set(undefined);
      this.currentTime.set(value);
    }
    this.currentMapType.set(this.currentMapType());
  }

  // Fonction qui gère le changement des dates de debut et de fin (Custom)
  onCustomSelected(event: any) {
    this.currentBeginDate.set(event.beginDate);
    this.currentEndDate.set(event.endDate);
    this.left = '63%';
  }

  /* combiner plusieurs observables (devDatasQuery, time interval, dates de début et de fin)
    pour émettre les dernières valeurs disponibles. À chaque fois qu'une nouvelle valeur est émise,
    la fonction switchMap se désabonne de l'observable précédent et effectue un nouvel appel
    à un service (_iaService) en fonction des valeurs reçues. Si des dates de début et de fin
    sont spécifiées, il les convertit en chaînes de caractères et les utilise pour filtrer les résultats.
    Sinon, il utilise les valeurs par défaut. Les réponses sont ensuite formatées en objets contenant
    les données pour une utilisation ultérieure. Enfin, le tout est convertit en un signal. */

  deviances = toSignal(
    combineLatest(
      [
        toObservable(this.devDatasQuery),
        toObservable(this.currentTime),
        toObservable(this.currentBeginDate),
        toObservable(this.currentEndDate)

      ]
    ).pipe(
      switchMap(([query, interval, beginDate, endDate]) => {
        const begin = beginDate ? this._commonService.convertDateToString(beginDate): undefined;
        const end = endDate ? this._commonService.convertDateToString(endDate): undefined;

        return this._iaService.getDevBySevBySrc(query, interval, begin, end)
          .pipe(map(response => ({data: formatBubble(response), label: this.devDatasQuery().source})))
      })
    ), {initialValue: {} as any}
  );

  // Bubble chart
  readonly deviancesBubbleGraphOptions  = computed(()=> {
      let deviances = this.deviances();
      if(!deviances?.data || deviances?.data.length === 0) {
          return {} as PackedBubbleChartInterface;
      }
      let source = this.sources.find(item => item.value === deviances?.label);
      let labelsFilterValue = deviances?.data[0].value * 0.10;
      return {
          title: ``,
          seriesName: source?.label,
          height: '400px',
          width: 1024,
          data: deviances.data,
          labelsFilterValue: labelsFilterValue,
      } as PackedBubbleChartInterface
  });

  // Map
  alertsSource= toSignal(toObservable(computed(() => ({
      mapType: this.currentMapType(),
      interval: this.currentTime(),
      beginDate: this.currentBeginDate(),
      endDate: this.currentEndDate()
    }))).pipe(
      switchMap(({ mapType, interval, beginDate , endDate }) => {
        if(beginDate && endDate) {
          const begin = this._commonService.convertDateToString(beginDate);
          const end = this._commonService.convertDateToString(endDate);
          return this._iaService.getWorldMapSourceDataNew(mapType, interval, begin, end);
        }
        else {
          return this._iaService.getWorldMapSourceDataNew(mapType, interval);
        }
      })
  ));

  //Map graph
  readonly alertsSourceMapChartOptions = computed<MapChartInterface>(() => {
    return {
      title: '',
      color: this.colorMap,
      hoverColor: '#000',
      label: 'alerts',
      data: this.alertsSource(),
      height: '400px',
      backgroundColor: 'transparent',
    };
  });

  // HEATMAP
  heatMapCurrent  = toSignal(this._iaService.getHeatMapCurrentWeekData(),{initialValue:[]});
  heatMapLast     = toSignal(this._iaService.getHeatMapLastWeekData(), {initialValue: []});

  HeatAlerts:Signal<any> = toSignal(toObservable(this.weekType).pipe(
    switchMap(() => {
      return this._iaService.getHeatMapDataNew(this.weekType());
    })
  ));

  // Fonction qui retourne le début de la fin de la semaine actuelle
  readonly heatMapCurrentDates = computed(()=> {
      let data = this.heatMapCurrent();
      if(!data || data.length === 0) {
          return [
              this._commonService.convertDateToString(new Date()),
              this._commonService.convertDateToString(new Date(new Date().setDate(new Date().getDate() + 7)))
          ];
      }
      return [data.start_date, data.end_date ]
  })

  // Fonction qui retourne le début de la semaine passée
  readonly heatMapLastDates  = computed(()=> {
      let data = this.heatMapLast();

      if(!data || data.length === 0) {
          return [
              this._commonService.convertDateToString(new Date(new Date().setDate(new Date().getDate() - 7))),
              this._commonService.convertDateToString(new Date())
          ];
      }

      return [data.start_date, data.end_date ]
  });

  readonly heatMapData = computed(() => {
    let data = this.HeatAlerts();
    if(data?.data.length == 0) {
      return []
    }
    return data?.data[0].data.nested_value;
  });

  // Heatmap options
  readonly heatchartOptions = computed<HeatChart>(()=> ({
      title: '',
      data:  this.heatMapData() || [
        [0,0,-2], [0,1,-2], [0,2,-2], [0,3,-2], [0,4,-2], [0,5,-2], [0,6,-2],
        [1,0,-2], [1,1,-2], [1,2,-2], [1,3,-2], [1,4,-2], [1,5,-2], [1,6,-2],
        [2,0,-2], [2,1,-2], [2,2,-2], [2,3,-2], [2,4,-2], [2,5,-2], [2,6,-2],
        [3,0,-2], [3,1,-2], [3,2,-2], [3,3,-2], [3,4,-2], [3,5,-2], [3,6,-2],
        [4,0,-2], [4,1,-2], [4,2,-2], [4,3,-2], [4,4,-2], [4,5,-2], [4,6,-2],
        [5,0,-2], [5,1,-2], [5,2,-2], [5,3,-2], [5,4,-2], [5,5,-2], [5,6,-2],
        [6,0,-2], [6,1,-2], [6,2,-2], [6,3,-2], [6,4,-2], [6,5,-2], [6,6,-2],
        [7,0,-2], [7,1,-2], [7,2,-2], [7,3,-2], [7,4,-2], [7,5,-2], [7,6,-2],
        [8,0,-2], [8,1,-2], [8,2,-2], [8,3,-2], [8,4,-2], [8,5,-2], [8,6,-2],
        [9,0,-2], [9,1,-2], [9,2,-2], [9,3,-2], [9,4,-2], [9,5,-2], [9,6,-2],
        [10,0,-2], [10,1,-2], [10,2,-2], [10,3,-2], [10,4,-2], [10,5,-2], [10,6,-2],
        [11,0,-2], [11,1,-2], [11,2,-2], [11,3,-2], [11,4,-2], [11,5,-2], [11,6,-2],
      ],
      yAxis: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      xAxis: ['00h-02h', '02h-04h', '04h-06h', '06h-08h', '08h-10h', '10h-12h', '12h-14h', '14h-16h', '16h-18h', '18h-20h', '20h-22h', '22h-00h'],
      stops:  [
      [0, '#A7001E'],
      [20/300, '#A7001E'],
      [80/300, '#FFDB00'],
      [100/300, '#059212'],
      [120/300, '#FFDB00'],
      [200/300, '#A7001E'],
      [1, '#A7001E']
      ],
      height: '400px',
      withPercentage: true,
      tickPositions: [0, 100, 200, 300]
  }));

}

