import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { ColumnChartInterface } from '@core/interfaces';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';

NoDataToDisplay(Highcharts);
@Component({
    selector: 'app-column',
    imports: [
        HighchartsChartModule,
        SkeletonComponent
    ],
    templateUrl: './column.component.html',
    styleUrl: './column.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnComponent {

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions = signal<Highcharts.Options> ({});

  @Input()
  set graphOptions(options: ColumnChartInterface){
    this.loadGraph(options);
  }

  loadGraph(options: ColumnChartInterface ){

    let chartOptions: Highcharts.Options = {
      chart: {
          type: 'column',
          backgroundColor: options.backgroundColor || 'transparent',
        zooming: {
          type: 'x'
        }
      },
      credits:{
        enabled:false,
      },
      title: {
          text: options.title,
          style:{
            color: 'white',
            fontFamily: 'BebasNeue'
          }
      },
      xAxis: {
        categories: options.categories,
        type: 'category',
        labels: {
          style: {
            fontSize: '13px',
            fontFamily: 'BebasNeue',
            color: options.xLabelColor || '#C5C4BE'
          }
        },
        lineColor: options.lineColor || '#C5C4BE',
        tickColor: options.tickColor ||'#C5C4BE',
      },
      yAxis: {
        min: 0,
        title:{
          text:'',
        },
        lineColor: options.lineColor || '#C5C4BE',
        tickColor: options.lineColor || '#C5C4BE',
        labels: {
          style: {
            color: options.labelColor ||'#C5C4BE',
          }
        },
        gridLineColor: options.gridLineColor || '#C5C4BE',
        gridLineDashStyle: options.gridLineDashStyle || 'Dot',
      },
      legend: {
          enabled: false,
      },
      responsive: {
        rules: [{
          condition: {
              maxWidth: 500
          },
          chartOptions: {
              legend: {
                  enabled: false
              }
          }
      }]
      },
      tooltip: {
          pointFormat: options.pointFormat || 'Alerts: <b>{point.y}</b>'
      },
      series: [{
        type: 'column',
        colorByPoint: false,
        color: options.color,
        groupPadding: 0,
        data: options.data,
        dataLabels: {
            enabled: options.dataLabels || false,
            rotation: 0,
            inside: true,
            verticalAlign: 'top',
            format: '{point.y}',
            y: 10,
            style: {
                fontSize: '13px',
                fontFamily: 'BebasNeue'
            },
            color: 'white'
        },
        pointPadding: 0.1,
        borderWidth: 0,
      }],
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
    };

    this.chartOptions.set(chartOptions)
  }
}
