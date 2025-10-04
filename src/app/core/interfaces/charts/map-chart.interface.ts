import {BaseParamsInterface} from "@core/interfaces/base-params.interface";
import {SeriesTooltipOptionsObject} from "highcharts";
import HighchartsMap from "highcharts/highmaps";

export interface MapChartInterface {
    title: string;
    color: string;
    hoverColor: string;
    label: string;
    data: any[] | undefined;
    height?: string | undefined;
    backgroundColor?: string;
    colorAxisOption?: HighchartsMap.ColorAxisOptions,
    tooltipPointFormat?:string
}

export interface MapQueryInterface extends BaseParamsInterface{
  src: string;
  dest: string;
  interval: number;
  startDate: Date;
  endDate: Date;
}

export interface WorldMapMarkerOptionsInterface{
  data: {lat: number, lon: number, name: string, extra: {categories: string, id:string} ,events?: {click: () => void}}[];
  tooltip?:SeriesTooltipOptionsObject | undefined;
  dataMap?: (string | number)[][];
}
