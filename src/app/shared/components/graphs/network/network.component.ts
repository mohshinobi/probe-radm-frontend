import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import Highcharts from 'highcharts';
import HC_networkgraph from 'highcharts/modules/networkgraph';
import { HighchartsChartModule } from 'highcharts-angular';
import { NetworkInterface } from '@core/interfaces';

HC_networkgraph(Highcharts);

@Component({
    selector: 'app-network',
    imports: [HighchartsChartModule],
    templateUrl: './network.component.html',
    styleUrls: ['./network.component.scss']
})
export class NetworkComponent {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions = signal<Highcharts.Options>({});
  @Output() nodeClick = new EventEmitter<string>();
  @Input()
  set graphOptions(options: NetworkInterface) {
    if (options.data!.length >= 1) {
          this.loadGraph(options);
    }
  }
  loadGraph(options: NetworkInterface): void {

    // Define the chart options
    const chartOptions: Highcharts.Options = {
      chart: {
        type: 'networkgraph',
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'Sesame',
        },
        zooming: {
          type: 'xy',
        },
      },
      colors: [options.color],
      title: {
        text: options.title || ' ',
        style: {
          color: 'white',
          fontFamily: 'Sesame',
          fontSize: '24px',
        },
        align: 'center',
      },
      credits: {
        enabled: false,
      },

      plotOptions: {

        networkgraph: {
          // Use bracket notation here
          keys: ['from', 'to'],
          dataLabels: {
            enabled: true,
            style: {
              // fontFamily: 'Sesame',
              fontSize: '0.8rem',
              color: 'white',
              textAlign: 'center',
              textOutline: 'none',
              position: 'middle',
              verticalAlign: 'middle',
              y: 0,
            },
          },
          link: {
            width: 10,
            color: options.linkColor

          },
          layoutAlgorithm: {
            linkLength: options.linkLength || 50,
            enableSimulation: true,
            // friction: -0.9,
          },
          events: {
            click: (event: any) => {
              const selectedItem = event.point.id;
              this.nodeClick.emit(selectedItem); // Emit event with selected node's ID
            },
          },
        },
      },
      series: [
        {
          type: 'networkgraph',
          id: 'lang-tree',
          color: options.color,
          data: options.data || [],
          nodes: options.nodes || [],
        } as Highcharts.SeriesNetworkgraphOptions,
      ],
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
    this.chartOptions.set(chartOptions);  // Update the chart with the new options
  }
  }


