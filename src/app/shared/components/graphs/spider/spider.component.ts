import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SpiderInterface } from '@core/interfaces/charts/spider.interface';
import Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
    selector: 'app-spider',
    imports: [HighchartsChartModule],
    templateUrl: './spider.component.html',
    styleUrl: './spider.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpiderComponent {
  @Input() graphOptions!: SpiderInterface;

  ngOnInit(): void {
    this.loadGraph();
  }
  
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};

  loadGraph() {
    this.chartOptions = {
      chart: {
        polar: true,
        backgroundColor: 'transparent',
      },
      title: {
        text: this.graphOptions.title,
        style: {
          color: 'white',
          fontFamily: 'BebasNeue'
        }
      },
    
      xAxis: {
        categories: this.graphOptions.xlabels,
        labels: {
          style: {
            color: '#fff',
            backgroundColor: '#FF0000'
          }
        }
      },
      yAxis: {
        min: 0,
        labels: {
          style:{
            color: '#fff'
          }
        }
      },
    
      legend: {
        enabled: false
      },
    
      plotOptions: {
        
        series: {
          pointStart: 0
        },
        column: {
          pointPadding: 0,
          groupPadding: 0
        },
        
      },
    
      credits: {
        enabled: false
      },
    
      series: [{
        type: 'column',
        name: 'Vulnerabilities',
        colors: this.graphOptions.colors,
        colorByPoint: true,
        data: this.graphOptions.data
      }]
    
    }
  }
}
