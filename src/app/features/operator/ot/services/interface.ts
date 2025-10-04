

export interface OtTopology {
    layers:OtLayer[] ;
    links:any[];
}
export interface OtLayer{
    id: number;
    name: string;
    type:string;
    layer:number;
    zones_inside?: OtZone[];
}

export interface OtZone {
    id: string;
    name: string;
    level: number;
    process_importance?: string;
    processimportance?: string;
    criticality?: string;
    subnets:string;
    vlan: number;
    assets_inside?: OtAsset[]
}

export interface QueryParams {
    size?:number;
    page?:number;
    zone?:string;
    type?:string;
    sensitivity?:string;
    display_col?: string[];
}

export interface OtAsset  {
    id: string,
    type: string,
    product_commercial_name?: string,
    ics_name?: string,
    nom_client_usuel?: string,
    firmware_version?: string,
    mac_address?: string,
    ip_address?: string,
    robustesse?: number,
    criticity?: number,
    belonging_zone?: string,
    champs_descriptif?: string,
    belongingzone?: string,
    champsdescriptif?: string,
    ipaddress?: string,
    macaddress?: string,
    nomclientusuel?: string,
    productcommercialname?: string
}



export interface QueryConvParams{
    size?:number;
    page?:number;
    display_col?: string[];
}
export interface HtmlPosition  {
    x:number,
    y:number,
    width:number,
    height:number,
    top:number,
    left:number,
    right:number,
    bottom:number
}
export interface OtStats{
    assets:number;
    zones:number;
    levels:number;
    conversations:number;
    undiscovered:number;
}

export interface LinkInterface{
    uid:string;
    protocol: string;
    from:string;
    to:string;
}

export interface GoGroup{
    key: any;
    isGroup: boolean;
    row: number;
    isLevel:boolean;
    isZone: boolean;
    group?: string|number;
    raw:any;
}

export interface Asset{
    id : string;
    type : string;
    product_commercial_name? : string;
    productcommercialname? : string;
    ics_name? : string;
    icsname? : string;
    nom_client_usuel? : string;
    nomclientusuel? : string;
    firmware_version? : string;
    firmwareversion? : string;
    mac_address? : string;
    macaddress? : string;
    ip_address? : string;
    ipaddress? : string;
    robustesse? : number;
    sensitivity? : string;
    belonging_zone? : string | null;
    belongingzone? : string | null;
    champs_descriptif? : string;
    champsdescriptif? : string | null;
    criticity? : string;
}
export interface GojsAsset{
    key: string;
    type: string;
    group?: string ;
    id:string;
    raw: Asset
}
export interface MissingAsset{
    ip:string;
    mac_adress:string;
    id:string;
    type:string;
    _id:string;
}

export interface infoDiv {
    title:string;
    element:HTMLElement;
    data:any[];
    event?:Event;
}

export interface SeverityInterface {
  key: number|string;
  value: number|string;
  label: number|string;
}
export const criticity : SeverityInterface[]= [
  {key:4, label:4 , value:4},
  {key:3, label:3 , value:3},
  {key:2, label:2 , value:2},
  {key:1, label:1 , value:1}
]

export interface QueryConvParams{
  size?:number;
  page?:number;
  display_col?: string[];
}

export interface OtConversation{
  timestamp:string;
  protocols?:string[];
  dest_asn:{
    as: {
      number:number,
      organization:{
        name:string
      }
    },
    ip:string
  };
  dest_geoip:{
    geo: {
      continent_code: string
      country_iso_code: string
      country_name: string
    },
    location:{
      lat: number
      lon: number
    }
  };
  host:string;
  layers?:{
    eth:{
      eth_eth_dst_ig: boolean;
      eth_eth_src_oui: number;
      eth_eth_src_resolved: string;
      eth_eth_dst_oui_resolved: string,
      eth_eth_dst_lg: boolean,
      eth_eth_dst: string,
      eth_eth_src_lg: boolean;
      eth_eth_ig: boolean;
      eth_eth_addr_oui: number;
      eth_eth_dst_oui: number;
      eth_eth_padding: string;
      eth_eth_src: string;
      eth_eth_src_ig: boolean;
      eth_eth_src_oui_resolved: string;
      eth_eth_addr_oui_resolved:string;
      eth_eth_addr: string;
      eth_eth_dst_resolved: string;
      eth_eth_addr_resolved: string;
      eth_eth_lg: boolean;
      eth_eth_type: string;
    },
    frame:{
      frame_frame_cap_len: number;
      frame_frame_encap_type: number;
      frame_frame_ignored: boolean;
      frame_frame_interface_id: number;
      frame_frame_interface_name: string;
      frame_frame_len: number;
      frame_frame_marked: boolean;
      frame_frame_number: number;
      frame_frame_offset_shift: number;
      frame_frame_protocols: string;
      frame_frame_time: string;
      frame_frame_time_delta: number;
      frame_frame_time_delta_displayed: number;
      frame_frame_time_epoch: number;
      frame_frame_time_relative:number;
    };
    icmp:any;
    ip: {
      ip_ip_ttl : number;
      ip_ip_dsfield_dscp : number;
      ip_ip_version : number;
      ip_ip_host : string[];
      ip_ip_src_host : string;
      ip_ip_dsfield_ecn : number;
      ip_ip_dsfield : string;
      ip_ip_len : number;
      ip_ip_frag_offset : number;
      ip_ip_hdr_len : number;
      ip_ip_dst : string;
      ip_ip_id : string;
      ip_ip_checksum_status : number;
      ip_ip_dst_host : string;
      ip_ip_flags_rb : boolean;
      ip_ip_proto : number;
      ip_ip_addr : string[];
      ip_ip_flags : string;
      ip_ip_flags_mf : boolean;
      ip_ip_flags_df : boolean;
      ip_ip_src : string;
      ip_ip_checksum : string;
    };
  };
  src_asn:string;
  src_geoip:string;
  src_ip:string;
  dest_ip:string;
  tags:string;
  type:string;
  asset_src:OtAsset | null,
  asset_dest:OtAsset | null,
  zones?:string,
  isPartAlert?:boolean;
  stats?:any;
  history?:{
    timeRange:string;
    last60Minutes:number;
    bw:{
      last1Minutes: number;
      last5Minutes: number;
      last15Minutes: number;
    };
    payloads:{
      last1Minutes: number;
      last5Minutes: number;
      last15Minutes: number;
    };
  },
  alert?:{
    message: string;
    protocolosAnalysis:{
      used:string;
      specified:string;
      current:string;
    }
    nbOccurences:{
      last5Minutes: number;
      last15Minutes: number;
      last60Minutes: number;
    }
  }
}
