export interface HorizontalBarChartData {
  name: string;
  y: number; 
}

export interface HorizontalBarChartInterface {
  title: string;
  categories: string[];
  seriesData: HorizontalBarChartData[];
  colors: string[];
}
