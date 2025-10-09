import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';
import Highcharts from 'highcharts';
import HC_sankey from 'highcharts/modules/sankey';
import { SankeyChartInterface } from '@core/interfaces';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';

NoDataToDisplay(Highcharts);
HC_sankey(Highcharts);

@Component({
    selector: 'app-sankey',
    imports: [
        HighchartsChartModule,
        SkeletonComponent
    ],
    templateUrl: './sankey.component.html',
    styleUrl: './sankey.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SankeyComponent {

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions = signal<Highcharts.Options>({});

  @Input()
  set graphOptions(options: SankeyChartInterface) {
    this.loadGraph(options);
  }

  loadGraph(options: SankeyChartInterface){
    let sankey: Highcharts.Options = {
      title: {
        text: options.title,
        style: {
          color: 'white',
          fontFamily: 'BebasNeue',
        },
      },
      chart: {
        type: 'sankey',
        backgroundColor:  options.backgroundColor || 'transparent',
        height: options.height || '300px'
      },
      credits: {
        enabled: false,
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 500,
            },
          },
        ],
      },
      series: [
        {
          keys: ['from', 'to', 'weight'],
          data: options.data,
          type: 'sankey',
          name: options.label,
          colors: options.colors,
          nodePadding: 20,
          dataLabels: {
            enabled: true,
            allowOverlap: true,
            style: {
              color:"#FFFFFF",
            },
            padding: -10,
          },
          minLinkWidth: 1
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

    this.chartOptions.set(sankey);
  }
}
