import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';
import proj4 from 'proj4';
import HighchartsMap from "highcharts/highmaps";
import worldMap from '@highcharts/map-collection/custom/world.geo.json';
import { MapChartInterface } from '@core/interfaces';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';

NoDataToDisplay(HighchartsMap);
@Component({
    selector: 'app-world-map',
    imports: [
        HighchartsChartModule,
        SkeletonComponent
    ],
    templateUrl: './world-map.component.html',
    styleUrl: './world-map.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorldMapComponent {

  HighchartsMap: typeof HighchartsMap = HighchartsMap;
  chartOptions  = signal<HighchartsMap.Options>({});
  display       = signal(false);

  @Input()
  set graphOptions(options: MapChartInterface) {
    if(options.data) {
      this.loadGraph(options);
      this.display.set(true);
    }

  };

  loadGraph(options: MapChartInterface){
    const getColorBasedOnData = (data: Array<any>): string => {
      // Check if any data point is greater than 0
      const hasPositiveData = data.some(point => point[1] > 0);
      // If all data points are zero, return a color indicating no data
      return hasPositiveData ? options.color : '#fff'; // Default to white if no positive data
    };
    let color = "#fff";
    // Get the color based on the provided data
    if(options.data) {
      color = getColorBasedOnData(options.data);
    }
    let chartOptions: HighchartsMap.Options = {
      chart: {
        map: worldMap as any,
        proj4: proj4,
        backgroundColor: options.backgroundColor || 'transparent',
        height: options.height ||'650',
        zooming: {
          type: 'xy',
          key: 'alt'
        }
      },
      title: {
        text: options.title,
        style: {
          color: 'white'
        }
      },
      credits: {
        enabled: false
      },
      subtitle: {
        text: ``
      },
      mapNavigation: {
        enabled: false,
        buttonOptions: {
          alignTo: 'spacingBox'
        }
      },
      tooltip: {
        headerFormat: '',
        pointFormat: options.tooltipPointFormat || '<b>{point.name}</b><br>Requests: {point.value}'
      },
      legend: {
        enabled: false

      },
      colorAxis: options.colorAxisOption ||{
        stops: [
          [0, '#fff'],
          [0.001, color]
        ],
        labels: {
          format: "{value}%"
        }
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
      series: [{
        name: options.label,
        accessibility: {
          exposeAsGroupOnly: true
        },
        borderColor: '#27293d', // change line color to white
        showInLegend: false,
        states: {
          hover: {
            color: options.hoverColor
          }
        },
        allAreas: false,
        data: options.data
      } as HighchartsMap.SeriesMapOptions],
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

    this.chartOptions.set(chartOptions);
  }
}
