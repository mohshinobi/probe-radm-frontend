import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { GaugeChartInterface } from '@core/interfaces';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import MoreFunction from 'highcharts/highcharts-more';
import SolidGauge from 'highcharts/modules/solid-gauge';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';

NoDataToDisplay(Highcharts);
MoreFunction(Highcharts);
SolidGauge(Highcharts);

@Component({
    selector: 'app-solidgauge',
    imports: [
        HighchartsChartModule,
        SkeletonComponent,
    ],
    templateUrl: './solidgauge.component.html',
    styleUrl: './solidgauge.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SolidgaugeComponent {

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions = signal<Highcharts.Options>({});


  @Input()
  set graphOptions(options: GaugeChartInterface) {
    this.loadGraph(options);
  };

  loadGraph(options: GaugeChartInterface){

    let chartOptions: Highcharts.Options = {
      chart: {
        type: 'solidgauge',
        backgroundColor: 'transparent',
      },
      title: {
        text: options.showTitle ? options.title : '',
        style:{
          color: 'white',
          fontFamily: 'Sesame'
        }
      },
      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            plotOptions: {
              pie: {
                dataLabels: {
                  enabled: false
                }
              }
            }
          }
        }]
      },
      tooltip: {
        enabled: true,
        formatter: function() {
          return '<b>'+this.point.y + '</b> of <b>'+ (this.series.yAxis.max ?? '') + '</b> '+ this.series.name;
        }
      },
      yAxis: {
        stops: [
          [0.1, options.color]
        ],
        lineWidth: 0,
        minorTickInterval: undefined,
        tickAmount: 2,
        labels: {
          enabled: true,
          distance: -20,
          formatter: function () {
            return `${this.value}`;
          }
        },
        min: 0,
        max: options.total,
        tickPositions: [],
        tickInterval: 10,
        tickWidth: 1,
        tickLength: 10,
        tickColor: '#666',
        tickmarkPlacement: 'between'
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        solidgauge: {
          dataLabels: {
            y: 0,
            borderWidth: 0,
            useHTML: true,
          }
        }
      },
      series: [{
        type: 'solidgauge',
        name: options.label,
        data: [options.data],
        dataLabels: {
          useHTML: true,
          verticalAlign: 'middle',
          align: 'center',
          style: {
            color: options.color,
            fontSize: '28px',
          },
          format: `<div><span style="font-family:sesame;font-size:25px;color:${options.label};">${options.data}</span><span>${options.label}</span></div>`,
          y: 0
        }
      }],
      lang: {
        noData: "No Data Available"
      },
      noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '12px',
          color: 'black'
        }
      }
    };

    this.chartOptions.set(chartOptions);
  }

  genererTableau(valeurEntree: number): number[] {
    const tableau: number[] = [];
    const division = Math.floor(valeurEntree / 10); // Division entière de la valeur d'entrée par 10
    for (let i = 0; i < 10; i++) {
      tableau.push(i * division); // Ajoute des multiples de la division
    }
    return tableau;
  }
}

