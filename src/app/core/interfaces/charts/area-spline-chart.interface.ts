import {DashStyleValue} from "highcharts";

export interface AreaSplineChartInterface {
  xAxis?: {
    reversed?: boolean;
    type?: any;
    dateTimeLabelFormats?: any;
    title?: any;
    labels?: any;
  }
  name?: string
  title?: string;
  data: any[] | undefined;
  colors?: string[];
  label?: string;
  backgroundColor?: string;
  labelColor?: string;
  yLabelColor?: string;
  gridLineColor?: string;
  gridLineDashStyle?: DashStyleValue;
  legendLabelColor?: string;
  showLegend?: boolean;
  height?: number;
  formatter?: boolean;
  convertBytes?: boolean;
}
