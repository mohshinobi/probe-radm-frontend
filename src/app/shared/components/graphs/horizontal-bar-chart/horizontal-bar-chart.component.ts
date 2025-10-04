import { Component, Input, signal } from '@angular/core';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import { HighchartsChartModule } from 'highcharts-angular';
import Highcharts from 'highcharts';
import { HorizontalBarChartInterface } from '@core/interfaces/charts/horizontal-bar-chart.interface';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';

NoDataToDisplay(Highcharts); 

@Component({
    selector: 'app-horizontal-bar-chart',
    imports: [HighchartsChartModule, SkeletonComponent],
    templateUrl: './horizontal-bar-chart.component.html',
    styleUrls: ['./horizontal-bar-chart.component.scss']
})
export class HorizontalBarChartComponent {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions = signal<Highcharts.Options>({
    series: [],
  });
  display = signal(false);

  @Input()
  set graphOptions(value: HorizontalBarChartInterface) {
    this.loadGraph(value);
   
  }

  loadGraph(options: HorizontalBarChartInterface) {

    const seriesValues = options.seriesData.length > 0 ? options.seriesData.map((item) => item.y): [];

    

    let chartOptions: Highcharts.Options = {
      chart: {
        type: 'bar',
        backgroundColor: 'transparent',
        margin: [0, 0, 10, 0],
        height: '100%',
        width: null,
        style: {
          padding: '0',
        },
      },
      title: {
        text: options.title,
      },
      xAxis: {
        max: 2,
        categories: [...options.categories],
        visible: false,
        labels: {
          style: {
            fontSize: '12px',
          },
        },
      },
      yAxis: {
        min: 0,
        visible: false,
        title: {
          text: null,
        },
        labels: {
          enabled: false,
        },
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 600,
            },
            chartOptions: {
              chart: {
                height: 300,
              },
            },
          },
          {
            condition: {
              minWidth: 601,
            },
            chartOptions: {
              chart: {
                height: 600,
              },
            },
          },
        ],
      },

      legend: {
        enabled: true,
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'bottom',
        floating: false,
        itemStyle: {
          color: '#FFFFFF',
          fontSize: '12px',
        },
        symbolRadius: 6,
        labelFormatter: function () {
          const value = seriesValues[this.index];
          return `${this.name}: ${value?.toLocaleString()}`;
        },
      },
      plotOptions: {
        bar: {
          stacking: 'normal',
          borderRadius: 10,
          borderWidth: 0,
          groupPadding: 0,
          pointPadding: 0.1,
          maxPointWidth: 100,
          pointWidth: 50,
          dataLabels: {
            enabled: false,
            style: {
              color: '#FFFFFF',
              fontSize: '15px',
            },
          },
        },
      },
      series: options.seriesData.map((item, index) => ({
        name: item.name,
        type: 'bar',
        data: [item.y],
        color: options.colors[index],
      })) || [] as Highcharts.SeriesOptionsType[],
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
      credits: {
        enabled: false,
      },
    };
    this.chartOptions.set(chartOptions);
  }
}
