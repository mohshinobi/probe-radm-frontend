import {ChangeDetectionStrategy, Component, Input, signal} from '@angular/core';
import proj4 from 'proj4';
import HighchartsMap from "highcharts/highmaps";
import worldMap from '@highcharts/map-collection/custom/world.geo.json';
import {HighchartsChartModule} from "highcharts-angular";
import { WorldMapMarkerOptionsInterface } from '@core/interfaces';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';

NoDataToDisplay(HighchartsMap);
@Component({
    selector: 'app-world-map-marker',
    imports: [
        HighchartsChartModule,
        SkeletonComponent
    ],
    templateUrl: './world-map-marker.component.html',
    styleUrl: './world-map-marker.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorldMapMarkerComponent {

  HighchartsMap: typeof HighchartsMap = HighchartsMap;
  chartOptions = signal<HighchartsMap.Options>({});
  display = signal(false);

  @Input()
  set worldMapMarkerOptions(options: WorldMapMarkerOptionsInterface) {
    this.loadGraph(options);
  };

  loadGraph(options: WorldMapMarkerOptionsInterface) {
    let chartOptions: HighchartsMap.Options = {
      chart: {
        map: worldMap as any,
        proj4: proj4,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#A1A1A1',
        height: 680,
        zooming: {
          type: 'xy',
          singleTouch: false,
          key: 'alt'
        }

      },
      colors: ['#F5EA4C'],
      title: {
        text: undefined,
        style: {
          color: 'white',
          fontFamily: 'Sesame'
        },
        align: 'left'
      },
      credits: {
        enabled: false
      },
      tooltip: {
        enabled: true,
        headerFormat: '',
        pointFormat: '<b>{point.name}</b>'
      },
      subtitle: {
        text: ``
      },
      mapNavigation: {
        enabled: false,
        buttonOptions: {
          alignTo: 'spacingBox'
        },
      },
      legend: {
        enabled: false
      },
      colorAxis: {
        min: 0,
        max: 20
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
      series: [
        {
          name: 'test',
          accessibility: {
            exposeAsGroupOnly: true
          },
          borderColor: 'black',
          showInLegend: false,
          states: {
            hover: {
              enabled: false
            }
          },
          allAreas: false,
          data: options.dataMap
        } as HighchartsMap.SeriesMapOptions,
        {
          type: 'mappoint',
          name: 'highlights',
          tooltip: options.tooltip,
          plotOptions: {
            mappoint: {
              cluster: {
                enabled: true,
                allowOverlap: true,
                animation: {
                  duration: 450
                },
                layoutAlgorithm: {
                  type: 'grid',
                  gridSize: 70
                }
              }
            }},
          colorKey: 'red',
          marker: {
            lineWidth: 1,
            lineColor: 'yellow',
            symbol: 'mapmarker',
            radius: 7,
            states: {
              hover: {
                enabled: true,
                lineWidthPlus: 2,
                animation: true,
                animate: {
                  duration: 200,
                  easing: 'easeOutBounce',
                }
              }
            }
          },
          dataLabels: {
            enabled: false
          },
          data: options.data
        } as HighchartsMap.SeriesMappointOptions
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

    this.chartOptions.set(chartOptions);
  }
}
