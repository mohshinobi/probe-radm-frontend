import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { HeatChart } from '@core/interfaces';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import { BytesConvertPipe } from '@shared/pipes/bytes-convert.pipe';
import Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import heatmap from 'highcharts/modules/heatmap';

heatmap(Highcharts);

@Component({
    selector: 'app-heat-map',
    imports: [
        HighchartsChartModule,
        SkeletonComponent,
    ],
    templateUrl: './heat-map.component.html',
    styleUrl: './heat-map.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class HeatMapComponent {


  Highcharts: typeof Highcharts = Highcharts;
  chartOptions = signal<Highcharts.Options>({});

  @Input() 
  set graphOptions(options: HeatChart) {
    this.loadGraph(options);
  };

  loadGraph(options: HeatChart){
    let chartOptions: Highcharts.Options = {
      chart: {
        type: 'heatmap',
        backgroundColor: 'transparent',
        height: options.height || '600px',
      },
      legend: {
        align: 'center',
        layout: 'horizontal',
        margin: 10,
        verticalAlign: 'bottom',
        itemStyle: {
          color: '#fff',
        },
      },
      title: {
        text: options.title,
        style: {
          color: 'white',
          fontFamily: 'BebasNeue',
        },
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        categories: options.xAxis,
        reversed: false,
        labels: {
          style: {
            color: '#fff',
          
          },
        },
      },
      yAxis: {
        categories: options.yAxis.reverse(),
        labels: {
          style: {
            color: '#fff',
            whiteSpace: 'nowrap',
          },
        },
        title: {
          text: null,
        },
      },
      tooltip: {
        enabled: false
      },
      colorAxis: {
        stops: options.stops ,
        tickPositions: options.tickPositions,
        labels: {
          style: {
            color: '#fff',
          },
        },
      },
      series: [
        {
          type: 'heatmap',
          borderWidth: 0,
          data: options.data ?? [],
          allowPointSelect: false,
          dataLabels: {
            enabled: true,
            color: 'black',
            style: {
              textOutline: 'none',
            },
            formatter: function () {
              const value = this.point.value;
              if (value === -1) {
                this.point.graphic?.attr({
                  fill: 'rgb(135, 187, 162)',
                });
                this.point.color = 'rgb(135, 187, 162)';
                return 'Pending';
                
              } 
              else if (value === -2 ) { 
                this.point.graphic?.attr({
                  fill: '#e9a5ba',
                });
                this.point.color = '#e9a5ba';
                return '∅';

              } else if (value === -3) {
                this.point.graphic?.attr({
                  fill: '#e9a5ba',
                });
                this.point.color = '#e9a5ba';
                return 'Missed';  
              }
              
               else {
                const numbersPipe = new BytesConvertPipe();  
                if(!options.withPercentage) {
                   return numbersPipe.transform(this.point?.value?.valueOf());                   
                }
                return value+' %';
              }
            },
          },
        },
      ],
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
      plotOptions: {
        series: {
          borderColor: '#000',
          borderWidth: 0.5,
        },
        heatmap: {
          states: {
            hover: {
              enabled: false,
              brightness: 0.1
            }
          }
        }
        
      },
    };
  this.chartOptions.set(chartOptions);
  }
}
