import { Link } from './network-link.interface';
export interface HighchartsLink extends Link {
  width: number;
  color?: string;
  dataLabels: {
    enabled: boolean;
    format?: '{point.protocol}';
    color?: '#808080';
  };
}
