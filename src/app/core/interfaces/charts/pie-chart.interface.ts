import {LegendOptions, SeriesPieDataLabelsOptionsObject, SubtitleOptions} from "highcharts";

export interface PieChartInterface {
    title?: string;
    label?: string;
    colors?: string[];
    height?: string;
    data: any[] | undefined;
    innerSize?: string;
    backgroundColor?: string;
    legendOption?: LegendOptions;
    dataLabelsOption?: SeriesPieDataLabelsOptionsObject;
    subtitle?: SubtitleOptions;
    showTitle?: boolean;
}
