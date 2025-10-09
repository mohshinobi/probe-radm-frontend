import { LegendOptions } from 'highcharts';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { PieChartInterface } from '@core/interfaces';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';

NoDataToDisplay(Highcharts);

@Component({
    selector: 'app-pie',
    imports: [
        HighchartsChartModule,
        SkeletonComponent
    ],
    templateUrl: './pie.component.html',
    styleUrls: ['./pie.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieComponent {

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions = signal<Highcharts.Options>({});

  @Input()
  set graphOptions(options: PieChartInterface) {
    this.loadGraph(options);
  }

  private loadGraph(options: PieChartInterface): void {

    // Calculer la somme des valeurs
    let total = options.data && options.data.length > 0
      ? options.data.reduce((sum, item) => sum + (item.y || 0), 0)
      : '';

    let legendOptions = options.legendOption || {
      enabled: false
    }

    let dataLabelsOptions = options.dataLabelsOption || {
      enabled: false
    }

    if(options.dataLabelsOption?.enabled){


    }
    if (legendOptions.enabled) {
      legendOptions.events = {
        // Fonction qui gère le click sur les légendes
        itemClick: function (e: any) {
          // Attendre 10ms avant de mettre à jour le total du graph pour afficher le nouveau total (Pour eviter de cloner le graph et faire passer l'animation)
          setTimeout(() => {
            // Récupérer les items visibles (Les légendes selectionnées)
            const items = e.target.allItems.filter((item: any) => item.visible);
            // Mettre à jour le total
            let total = items.reduce((sum: number, item: any) => sum + (item.y || 0), 0);
            // Mettre à jour le graph (le text du sous-titre du graph indiquant le total)
            this.chart.update({
              subtitle: {
                text: total.toString()
              },
            })

          },10)
        }
      }
    }

    let chartOptions: Highcharts.Options = {
      credits: {
        enabled: false
      },
      chart: {
        type: 'pie',
        backgroundColor: options.backgroundColor || 'transparent',
        height: options.height ?? '300px',
        events: {
          // change the size of the title/subtitle when whe have many characters
          render() {
            const chart = this;
            if (!chart.subtitle) return;
            const subtitleText = chart.subtitle.element.textContent || '';
            const charCount = subtitleText.length;

            const radius = chart.series[0].center[2] / 2; // the radius of the pie
            let baseFontSize = Math.max(10, radius / 3); // the base fontsize with the limit that not exceed
            // if the number characters exceed the limit then reduce further the font size
            if (charCount > 6) {
              baseFontSize = baseFontSize * (6 / charCount);
            }
            // update the new size of the text and be sure to align the text
            chart.subtitle.update({
              verticalAlign: 'middle',
              style: {
                floating: true,
                fontSize: `${baseFontSize}px`,
              }
            }, false);
          }
        }
      },
      title: {
        text: options.showTitle ? options.title : '',
        style: {
          color: 'white',
          fontFamily: 'BebasNeue'
        }
      },
      subtitle: options.subtitle,
      legend: options.legendOption || {enabled:false},
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          borderRadius: 0,
          borderColor: 'black',
          dataLabels: options.dataLabelsOption || {
            enabled: true,
            distance: 20,
            style: {
              textOutline: 'none'
            },
            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
          },
          showInLegend: true,
        }
      },
      series: [{
        type: 'pie',
        innerSize: options.innerSize || '0%',
        name: options.label,
        colors: options.colors,
        data: options.data,
        events: {
          click: function (e: any) {
            // Attendre 10ms avant de mettre à jour le total du graph pour afficher le nouveau total (Pour eviter de cloner le graph et faire passer l'animation)
            setTimeout(() => {
              // Récupérer les items visibles (Les legendes selectionnées)
              let itemValue = e.point.y;
              // Récuperer le subtitle text value
              // Mettre à jour le graph (le text du sous-titre du graph indiquant le total)
              let totalOld = this.chart.subtitle.element.textContent; // Obtenir le texte du sous-titre
              // Verifier si l'ancienne valeur ne contient pas Of, sinon recupérer uniquement la dernière valeur
              totalOld = totalOld?.includes('Of') ? totalOld?.split('Of')[1] : totalOld;
              this.chart.update({
                subtitle: {
                  text: '<b>'+itemValue.toString() + '</b><br>Of<br>' + totalOld?.toString(),
                  style: {
                    fontSize: '20px',
                    textAlign: 'center'
                  }
                },
              })
            },10)
          }
        }
      }] as Highcharts.SeriesOptionsType[],
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
