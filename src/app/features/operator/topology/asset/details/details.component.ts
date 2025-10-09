import { HighchartsChartModule } from 'highcharts-angular'; 
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AssetService } from '../asset-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MatCell, MatCellDef, MatColumnDef, MatRow, MatRowDef, MatTable } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import Highcharts, { Point, Series } from 'highcharts';
import { PieComponent } from "../../../../../shared/components/graphs/pie/pie.component";
import { PieChartInterface } from '@core/interfaces';
import { DateAgoPipe } from '@shared/pipes/date-ago.pipe';
import { PageHeaderComponent } from "@layout/header/page-header.component";


@Component({
    selector: 'app-asset-details',
    imports: [CommonModule, MatChipsModule, MatTable,
    MatColumnDef,
    MatCell,
    MatCellDef,
    MatRowDef,
    MatRow,
    DateAgoPipe,
    MatCardModule,
    HighchartsChartModule,
    SkeletonComponent, PieComponent, PageHeaderComponent],
    providers: [DateAgoPipe],
    templateUrl: './details.component.html',
    styleUrl: './details.component.scss'
})
export class DetailsComponent {

  private _assetService   = inject(AssetService);
  private _activatedRoute = inject(ActivatedRoute);
  domSanitizer            = inject(DomSanitizer);


  // get mac from URL
  macAddress = this._activatedRoute.snapshot.queryParams['mac'];

  // Assuming assetDetails is a signal or observable that returns an array of device details
  assetDetails = toSignal(this._assetService.getDeviceDetails(this.macAddress));

  mainInformations = computed(() => {
    const keys: (keyof any)[] = [
      "devName", 
      "devOwner", 
      "devType", 
      "devVendor", 
      "devGroup", 
      "devComments", 
      "devLastIP", 
      "devLocation", 
      "devParentMAC", 
      "devParentPort", 
      "devSite", 
      "devSSID", 
    ]; 
  
    const details = this.assetDetails(); // Access the assetDetails object directly
  
    // Check if details is defined and is an object
    if (!details || typeof details !== 'object') {
      console.warn('Asset details is not an object:', details);
      return {}; // Return an empty object if details is not valid
    }
  
    // Create a new object containing only the keys we are interested in
    const filteredDetails: Partial<any> = {}; // Use Partial to allow for missing keys
    keys.forEach((key:any) => {
      if (key in details) {

        filteredDetails[key] = details[key];
      }
    });
  
    return filteredDetails; // Return the filtered object
  });

  sessionInformations = computed(() => {
    const keys: (keyof any)[] = [
      "devFirstConnection", 
      "devLastConnection",
      "devLastNotification",
      "devParentMAC",
      "devParentPort",
      "devSSID",
      "devSite",
      "devStaticIP",
      "devSourcePlugin"
    ]; 
  
    const details = this.assetDetails(); // Access the assetDetails object directly
  
    // Check if details is defined and is an object
    if (!details || typeof details !== 'object') {
      console.warn('Asset details is not an object:', details);
      return {}; // Return an empty object if details is not valid
    }
  
    // Create a new object containing only the keys we are interested in
    const filteredDetails: Partial<any> = {}; // Use Partial to allow for missing keys
    keys.forEach((key:any) => {
      if (key in details) {
        filteredDetails[key] = details[key];
      }
    });
  
    return filteredDetails; // Return the filtered object
  });

  decodeBase64Icon(encoded: string): string {
    try {
      return atob(encoded);
    } catch (error) {
      console.error("Erreur lors du décodage Base64 :", error);
      return "";
    }
  }

  formatKey(key: string): string {
    // Remove the 'dev' prefix if it exists
    let formattedKey = key.replace('dev', '');
  
    // Add spaces before uppercase letters (except the first letter)
    formattedKey = formattedKey.replace(/([a-z])([A-Z])/g, '$1 $2');
  
    return formattedKey;
  }

 

getTable(data: any): { key: string, value: any }[] {
  return Object.entries(data)
    .filter(([_, value]) => {
      if (value === null || value === undefined || value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === 'object' && Object.keys(value).length === 0) return false;
      return true;
    })
    .map(([key, value]) => ({ key, value }));
}

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

  private _assetsService = inject(AssetService);

  readonly histogramData = toSignal(this._assetsService.getDeviceByDate(this.macAddress));
  ngOnInit(): void {
    this._assetsService.getDeviceByDate(this.macAddress).subscribe((data) => {
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

  readonly pieChartOptions = computed<PieChartInterface>(() => {
    const data = this.histogramData()?.series.map(s => ({
      name: s.name,
      y: s.data.reduce((sum, val) => sum + val, 0)
    }));
    const processedData = data?.reduce<{ name: string; y: number }[]>((acc, { name, y }) => {
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
    

    const total = processedData?.reduce((sum, item:any ) => sum + item.y, 0);

    return {
      data: processedData,
      height: '297px',
      colors: ['#2E8B57', '#F44949'],
      backgroundColor: '#1F1F1F',
      innerSize: '85%',
      subtitle: {
        useHTML: true,
        text: total?.toString(),
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





}
