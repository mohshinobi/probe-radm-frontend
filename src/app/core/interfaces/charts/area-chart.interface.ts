import {DashStyleValue} from "highcharts";

export interface AreaChartInterface {
    title: string | undefined,
    yAxisLabel: string,
    data: any[] | undefined,
    lineColor: string
    height?: number
    backgroundColor?: string;
    labelColor?: string;
    yLabelColor?: string;
    xLabelColor?: string;
    gridLineColor?: string;
    gridLineDashStyle?: DashStyleValue;
    legendLabelColor?: string;
    showTitle?: boolean;
    plotLines?: any[];
    max?: number;
    selectedTimestamp?: number;
    xLabelTitle?: string;
    yLabelTitle?: string;
    tooltip?: Highcharts.TooltipOptions;
}
