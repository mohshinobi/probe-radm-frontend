import {ChangeDetectionStrategy, Component, computed, inject, Input, signal} from '@angular/core';
import {HighchartsChartModule} from 'highcharts-angular';
import Highcharts, {SeriesOptionsType} from 'highcharts';
import {AreaSplineChartInterface} from '@core/interfaces';
import {SkeletonComponent} from '@shared/components/skeleton/skeleton.component';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import {CommonService} from '@core/services';
import {BytesConvertPipe} from '@shared/pipes/bytes-convert.pipe';

NoDataToDisplay(Highcharts);

@Component({
    selector: 'app-areaspline',
    imports: [HighchartsChartModule, SkeletonComponent],
    templateUrl: './areaspline.component.html',
    styleUrls: ['./areaspline.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AreasplineComponent {

  private _commonService = inject(CommonService);

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions = signal<Highcharts.Options>({});

  @Input()
  set graphOptions(value: AreaSplineChartInterface) {
    this.loadGraph(value);
  }
  @Input() forceShow = false;
  @Input() disableNoData = false;
  isDataAvailable = computed(() => {
    const series = this.chartOptions().series;
    return series && series.length > 0 && series.some(s => {
      const seriesData = (s as any).data;
      return seriesData && seriesData.length > 0;
    });
  });
  loadGraph(options: AreaSplineChartInterface) {

    let chartOptions: Highcharts.Options = {
      chart: {
        renderTo: options.name,
        type: 'areaspline',
        backgroundColor: options.backgroundColor || 'transparent',
        height: options.height || 300,
        reflow: true,
        zooming: {
          type: 'x',
        },
        panKey: 'shift'
      },
      colors: options.colors,
      title: {
        text: options.title,
        align: 'center',
        style: {
          color: 'white',
          fontFamily: 'Sesame',
        },
      },
      credits: {
        enabled: false,
      },
      xAxis: options.xAxis || {
        reversed: false,
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%e. %b',
          month: "%b '%y",
          year: '%Y',
        },
        title: {
          text: null,
        },
        labels: {
          style: {
            color: options.labelColor || '#FFFFFF',
          },
        },
      },
      yAxis: {
        labels: {
          style: {
            color: options.yLabelColor || '#FFFFFF',
          },
        },
        title: {
          text: null,
        },
        gridLineColor: options.gridLineColor || '#FFFFFF',
        gridLineDashStyle: options.gridLineDashStyle || 'Dot',
      },
      tooltip: {
        shared: true,
        headerFormat:
          '<span style="font-size:12px"><b>{point.key:%Y-%m-%d %H:%M}</b></span><br>',
        formatter: function () {
          var points = this.points;
          var tooltipHeader = '';

          // Formattage de la date/heure (à adapter selon le format voulu)
          if (this.x !== undefined) {
            const date = new Date(this.x);
            tooltipHeader = '<h1>' + date.toUTCString() + '</h1><br/><br/>';
          }

          if (options.formatter) {
            return (
              tooltipHeader +
              points
                ?.map(function (point) {
                  if (options.convertBytes) {
                    return (
                      point.series.name +
                      ': <b>' +
                      new BytesConvertPipe().transform(point.y ?? 0) +
                      '</b> ' +
                      options.label +
                      '<br/>'
                    );
                  }
                  return (
                    point.series.name +
                    ': <b>' +
                    point.y +
                    '</b> ' +
                    options.label +
                    '<br/>'
                  );
                })
                .join('')
            );
          }

          const total = points?.reduce((acc, point) => acc + (point.y ?? 0), 0);
          return (
            tooltipHeader +
            points
              ?.map(function (point) {
                return (
                  '<span style="color:' +
                  point.series.color +
                  '">' +
                  point.series.name +
                  '</span>: <b>' +
                  (point.y !== null && point.y !== undefined ? point.y : 0) +
                  ' (' +
                  (point.y !== null && point.y !== undefined && total !== undefined && total !== 0
                    ? ((point.y / total) * 100).toFixed(2)
                    : 0) +
                  '%) </b> ' +
                  options.label +
                  '<br/>'
                );
              })
              .join('')
          );
        },
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        style: {
          color: '#fff',
        },
        nullFormat: 'No value',
      },
      plotOptions: {
        line: {
          connectNulls: true,
        },
        series: {
          marker: {
            enabled: false,
          },
        },
      },
      legend: {
        enabled: options.showLegend ?? true,
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        symbolRadius: 6,
        symbolHeight: 12,
        symbolWidth: 12,
        itemStyle: {
          color: 'white',
          fontSize: '14px',
        },
      },
      series: this.generateSeries(options.data, options.colors),
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

    if (this.disableNoData) {
      chartOptions.lang = { noData: '' };
      chartOptions.noData = {
        style: {
          color: 'transparent',
          fontSize: '0px',
          fontWeight: 'normal'
        }
      };
    }
    this.chartOptions.set(chartOptions);
  }

    // Fonction pour obtenir tous les timestamps uniques
getUniqueTimestamps = (data: any[]): number[] => {
  const timestampsSet = new Set<number>();
  data.forEach(series => {
      series.data.forEach((point:any) => {
          timestampsSet.add(point[0]);
      });
  });
  return Array.from(timestampsSet).sort((a, b) => a - b);
};

// Fonction pour harmoniser les données
 harmonizeData = (data: any[]): any[] => {
  const uniqueTimestamps = this.getUniqueTimestamps(data);

  return data.map(series => {
      const seriesDataMap = new Map<number, number>(series.data);
      const newData: any[] = uniqueTimestamps.map((timestamp:any) => {
          return [timestamp, seriesDataMap.get(timestamp) ?? 0]; // Utiliser 0 si pas de valeur
      });
      return { ...series, data: newData };
  });
};

generateSeries(data?: any[], colors?: string[]): SeriesOptionsType[] {
    if (!data || data.length === 0) {
      return []
    }
    data = this.harmonizeData(data);
    return data.map((item: any, index: number) => ({
      type: 'spline',
      name: item.name,
      data: item.data?.length ? item.data : [null],
      connectNulls: true,
      id: `${index}`,
      color: colors?.[index],
      fillColor: {
        linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
        stops: [
          [0, this._commonService.hexToRgba(colors?.[index] ?? '', 0.2)],
          [1, this._commonService.hexToRgba(colors?.[index] ?? '', 0)]
        ]
      }
    }));
  }
}
