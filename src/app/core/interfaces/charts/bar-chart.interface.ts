import {DashStyleValue} from "highcharts";

export interface BarChartInterface {
  title?: string | undefined;
  data?: any[];
  color: string;
  height?: string | undefined;
  borderRadius?: string;
  backgroundColor?: string;
  labelColor?: string;
  yLabelColor?: string;
  xLabelColor?: string;
  gridLineColor?: string;
  gridLineDashStyle?: DashStyleValue;
  legendLabelColor?: string;
  tickColor?: string;
  lineColor?: string;
  tooltipPointFormat?: string;
}

export interface PortData {
  name: number;
  y: number;
}

export interface PortMappings {
  [key: string]: string;
}
