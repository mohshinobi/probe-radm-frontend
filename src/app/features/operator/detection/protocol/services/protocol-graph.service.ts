import { Injectable } from "@angular/core";
import { AreaChartInterface, AreaSplineChartInterface, MapChartInterface, PieChartInterface, SankeyChartInterface } from "@core/interfaces";
import { BarChartInterface } from "@core/interfaces/charts/bar-chart.interface";
import { Point, Series } from "highcharts";
import { StackedColumnInterface } from "@core/interfaces/charts/stacked-column.interface";
import { TopProto } from "./protocol.service";

const chartColors = ['#FFC107', '#8BC34A', '#9C27B0', '#03A9F4', '#E5E5EA', '#FF9800', '#4CAF50', '#673AB7', '#2196F3', '#F7DC6F'];

@Injectable({
  providedIn: 'root'
})
export class ProtocolGraphService {

  barchartOption(data: any, color: string = "#8569FE"): BarChartInterface {
    
    return {
      data: data,
      title: undefined,
      color: color,
      height: '222px',
      borderRadius: '20%',
      backgroundColor: '#1F1F1F',
      labelColor: '#C5C4BE',
      yLabelColor: '#C5C4BE',
      xLabelColor: '#C5C4BE',
      gridLineColor: '#C5C4BE',
      gridLineDashStyle: 'Dot',
      legendLabelColor: '#C5C4BE',
      tickColor: '#C5C4BE',
      lineColor: '#C5C4BE',
    };
  }

  sankeyChartOption(data: any): SankeyChartInterface {
    return {
      title: undefined,
      data: data,
      colors: chartColors,
      label: 'Requests',
      height: '222px',
      backgroundColor: '#1F1F1F'
    };
  }

  areaChartOption(data: any): AreaChartInterface {
    return {
      title: undefined,
      backgroundColor: '#1F1F1F',
      yAxisLabel: 'Requests',
      data: data,
      lineColor: 'var(--radm-lightblue)',
      height: 415
    };
  }

  mapChartOption(data: any, direction: string): MapChartInterface {
    return {
      title: '',
      color: direction === 'src' ?'#33FFBD': '#ff886a', 
      hoverColor: '#000',
      label: 'alerts',
      data: data,
      height: '300px',
      backgroundColor: '#1F1F1F',
    };
  }

  areaSplineChartOption(data: any): AreaSplineChartInterface {
    return {
      title: undefined,
      label: 'Alerts',
      data: data,
      colors: ['#8BC34A', '#9C27B0', '#ffa78f', 'var(--radm-lightblue)', '#f89200', '#ec72eb', '#9999ff', '#45efa9', '#FFC107', '#03A9F4', '#E5E5EA', '#2196F3', '#F7DC6F'],
      height: 415
    };
  }

  pieChartOption(data: any[]): PieChartInterface {

    const total = data && data.length > 0
      ? data.reduce((sum, item) => sum + (item.y || 0), 0)
      : '';

    return {
      data: data,
      height: '297px',
      colors: [
        '#FFC107',
        '#8BC34A',
        '#9C27B0',
        '#03A9F4',
        '#E5E5EA',
        '#FF9800',
        '#4CAF50',
        '#673AB7',
        '#2196F3',
        '#F7DC6F',
      ],
      label: 'Requests',
      backgroundColor: '#1F1F1F',
      innerSize: '85%',
      subtitle: {
        useHTML: true,
        text: total.toString(),
        floating: false,
        verticalAlign: 'middle',
        align: 'center',
        x: -117,
        style: {
          color: 'white',
          fontSize: '28px'
        }
      },
      legendOption: {
        enabled: true,
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
        navigation: {
          activeColor: '#ff886a',
          style: {
            color: 'white'
          }
        },
        itemStyle: {
          color: 'white',
        },
        itemWidth: 200,
        itemMarginBottom: 20,
        padding: 10,
        labelFormatter: function (this: Point | Series): string {
          if ('y' in this && 'name' in this) {
            return `${this.name}: ${this.y}`;
          }
          return '';
        }
      },
      dataLabelsOption: { enabled: false }
    };
  }

  plainPieChartOption(data: any, innerSize: string = '0%'): PieChartInterface {
    return {
      title: '',
      label: 'Requests',
      data: data,
      colors: chartColors,
      backgroundColor: '#1F1F1F',
      innerSize: innerSize
    }
  }

  barChartDataTransformer(data: any[]): BarChartInterface['data'] {
    return data.map((item) => ({
      name: item.name,
      y: item.y,
    }));
  }

  transformTopProtosData(res: TopProto[] = []): StackedColumnInterface {

    const categories = res.map((item: any) => item.name);
    const seriesData = res.map((item: any) => ({
      name: item.name,
      data: [item.y],
    }));

    return {
      title: '',
      data: seriesData,
      categories: categories,
    } as StackedColumnInterface;
  }
}
