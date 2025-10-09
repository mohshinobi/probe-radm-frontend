import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import {BarChartInterface} from "@core/interfaces/charts/bar-chart.interface";
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';

NoDataToDisplay(Highcharts);

@Component({
    selector: 'app-bar',
    imports: [
        HighchartsChartModule,
        SkeletonComponent
    ],
    templateUrl: './bar.component.html',
    styleUrl: './bar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarComponent {

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions = signal<Highcharts.Options>({});

  @Input()
  set graphOptions(value: BarChartInterface) {
    this.loadGraph(value);
  }

  loadGraph(options: BarChartInterface){
    let chartOptions: Highcharts.Options = {
      chart: {
        type: 'bar',
        backgroundColor: options.backgroundColor || 'transparent',
        height: options.height || '300px'
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
        type: 'category',
        labels: {
          autoRotation: [-45, -90],
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
        enabled: false
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
      plotOptions: {
        bar: {
          borderRadius: options.borderRadius || '0%',
          dataLabels: {
            enabled: true
          },
          groupPadding: 0.1,
          borderColor: 'black'
        }
      },
      tooltip: {
        pointFormat: options.tooltipPointFormat || 'Alerts: <b>{point.y:.1f}</b>'
      },
      series: [{
        type: 'bar',
        name: 'Applications',
        colorByPoint: false,
        color: options.color,
        groupPadding: 0,
        data: options.data,
        dataLabels: {
          enabled: true,
          rotation: 0,
          inside: false,
          format: '{point.y:.1f}',
          y: 0,
          style: {
            fontSize: '12px',
            fontFamily: 'BebasNeue',
            color: 'white'
          }
        }
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
