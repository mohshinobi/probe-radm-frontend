export interface HeatChart {
    title: string,
    xAxis: string[],
    yAxis: string[],
    data: any[],
    tickPositions? : number[],
    stops?: any[],
    dataFormat?: string,
    height? : string,
    width?: string,
    withPercentage?: boolean;

}

