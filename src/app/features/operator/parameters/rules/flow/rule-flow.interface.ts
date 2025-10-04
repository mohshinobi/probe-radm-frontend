export interface ChartRuleActivity{
    [key:number] : {
        data: number[];
        type: string;
    },
}

export interface FileInterface{
    filename: string;
    size_in_bytes: number;
    last_update: string;
    ext: string;
    is_writable: boolean;
    line_count: number;
}

export interface RuleTopAlerts {
    key_as_string : string;
    key: any[]
    doc_count: number;
}

export interface RuleFlowActivity {
    key_as_string : string;
    key:number;
    doc_count: number;
    ["alert.signature_id"] : {
        buckets: SidActivityBucket[];
    }
}

interface SidActivityBucket {
    key : number;
    doc_count : number;
    info_alert : {
        hits : {
            hits : AlertActivity[]
        }
    }
}
interface AlertActivity {
    _source: {
        alert: {
            signature_id: number;
            action: string;
            rev: number;
            category: string;
            severity: number;
            signature: string;
            gid: number;
            metadata: {
                affected_product: string[];
                signature_severity: string[];
                created_at: string[];
                tag:string[];
                updated_at:string[];
                deployment:string[];
                attack_target: string[];
            }
        }
    }
}

export interface RuleFlowInterface{
    action?: string;
    protocol?: string;
    src_ip?: string;
    src_port?: number;
    direction?: string;
    dest_ip?: string;
    dest_port?: number;
    options?: string;
    status?: string;
    rule?: string;
    source?: string;
    sid?:number;
    rev?:number;
    threshold?: string;
    msg?: string;
}

export interface RulesFlowQueryParams {
    display_col?: string[];
    id?: number;
    sid?:number;
    rev?:number;
    action?: string;
    protocol?: string;
    src_ip?: string;
    src_port?: string;
    direction?: string;
    dest_ip?: string;
    dest_port?: string;
    options?: string,
    threshold?: string;
    msg?: string;
    rule?: string;
    status?: string;
    source? : string;

    sortedBy?: string;
    orderBy?: string;
    page?: number;
    size?: number;
}

export interface RuleTopStats {
    previous: number;
    current : number,
    trend :string ,
    ruleSets:any[],
    alertSets:AlertStats[]
}

export interface AlertStats{
    sid:number;
    signature:string;
    category:string;
    severity:number;
    hits:number;
}