import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { PackedBubbleChartInterface } from '@core/interfaces';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';

import MoreFunction from 'highcharts/highcharts-more';

NoDataToDisplay(Highcharts);
MoreFunction(Highcharts);
@Component({
    selector: 'app-packed-bubble',
    imports: [
        HighchartsChartModule,
        SkeletonComponent,
    ],
    templateUrl: './packed-bubble.component.html',
    styleUrl: './packed-bubble.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackedBubbleComponent {

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions = signal<Highcharts.Options> ({});

  @Input()
  set graphOptions(options: PackedBubbleChartInterface){    
    
    this.loadGraph(options);
  }

  loadGraph(options: PackedBubbleChartInterface){

    let chartOptions : Highcharts.Options = {
      credits: {
          enabled: false
      },
      legend:{
          enabled: false,
          itemStyle: {
              color: 'white',
          }
      },
      chart: {
          type: 'packedbubble',
          height: options.height || '50%',
          width: options.width || 800,
          backgroundColor: 'transparent',
          margin: 0,
          style : {
              width: 400,
              padding: '0px',
          },
   
      },
      title: {
          text: options.title || '',
          align: 'center',
          style: {
              color: 'white',
              padding: '0px'
          }
      },
      tooltip: {
          useHTML: true,
          pointFormat: '<b>{point.name}:</b> {point.y}</sub>'
      },
      plotOptions: {
          packedbubble: {
              minSize: '10%',
              maxSize: '250px',
              layoutAlgorithm: {
                gravitationalConstant: 0.0001,
                parentNodeLimit: true,
                seriesInteraction: false,
                dragBetweenSeries: false
              },
              dataLabels: {
                  enabled: true,
                  format: '{point.name}',
                  filter: {
                      property: 'value',
                      operator: '>=',
                      value: options.labelsFilterValue || 100
                  },
                  style: {
                      color: 'white',
                      textOutline: 'none',
                      fontWeight: 'bold',
                      fontSize: '12px'
                  }
              } 
          } 
      },
      series: [{
          type: 'packedbubble',
          name: options.seriesName || '',
           color: '#1e90ff',
          data: options.data || []
      }],
      lang: {
        noData: "No Data Available"
      },
      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
          color: 'white'

        },
        position: {
          align: 'center',
          verticalAlign: 'middle',
          y: 0
        }
      }
  };

    this.chartOptions.set(chartOptions)
  }
}
