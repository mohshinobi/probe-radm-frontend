interface AlertMetadata {
    attack_target: string[];
    deployment: string[];
    created_at: Date;
    affected_product: string[];
    signature_severity: string[];
    updated_at: string[];
    tag: string[];
}

interface Alert {
    severity: number;
    rev: number;
    action: string;
    signature: string;
    signature_id: number;
    category: string;
    mitre_techniques: string[];
    metadata: AlertMetadata;
    gid: number;
}

interface GeoInfo {
    country_iso_code: string;
    country_name: string;
    timezone: string;
    continent_code: string;
    location: Location;
}

interface Location {
    lon: number;
    lat: number;
}

interface ASN {
    organization: Organization;
    number: number;
}

interface Organization {
    name: string;
}

interface Flow {
    start: string;
    bytes_toclient: number;
    dest_ip: string;
    dest_port: number;
    src_ip: string;
    pkts_toclient: number;
    src_port: number;
    pkts_toserver: number;
    bytes_toserver: number;
}

interface LogFile {
    path: string;
}

interface Event {
    original: string;
}

interface PacketInfo {
    linktype: number;
}

export interface AlertTimelineResponse {
  data: {
    two_previous_alerts: {
      top_hits_alerts: {
        hits: {
          total: { value: number; relation: string };
          max_score: number | null;
          hits: Array<{ _index: string; _id: string; _source: AlertDataInterface }>;
        };
      };
    };
    two_next_alerts: {
      top_hits_alerts: {
        hits: {
          total: { value: number; relation: string };
          max_score: number | null;
          hits: Array<{ _index: string; _id: string; _source: AlertDataInterface }>;
        };
      };
    };
  }
}


export interface AlertDataInterface {
    _id: string; 
    dest_asn: {
        ip: string;
        as: ASN;
    };
    threat:string;
    timestamp: string;
    direction: string;
    community_id: string;
    stream: number;
    alert?: Alert;
    app_proto: string;
    severity:number;
    category:string;
    translation: string;
    src_ip: string;
    event: Event;
    type: string;
    src_port: number;
    payload: string;
    payload_printable: string;
    src_geoip: {
        ip: string;
        geo: GeoInfo;
    };
    src_asn: {
        ip: string;
        as: ASN;
    };
    event_type: string;
    dest_ip: string;
    '@timestamp': string;
    log: {
        file: LogFile;
    };
    dest_geoip: {
        ip: string;
        geo: GeoInfo;
    };
    pkt_src: string;
    packet: string;
    proto: string;
    metadata: {
        flowbits: string[];
    };
    host?: {
        name: string;
    };
    in_iface: string;
    flow: Flow;
    '@version': string;
    dest_port: number;
    packet_info: PacketInfo;
    flow_id: string;
    mitre_techniques:string;
    alert_count: number;
}
