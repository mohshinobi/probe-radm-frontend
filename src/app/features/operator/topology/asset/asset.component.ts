import { Component, computed, inject, signal , ViewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TableCellTypeEnum } from '@core/enums';
import {  AreaChartInterface, PieChartInterface, TableColumnInterface} from '@core/interfaces';
import { PieComponent } from '@shared/components/graphs/pie/pie.component';
import { ChipFilterDataInterface, TableComponent } from '@shared/components/table/table.component';
import { map, switchMap } from 'rxjs';
import { Point, Series } from 'highcharts';
import { AssetService } from './asset-service';
import { CommonService } from '@core/services';
import { FormGroup } from '@angular/forms';
import { AssetsFormService } from '@core/services/forms/assets-form.service';
import { BaseField } from '@shared/components/form/fields';
import { DetailField } from '@shared/components/table/detail/detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { HighchartsChartModule } from 'highcharts-angular';
import Highcharts from 'highcharts';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import { Base64Pipe } from '@shared/pipes/base64.pipe';
import { PageHeaderComponent } from "@layout/header/page-header.component";

interface Value {
  count: number;
}

// Définition du type pour chaque objet dans le tableau `stats`
interface Stat {
  key: string;
  value: Value;  // Utilisation du type `Value` pour `value`
}
@Component({
    selector: 'app-asset',
    imports: [
    TableComponent,
    MatCardModule,
    MatIconModule,
    PieComponent,
    MatTooltipModule,
    CommonModule,
    HighchartsChartModule,
    SkeletonComponent,
    Base64Pipe,
    PageHeaderComponent
],
    providers: [Base64Pipe],
    templateUrl: './asset.component.html',
    styleUrl: './asset.component.scss'
})
export class AssetComponent {

  lastNewAssets = signal(["Asset 1", "Asset 2", "Asset 3", "Asset 4", "Asset 5"]);

  // Change time interval (custom)
  onCustomSelected(event: any) {
    this.currentBeginDate.set(event.beginDate);
    this.currentEndDate.set(event.endDate);
  }
  length = signal(0);

  title = 'Network / Assets';

  // Injection des services
  private _assetsService = inject(AssetService);
  private _commonService = inject(CommonService);
  private _assetForm = inject(AssetsFormService);

  // Initialisation des variables
  currentTime = signal(24);
  currentBeginDate = signal(undefined);
  currentEndDate = signal(undefined);
  readonly noDataArray = Array(5).fill(0);

  // Initialisation du formulaire
@ViewChild("tableComponent") tableComponent!: TableComponent;

  private activatedRoute = inject(ActivatedRoute);

  constructor(private _router : Router, private route: ActivatedRoute){
    this.fields = this._assetForm.getFormFields();
  }

  readonly lastNew = toSignal(this._assetsService.getLastNew());
  readonly histogramData = toSignal(this._assetsService.getDevicesByDate());
  Highcharts: typeof Highcharts = Highcharts;
  histogram = signal<any>(
    {
      "chart": {
        "type": "column",
        "backgroundColor": "transparent",
        "height": "300px"
      },
      "title": {
        "text": null
      },
      "legend": {
        "layout": "horizontal",
        "itemStyle": {
          "color": "white"
        }
      },
      "xAxis": {
        "categories": [],
        "labels": {
          "style": {
            "color": "white"
          },
          "rotation": -45
        }
      },
      "yAxis": {
        "title": {
          "enabled": false
        },
        "tickColor": "red",
        "labels": {
          "style": {
            "color": "white"
          }
        }
      },
      "plotOptions": {
        "column": {
          "pointPadding": 0.1,
          "borderWidth": 0,
          "groupPadding": 0.1,
          "shadow": false
        }
      },
      "series": [],
      "credits": {
        "enabled": false
      },
      "lang": {
        "noData": "No Data Available"
      },
      "noData": {
        "style": {
          "fontWeight": "bold",
          "fontSize": "15px",
          "color": "white"
        }
      }
    }

  );

  ngOnInit(): void {
    this._assetsService.getDevicesByDate().subscribe((data) => {
      this.histogram.set({
        ...this.histogram(),
        xAxis: {
          ...this.histogram().xAxis,
          categories: data.categories
        },
        series: data.series
      });
    });
  }



  form = signal<FormGroup<any>>(this._assetForm.getFormGroup());
  assetDetails = signal([] as DetailField[]);
  fields!: BaseField<string | number>[];

  // Signaux pour les données
  assetsByStatusData = computed(() => {
    const stats: any[] = this.stats(); // Récupère les stats sous forme de tableau d'objets avec le type Stat 
    // Filtrage et transformation
    return stats.map(stat => ({
      name: stat.key,    // Utilisation de 'key' au lieu de 'name'
      y: stat.value // Accès à 'count' dans 'value'
    }));
  });


  devicesByDays = toSignal(this._assetsService.getDevicesByTime());

  readonly lineGraphOptions = computed<AreaChartInterface>(() => ({
      title: undefined,
      yAxisLabel: 'Assets',
      data: this.devicesByDays(),
      lineColor: '#7B5DFF',
      height: 302,
      backgroundColor:'#1F1F1F',
      labelColor: '#C5C4BE',
      yLabelColor: '#C5C4BE',
      xLabelColor: '#C5C4BE',
      gridLineColor: '#C5C4BE',
      gridLineDashStyle: 'Dot',
      legendLabelColor: '#C5C4BE'
    }))



  // Fonction générique pour configurer un graphique en pie chart
  private createPieChart(
    dataSignal: () => any[] | undefined,
    colors: string[]
  ): PieChartInterface {
    const data = dataSignal() || []; // Default to an empty array if undefined
    const total = data.reduce((sum, item) => sum + (item.y || 0), '');

    return {
      data,
      height: '297px',
      colors,
      label: 'Count',
      backgroundColor: '#1F1F1F',
      innerSize: '85%',
      subtitle: {
        useHTML: true,
        text: `<span title="${total}">${total.length > 10 ? total.slice(0, 10) + '...' : total} Asset</span>`,
        floating: false,
        verticalAlign: 'middle',
        align: 'center',
        x: -115,
        style: {
          color: 'white',
           fontSize: total.toString().length > 8 ? '18px' : total.toString().length > 5 ? '22px' : '28px',
          cursor: 'pointer',
        },
      },
      legendOption: {
        enabled: true,
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
        navigation: {
          activeColor: '#ff886a',
          style: {
            color: 'white',
          },
        },
        itemStyle: {
          color: 'white',
        },
        itemWidth: 200,
        itemMarginBottom: 20,
        padding: 10,
        labelFormatter: function (this: Point | Series): string {
          return 'y' in this && 'name' in this ? `${this.name}: ${this.y}` : '';
        },
      },
      dataLabelsOption: { enabled: false },
    };
  }

  readonly assetByStatus = computed<PieChartInterface>(() => {
    const data = this.assetsByStatusData();
      const processedData = data.reduce<{ name: string; y: number }[]>((acc, { name, y }) => {
        if (name === "Connected") {
          acc.push({ name, y });
        } else if (name === "Down" || name === "Offline") {
          const offlineEntry = acc.find(item => item.name === "Offline");
          if (offlineEntry) {
            offlineEntry.y += y; // Merge 'Down' into 'Offline'
          } else {
            acc.push({ name: "Offline", y });
          }
        }
        return acc;
      }, []); // Explicitly define the accumulator as an array of objects with name:string and y:number


      const total = processedData.reduce((sum, item:any ) => sum + item.y, 0);

      return {
        data: processedData,
        height: '297px',
        colors: ['#2E8B57', '#F44949'],
        backgroundColor: '#1F1F1F',
        innerSize: '85%',
        subtitle: {
          useHTML: true,
          text: total.toString(),
          floating: true,
          verticalAlign: 'middle',
          x: -75,
          y: 25,
          style: {
            color: 'white',
            fontSize: '28px'
          }
        },
        legendOption: {
          enabled: true,
          align: 'right',
          verticalAlign: 'middle',
          layout: 'vertical',
          itemStyle: {
            color: 'white'
          },
          itemMarginBottom: 20,
          padding: 10,
          labelFormatter: function (this: Point | Series): string {
            if ('y' in this && 'name' in this) {
              return `${this.name}: ${this.y}`;
            }
            return '';
          }
        },
        dataLabelsOption: { enabled: false },
      };
    });



  detailsData!: DetailField[];
  srcIpSignal = signal('');
  getDetailsParams = (data: any) => {
    const ip =  data?.devMac;
    if (!ip) {
      console.error('Invalid data format. Missing host.ip:', data);
      return;
    }
    this.srcIpSignal.set(ip);
    this.fetchAndSetDetails(data);
  };

fetchAndSetDetails(data: any): void {
  this._assetsService.getDeviceByMac(this.srcIpSignal()).subscribe(
    (response: any) => {
      const formattedDetails = this.formatDetailsData(response);
      this.assetDetails.set(formattedDetails);
    },
    (error: any) => {
      console.error('Erreur lors de la récupération des détails :', error);
    }
  );
}

  formatDetailsData(response: any): DetailField[] {
    return [
      { key: 'Icon', value: response.devIcon, type: 'text' },
      { key: 'First Connection', value: response.devFirstConnection, type: 'text' },
      { key: 'Group', value: response.devGroup, type: 'text' },
      { key: 'IP Long', value: response.devIpLong, type: 'text' },
      { key: 'Is New', value: response.devIsNew, type: 'text' },
      { key: 'Last Connection', value: response.devLastConnection, type: 'text' },
      { key: 'Last IP', value: response.devLastIP, type: 'text' },
      { key: 'Location', value: response.devLocation, type: 'text' },
      { key: 'Mac', value: response.devMac, type: 'text' },
      { key: 'Name', value: response.devName, type: 'text' },
      { key: 'Owner', value: response.devOwner, type: 'text' },
      { key: 'Present Last Scan', value: response.devPresentLastScan, type: 'text' },
      { key: 'Site', value: response.devSite, type: 'text' },
      { key: 'Status', value: response.devStatus, type: 'text' },
      { key: 'Type', value: response.devType, type: 'text' },
      { key: 'Vendor', value: response.devVendor, type: 'text' },
      { key: 'Row ID', value: response.rowid, type: 'text' },
    ];
  }

   onTimeChange(value: number | string) {
     if (typeof value === 'number') {
      this.currentBeginDate.set(undefined);
      this.currentEndDate.set(undefined);
      this.currentTime.set(value);
    }
  }

    ngAfterViewInit() {
      const querParams = this.activatedRoute.snapshot.queryParams;
      const params : ChipFilterDataInterface[] = [];
      for ( let key in querParams){
        params.push({key:key,value: querParams[key], columnName:'Last IP'} )
      }
      if( params.length > 0 ) {
        this.tableComponent.chipFilterData.set(params);
        this.assetsQueryParamsGraph.update((paramsTable) => ({
          ...paramsTable,
          ...{
            'devLastIP': params[0].value
          },
        }));
      }
    }



  stats = toSignal(
    this._assetsService.getItStats().pipe(
      map(stats => {
        // Vérifie que stats.data existe avant de le parcourir
        if (!stats?.data) return [];
        // Transforme l'objet en tableau { key, value }
        return Object.entries(stats.data).map(([key, value]: [string, any]) => ({
          key,
          value: value?.count ?? 0
        }));
      })
    ),
    { initialValue: [] } // Valeur initiale pour éviter les erreurs avant le chargement
  );


  itStats = toSignal(
    this._assetsService.getItStats().pipe(
      map((stats:any) =>{
        stats = stats?.data;  

        return Object.entries(stats).map((item: any) => { 
          const key : string = item?.[0];
          const value: number = item?.[1]?.count || 0; 
            return   { key, value };
          })
       }
        )
      ),
    {
      initialValue: [
        { key: 'Connected', value: 0 },
        { key: 'Down', value: 0 },
        { key: 'New', value: 0 },
        { key: 'Offline', value: 0 },
        { key: 'Total', value: 0 },
      ] } // Valeur initiale pour éviter les erreurs avant le chargement
    );

    graphDisplayedColumns = [
      'devIcon',
      'devMac',
      'devName',
      'devOwner',
      'devType',
      'devVendor',
      'devLastConnection',
      'devStatus',
      'devLastIP',
      'devIsNew'
    ];

    lengthGraph = signal(0);
    assetsQueryParamsGraph = signal<{page:number, size: number, sortedBy: string, orderBy: string}>({
      page: 1, size: 10, sortedBy: '', orderBy: ''
    });
    // {page:number, limit: number, sortField: string, sortOrder: string}
    assetsGraph = toSignal(
      toObservable(this.assetsQueryParamsGraph).pipe(
        switchMap((params) => {
          return this._assetsService.getDevices(params)
          .pipe(
            map((response: any) => {
              this.lengthGraph.set(response.total);
              return response.data;
            })
          );
        })
      )
    );

    tableActions(tableActions: any) {
      if (tableActions.sortedBy) {
        tableActions.sortedBy = tableActions.sortedBy.replace(/\.keyword$/, '');
      }
      if (tableActions.devLastConnection) {
        // Remplacer le T par un espace
        tableActions.devLastConnection = tableActions.devLastConnection.replace(/T/g, ' ');
      }

      this.assetsQueryParamsGraph.update((params) => ({
        ...params,
        ...tableActions,
      }));
    }

    get graphTableColumns(): TableColumnInterface[] {
      return [
        { name: 'Icon', dataKey: 'devIcon', type: TableCellTypeEnum.ICONB64, hideContextMenu: true },
        { name: 'Status', dataKey: 'devStatus', type: TableCellTypeEnum.ICON, hideContextMenu: true },
        { name: 'Name', dataKey: 'devName', type: TableCellTypeEnum.FLAG, hideContextMenu: true },
        { name: 'Type', dataKey: 'devType', type: TableCellTypeEnum.TEXT, hideContextMenu: true },
        { name: 'Vendor', dataKey: 'devVendor', type: TableCellTypeEnum.TEXT, hideContextMenu: true },
        { name: 'Last Connection', dataKey: 'devLastConnection', type: TableCellTypeEnum.DATE, hideContextMenu: true},
        { name: 'Last IP', dataKey: 'devLastIP', type: TableCellTypeEnum.TEXT, hideContextMenu: true},
        {
          name: 'Actions',
          dataKey: 'actions',
          type: TableCellTypeEnum.ACTIONS,
          isSortable: false,
          actions: [
            {
              name: 'details',
              label: 'View details',
              icon: 'remove_red_eye',
            },
          ],
        },

      ];
    }

    getCellDatas(data: any) {
      switch (data.actionName) {
        case 'details':
          this.redirectToDetails(data);
          break;
        default:
          break;
      }
    }

   redirectToDetails(data: any) {
    const mac = data.devMac;
    const url = this._router.serializeUrl(
      this._router.createUrlTree(['/operator/topology/asset/details'], {
        queryParams: { mac }
      })
    );
    window.open(url, '_blank');
  }

}
