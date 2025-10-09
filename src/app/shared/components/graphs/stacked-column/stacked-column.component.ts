import {ChangeDetectionStrategy, Component, Input, signal} from '@angular/core';
import Highcharts from 'highcharts';
import {HighchartsChartModule} from "highcharts-angular";
import {StackedColumnInterface} from "@core/interfaces/charts/stacked-column.interface";
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';

NoDataToDisplay(Highcharts);
@Component({
    selector: 'app-stacked-column',
    imports: [
        HighchartsChartModule,
        SkeletonComponent
    ],
    templateUrl: './stacked-column.component.html',
    styleUrl: './stacked-column.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StackedColumnComponent {

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions = signal<Highcharts.Options>({});

  @Input()
  set graphOptions(options: StackedColumnInterface) {
    this.loadGraph(options);
  };

  private loadGraph(options: StackedColumnInterface) {
    let chartOptions: Highcharts.Options = {
      chart: {
        type: 'column',
        backgroundColor:'transparent',

      },
      title: {
        text: options.title,
        style: {
          color: 'white',
          fontFamily: 'BebasNeue'
        }
      },
      legend: {
        enabled:false,
        itemStyle:{
          color:'white'
        },
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: options.categories,
        labels:{
          style:{
            color: 'white'
          }
        }
      },
      yAxis: {
        min: 0,
        title: {
          style:{
            color:'white'
          },
          text: undefined
        },
        stackLabels: {
          enabled: true,
          style:{
            color:'white',
            textOutline: undefined
          }
        },
        labels:{
          style:{
            color: 'white'
          }
        }
      },
      tooltip: {
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: false
          },
          borderColor:'transparent',
          label:{
            style:{
              color:'white'
            }
          }
        }
      },
      series: options.data || [],
      lang: {
        noData: "No Data Available"
      },
      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
          color: 'white'
        }
      }
    }

    this.chartOptions.set(chartOptions)
  }
}
