import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, signal } from '@angular/core';
import Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { AreaChartInterface } from '@core/interfaces';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import { BytesConvertPipe } from '@shared/pipes/bytes-convert.pipe';


NoDataToDisplay(Highcharts);
@Component({
    selector: 'app-area',
    imports: [HighchartsChartModule, SkeletonComponent],
    templateUrl: './area.component.html',
    styleUrl: './area.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AreaComponent {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions = signal<Highcharts.Options>({});

  constructor(private cdr: ChangeDetectorRef) {}

  @Input()
  set graphOptions(value: AreaChartInterface) {
    this.loadGraph(value);
    this.cdr.detectChanges();
  }

  loadGraph(options: AreaChartInterface) {
    let chartOptions: Highcharts.Options = {
      time: {
        useUTC: false,
      },
      title: {
        text: options.showTitle ? options.title : '',
        style: {
          color: 'white',
          fontFamily: 'BebasNeue',
        },
      },
      chart: {
        zooming: {
          type: 'x',
        },
        height: options.height || 300,
        panKey: 'shift',
        type: 'area',
        backgroundColor:  'transparent',
        reflow: true,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      xAxis: {
        lineColor: options.xLabelColor || '#FFFFFF',
        tickColor: options.lineColor,
        labels: {
          style: {
            color: options.xLabelColor || '#FFFFFF',
          },
        },
        title:{
          text: options.xLabelTitle ||''
        },
        type: 'datetime',

      },
      yAxis: {
        plotLines: options.plotLines || undefined,
        lineColor: options.yLabelColor || '#FFFFFF',
        tickColor: options.lineColor,
        max: options.max || undefined,
        labels: {
          style: {
            color: options.yLabelColor || '#FFFFFF',
          },
        },
        title: {
          text: options.yLabelTitle ||'',
        },
        gridLineColor: options.gridLineColor || '#FFFFFF',
        gridLineDashStyle: options.gridLineDashStyle ||'Dot',
      },
      tooltip: options.tooltip || {
        formatter: function() {
          let tooltipHeader = '';

          if (this.x !== undefined) {
                    const date = new Date(this.x);
                    tooltipHeader = '<h1>' + date.toUTCString() + '</h1><br/><br/>';
                  }

              if (options.yAxisLabel === 'Bytes') {
                const bytes = this.y || 0;
                const frm = new BytesConvertPipe();
                const formattedValue = frm.transform(bytes);
                return `${tooltipHeader} ${this.series.name}: ${formattedValue}`;
              } else {
                return `${tooltipHeader} <b>${this.series.name}: ${this.y}</b>`;
              }
        }
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 500,
            },
            chartOptions: {
              legend: {
                enabled: false,
              },
            },
          },
        ],
      },
      plotOptions: {
        series: {
          dataGrouping: {
            enabled: false
          },

          marker: {
            enabled: true,
          },
          point: {
            events: {
              // Ajoute un événement de survol sur chaque point
              mouseOver: function () {
                this.series.chart.tooltip.refresh(this); // Affiche l'infobulle pour ce point
              },
            },
          },
          states: {
            hover: {
              enabled: true, // Active l'état hover
              lineWidth: 2, // Ajuste la largeur de la ligne au survol
            },
          },
        },
        area: {
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 0,
            },
            stops: [[0, options.lineColor]],
          },
        },
      },
      series: [
        {
          data: options.data,
          type: 'spline',
          color: options.lineColor,
          name: options.yAxisLabel,
          marker: {
            enabled: true,
            states: {
              hover: {
                enabled: true,
                fillColor: 'red',
              },
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
    };

    this.chartOptions.set(chartOptions);
  }
}
