import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
} from '@angular/core';
import Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { StackedColumnInterface } from '@core/interfaces/charts/stacked-column.interface';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';

NoDataToDisplay(Highcharts);

@Component({
    selector: 'app-stacked-bar',
    imports: [HighchartsChartModule, SkeletonComponent],
    templateUrl: './stacked-bar.component.html',
    styleUrl: './stacked-bar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StackedBarComponent {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions = signal<Highcharts.Options>({});
  @Input()
  set graphOptions(options: StackedColumnInterface) {
    this.loadGraph(options);
  }

  private loadGraph(options: StackedColumnInterface) {
    const defaultColors = [
        '#FF975C', '#9242F5', '#FFF73F', '#FF85FA', '#FF3FB2',
        '#FF3E6C', '#85E2FF', '#5960FF', '#77FFD6', '#FF8585',
        '#96FF85', '#858AFF', '#F6C039',
    ];

    const chartOptions: Highcharts.Options = {
        chart: {
            type: 'column',
            backgroundColor: 'transparent',
            width: 280,
            height: 400,
        },
        title: {
            text: options.title,
        },
        xAxis: {
            visible: false,
            tickWidth: 0,
            labels: {
                enabled: true,
            },
            categories: options.categories,
        },
        yAxis: {
            visible: false,
            title: {
                text: '',
            },
        },
        tooltip: {
            distance: 30,
            format: '<b>{series.name}</b>: {point.y}',
        },
        legend: {
            enabled: true,
            align: 'right',
            verticalAlign: 'middle',
            layout: 'vertical',
            itemStyle: {
                color: '#FFFFFF',
                fontWeight: 'bold',
            },
            labelFormatter: function () {
                const series =  {...this} as any;
                return `${series.name}: ${series?.yData[0]}`;
            },
        },
        plotOptions: {
            column: {
                stacking: 'stream',
                pointWidth: 50,
                borderRadius: 10,
                borderColor: 'transparent',
            },
        },
        colors: options.colors ?? defaultColors,
        series: options.data,
        lang: {
            noData: 'No Data Available',
        },
        noData: {
            style: {
                fontWeight: 'bold',
                fontSize: '15px',
                color: 'white',
                textAlign: 'center',
            },
        },
        credits: {
            enabled: false,
        },

    };
    
    this.chartOptions.set(chartOptions);
}
}
