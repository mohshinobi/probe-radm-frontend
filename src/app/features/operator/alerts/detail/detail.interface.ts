import {AlertDataInterface} from "@core/interfaces";

export interface AIDetail {
  deviance: number;
  translation: string;
}

export interface ZeekSslDetail {
  version: string;
  cipher: string;
  ja3: string;
  ja3s: string;
  orig_alpn: string[];
  validation_status: string;
}

export interface ZeekConnDetail {
  uid: string;
  src_ip: string;
  dest_ip: string;
  src_port: number;
  dest_port: number;
  proto: string;
  conn_state: string;
  duration: string;
  src_asn: string;
  dest_asn: string;
  orig_l2_addr: string;
  resp_l2_addr: string;
  missed_bytes: number;
  orig_pkts: number;
  resp_pkts: number;
  orig_ip_bytes: number;
  resp_ip_bytes: number;
  history: string;
  hostname: string;
  local_orig: boolean;
  local_resp: boolean;
}

export interface AppProto {
  app_proto: string;
}

export interface AlertDetails extends AlertDataInterface {
  zeekData?: ZeekConnDetail;
  sslData?: ZeekSslDetail;
  aiData?: AIDetail;
  appProto:AppProto;
  previous?: AlertDataInterface[];
  next?: AlertDataInterface[];
}
