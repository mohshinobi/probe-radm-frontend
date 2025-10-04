export interface AnomalyInterface {
    ts?: number;
    uid?: string;
    type?: string;
    note?: string;
    msg?: string;
    sub?: string;
    src?: string;
    dst?: string;
    p?: string;
    fuid?: string;
    file_desc?: string;
    conn_count?: string;
    dropped?: string;
    peer_descr?: string;
    name?: string;
    addl?: string;
    notice?: string;
    peer?: string;
    src_ip?: string;
    dest_ip?: string;
    src_port?:number;
}