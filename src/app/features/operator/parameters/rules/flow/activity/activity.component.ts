import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { Component, inject ,signal, computed,Input  } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import Highcharts from 'highcharts';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import { HighchartsChartModule } from 'highcharts-angular';
import { MatSliderModule} from '@angular/material/slider';
import { FormsModule} from '@angular/forms';
import { MatInputModule} from '@angular/material/input';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatButtonModule} from '@angular/material/button';
import { MatCardModule} from '@angular/material/card';
import { AlertStats, FileInterface, RuleFlowActivity, RuleTopStats } from '../rule-flow.interface';
import { RuleFlowService } from '../rule-flow.service';
import { RouterLink } from '@angular/router';

NoDataToDisplay(Highcharts);

@Component({
    selector: 'app-rule-flow-activity',
    imports: [MatButtonModule, MatCardModule, CommonModule, HighchartsChartModule, MatSliderModule, FormsModule, MatInputModule, MatFormFieldModule, RouterLink, MatIconModule, MatTooltipModule],
    templateUrl: './activity.component.html',
    styleUrl: './activity.component.scss',
    providers: [RuleFlowService]
})
export class RuleFlowActivityComponent {
  @Input() inputFilesRules :FileInterface[] = [];
  lastHour = signal(1);
  topSize = signal(20);
  textHeader = computed(() => {
    return  this.lastHour() == 1 ? `${this.lastHour()} hour` : `${this.lastHour()} hours`;
  });
  private _service = inject(RuleFlowService);
  toastr = inject(ToastrService);
  Highcharts: typeof Highcharts = Highcharts;
  activitiesLastHour = toSignal( this._service.getRuleFlowActivity(this.lastHour()));
  activitiesLastPrevHour = toSignal( this._service.getRuleFlowActPrevHour(this.lastHour()));
  topAlertsLastHour = toSignal( this._service.getRuleFlowTopAlerts(this.lastHour(), this.topSize() ));
  topAlertsLastTwoHour = toSignal( this._service.getRuleFlowTopAlerts(this.lastHour() + 1, 10000 ));
  dates : any[] = []; // TODO: for futuer uses
  dateData : any[] = []; // TODO: for futuer uses
  sids : any[] = []; // TODO: for futuer uses
  datesids : any[] = []; // TODO: for futuer uses
  dateSidsValues : any[] = []; // TODO: for futuer uses
  alerts : any[] = [];

  readonly currentLastHours = computed<number> (()=> {
    let count: number = 0;
    const activitiesLastHours :RuleFlowActivity[] =  this.activitiesLastHour() ?? [];
    if( activitiesLastHours?.length > 0 ){
      activitiesLastHours.forEach((act:RuleFlowActivity )=> {
        count += act.doc_count;
      });
    }
    return count;
  });

  readonly currentLastPrevHours = computed<number> (()=> {
    let count: number = 0;
    const activitiesLastHours :RuleFlowActivity[] =  this.activitiesLastPrevHour() ?? [];

    if( activitiesLastHours?.length > 0 ){
      activitiesLastHours.forEach((act:RuleFlowActivity )=> {
        count += act.doc_count;
      });
    }
    return count;
  });

  readonly statsTopsAlerts = computed<RuleTopStats> (()=> {
    let topStatsLastHour = this.topAlertsLastHour();
    let topStatsLastTwoHour = this.topAlertsLastTwoHour();
    let previous =  this.currentLastPrevHours()  ?? 0;
    let current =  this.currentLastHours()  ?? 0;
    let ruleSets  :AlertStats[] = [];
    let alertSets :AlertStats[]  = [];

    if( topStatsLastHour ){
      topStatsLastHour.forEach(alert => {
        const rule = {
          sid:  alert.key[0] ?? 0,
          signature:  alert.key[1] ?? null,
          category: alert.key[2] || 'Misc Activity',
          severity: alert.key[3 ?? 0],
          hits: alert.doc_count ?? 0,
        };
        alertSets.push(rule);
      });
    }

    if( topStatsLastTwoHour ){
      topStatsLastTwoHour.forEach(alert => {
        const rule = {
          sid:  alert.key[0] ?? 0,
          signature:  alert.key[1] ?? null,
          category: alert.key[2] || 'Misc Activity',
          severity: alert.key[3 ?? 0],
          hits: alert.doc_count ?? 0,
        };
        ruleSets.push(rule);
      });
    }

    return{previous, current, trend : this.getTrend(previous, current), ruleSets, alertSets }
  })

  /**
   * Calculate the trend from previous and current values
   * @param previous
   * @param current
   * @returns positive or negative value expressed in percent
   */
  getTrend(previous:number, current:number):string{
    if( previous  == current )
      return `+0`;
    let trend: string;
    trend = Math.abs(((current - previous ) / previous ) * 100).toFixed(2);
    return  current < previous  ? `+${trend}` : `-${trend}`;
  }

  readonly chartOptions = computed<any>(()=> {
    const chartData = this.getChartData(this.activitiesLastHour() ?? []) ;

    if( chartData.length  == 0) return  ;

    const options : Highcharts.Options  = {
      chart: {
        type: 'column',
        backgroundColor:  '#1e1e1e',
      },
      title: {
        text: undefined,
        align: 'left',
        style: {
          color: 'white',
          fontFamily: 'BebasNeue',
        }
      },
      legend: {
        layout: 'horizontal',
        itemStyle: {
          color: 'white',
        },
        labelFormatter: function () {
          return `SID: ${this.name}`;
        }
      },
      xAxis: {
        title:{
          text: 'Datetime'
        },
        categories: this.dates,
        labels: {
          style: {
            color: 'white',
          }
        }
      },
      yAxis: {
        title:{
          text: 'Nb Occurrences'
        },
        tickColor: 'red',
        labels: {
          style: {
            color: 'white',
          }
        }
      },
      plotOptions: {
        column: {
          pointPadding: 0,
          borderWidth: 0,
          groupPadding: 0,
          shadow: false
        }
      },
      series: chartData.length > 0 ? chartData : [{ type: 'column', data: [] }],
      credits: {
        enabled: false
      },
      lang: {
        noData: 'No Data Available',
      },
      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
          color: 'white',
        },
      },
    }

    return options;
  });

  getChartData(data:RuleFlowActivity[]){

    let dates : any[] = [];
    let dateData : any[] = [];
    let sids : any[] = [];
    let datesids : any[] = [];
    let dateSidsValues : any[] = [];

    if(data.length == 0)
      return [];

    data.forEach( (item , key) => {
      // Check if the datetime exists or we add it to the array
      if(!dates.includes(item.key_as_string)){
        dates.push(item.key_as_string);
        dateData.push(item.key_as_string);
      }

      // Acces the nested sid objects
      item["alert.signature_id"].buckets.forEach( bucket => {
        if(!datesids[key]){
          datesids[key]= [];
          datesids[key].push(bucket.key);
        }else{
          datesids[key].push(bucket.key);
        }

        // Construct the list of sids
        if(!sids.includes(key)){
          sids.push(bucket.key);
        }

        if(!dateSidsValues[key]){
          dateSidsValues[key]= [];
          dateSidsValues[key].push(bucket.doc_count);
        }else{
          dateSidsValues[key].push(bucket.doc_count);
        }
      })

      dateData[key] = dateSidsValues[key];
    })

    this.dates = dates ;
    this.dateData = dateData ;
    this.sids = sids ;
    this.datesids = datesids ;
    this.dateSidsValues = dateSidsValues;
    let finalData:any = [];
    sids.forEach((sid) => {
      let dataForSid :any[] = [];
      dates.forEach((date, i_date) => {
        const arrayForSid:number[] = datesids[i_date];
        const valueForSid:number[] = dateSidsValues[i_date];
        if(arrayForSid.includes(sid)){
          const indexSidFound =  arrayForSid.indexOf(sid);
          const valueSidFound =  valueForSid[indexSidFound];
          dataForSid.push(valueSidFound);
        }else{
          dataForSid.push(0);
        }
      })
      finalData.push({ name: sid , data:dataForSid});
    });
    return finalData;
  }
}