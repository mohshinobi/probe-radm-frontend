import {DashStyleValue} from "highcharts";

export interface ColumnChartInterface {
  title?: string;
  data: any[] | undefined;
  color: string;
  categories?: string[]
  backgroundColor?: string;
  height?: string | undefined;
  borderRadius?: string;
  labelColor?: string;
  yLabelColor?: string;
  yType?:  Highcharts.AxisTypeValue;
  xLabel?: string;
  xLabelColor?: string;
  gridLineColor?: string;
  gridLineDashStyle?: DashStyleValue;
  legendLabelColor?: string;
  tickColor?: string;
  lineColor?: string;
  pointWidth?: number;
  pointFormat?: string;
  dataLabels?: boolean;

}
