export interface ApiResponse<T> {
  last_data?: T[]|[];
  page: number;
  size: number;
  offset: number;
  total: number;
  after_key?: { dest_port: string; dest_ip: string; port: string; sid:string, rev:string};
  data_count?: number;
  data: T[];
}