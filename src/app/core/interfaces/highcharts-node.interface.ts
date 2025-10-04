export interface HighchartsNode {
  id: string;
  color?:string;
  marker: {
    radius: number;
    symbol?: string;
    lineWidth?: number;
    lineColor?: string;
  };
  macAdress: string;
  os: string;
  status: boolean;
  hostName: string;
  ipAdress: string;
  securityScore: number;
  nbAlerts: number;
  data?:any
}
