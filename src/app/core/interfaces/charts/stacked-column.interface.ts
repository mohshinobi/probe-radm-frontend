import { LegendOptions } from "highcharts";

export interface StackedColumnInterface {
  title?: string;
  data?: any[];
  categories?: string[];
  legendOption?: LegendOptions;
  colors?:string[];
}
