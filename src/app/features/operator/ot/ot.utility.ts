export interface IconInterface {
    key:string ,
    icon:string
}
export interface CategoryInterface{
    default:string,
    key:string,
    value: IconInterface[]
}
export interface TypesInterface {
    key: string;
    value:  CategoryInterface[]
}
export interface ConfigInterface  {
    linkShape : string ,
    linkArrow : string ,
    conversation :string,
    zone :string  ,
    asset: string ,
    yellow:string ,
    undiscoveredAsset:string
}
export interface ProtocolsList { key: string; value: string; color: string }
export const listProtocols: ProtocolsList[] = [
    { key: 'ip',       value: 'ip',       color: '#6C3483' },
    { key: 'tcp',      value: 'tcp',      color: '#c8102e' },
    { key: 'udp',      value: 'udp',      color: '#229954' },
    { key: 'bvlc',     value: 'bvlc',     color: '#1F618D' },
    { key: 'icmp',     value: 'icmp',     color: '#76448A' },
    { key: 'http',     value: 'http',     color: '#10b981' },
    { key: 'https',    value: 'https',    color: '#117864' },
    { key: 'nbss',     value: 'nbss',     color: '#196F3D' },
    { key: 'ftp',      value: 'ftp',      color: '#BA4A00' },
    { key: 'sftp',     value: 'sftp',     color: '#CA6F1E' },
    { key: 'bacnet',   value: 'bacnet',   color: '#C70039' },
    { key: 'ssh',      value: 'ssh',      color: '#148F77' },
    { key: 'telnet',   value: 'telnet',   color: '#512E5F' },
    { key: 'dns',      value: 'dns',      color: '#1D8348' },
    { key: 'dhcp',     value: 'dhcp',     color: '#B7950B' },
    { key: 'smtp',     value: 'smtp',     color: '#D68910' },
    { key: 'pop',      value: 'pop',      color: '#2471A3' },
    { key: 'igmp',     value: 'igmp',     color: '#C71585' },
    { key: 'imap',     value: 'imap',     color: '#B03A2E' },
    { key: 'tls',      value: 'tls',      color: '#78281F' },
    { key: 'cipio',    value: 'cipio',    color: '#5B2C6F' },
    { key: 'ethertype',value: 'ethertype',color: '#4A235A' },
    { key: 'nfs',      value: 'nfs',      color: '#0E6251' },
    { key: 'sip',      value: 'sip',      color: '#B03A2E' },
    { key: 'smb',      value: 'smb',      color: '#CA6F1E' },
    { key: 'vnc',      value: 'vnc',      color: '#A04000' },
    { key: 'cipcls',   value: 'cipcls',   color: '#F93226' },
    { key: 'ipsec',    value: 'ipsec',    color: '#154360' },
    { key: 'enip',     value: 'enip',     color: '#0E6655' },
    { key: 'cip',      value: 'cip',      color: '#922B21' },
    { key: 'x509ce',   value: 'x509ce',   color: '#1B2631' },
    { key: 'x509sat',  value: 'x509sat',  color: '#2C3E50' },
    { key: 'arp',      value: 'arp',      color: '#2980B9' },
    { key: 'pptp',     value: 'pptp',     color: '#76448A' },
    { key: 'mysql',    value: 'mysql',    color: '#1ABC9C' },
    { key: 'mqtt',     value: 'mqtt',     color: '#8E44AD' },
    { key: 'xml',      value: 'xml',      color: '#B7950B' },
    { key: 'tds',      value: 'tds',      color: '#8E2D3E' },
    { key: 'cipcm',    value: 'cipcm',    color: '#5D6D7E' },
    { key: 'ptp',      value: 'ptp',      color: '#B03A2E' },
    { key: 'browser',  value: 'browser',  color: '#7B241C' },
    { key: 'ssdp',     value: 'ssdp',     color: '#117A65' },
    { key: 'bacapp',   value: 'bacapp',   color: '#0B5345' },
    { key: 'nbns',     value: 'nbns',     color: '#943126' },
    { key: 'llmnr',    value: 'llmnr',    color: '#2E4053' },
    { key: 'mdns',     value: 'mdns',     color: '#17202A' },
];

export function getColorProtocol(value: string): string {
    for(const proto of listProtocols ){
        if(value.toLowerCase() == proto.key)
            return proto.color;
    }
    return '#fff111';
}

export const types :TypesInterface[] =  [
    {
        key: 'other',
        value: [
            {
                key:'virtual' ,
                default:'other_virtual_metier',
                value:[
                    {key:'admin', icon:'other_virtual_admin'},
                    {key:'metier', icon:'other_virtual_metier'},
                    {key:'nb', icon:'other_virtual_nb'},
                    {key:'res', icon:'other_virtual_res'},
                ]
            },
            {
                key:'pc' ,
                default:'other_pc_metier',
                value:[
                    {key:'metier', icon:'other_pc_metier'},
                    {key:'nb', icon:'other_pc_nb'},
                    {key:'res', icon:'other_pc_res'},
                    {key:'techno', icon:'other_pc_techno'},
                ]
            },
            {
                key:'hypervisor' ,
                default:'other_hypervisor_metier',
                value:[
                    {key:'admin', icon:'other_hypervisor_admin'},
                    {key:'techno', icon:'other_hypervisor_techno'},
                    {key:'nb', icon:'other_hypervisor_nb'},
                    {key:'metier', icon:'other_hypervisor_metier'}
                ]
            },
            {

                key:'engineering' ,
                default:'other_engineering_metier',
                value:[
                    {key:'admin', icon:'other_engineering_admin'},
                    {key:'metier', icon:'other_engineering_metier'},
                    {key:'nb', icon:'other_engineering_nb'}
                ]
            },
            {
                key:'data_storage' ,
                default:'other_data_storage_metier',
                value:[
                    {key:'admin', icon:'other_other_data_storage_admin'},
                    {key:'metier', icon:'other_other_data_storage_metier'},
                    {key:'nb', icon:'other_other_data_storage_nb'},
                    {key:'res', icon:'other_other_data_storage_res'},
                    {key:'tech', icon:'other_other_data_storage_tech'},
                ]
            },
            {
                key:'admin_console' ,
                default:'other_admin_console_metier',
                value:[
                    {key:'nb', icon:'other_admin_console_nb'},
                    {key:'admin', icon:'other_admin_console_admin'},
                    {key:'metier', icon:'other_admin_console_metier'},
                    {key:'reseau', icon:'other_admin_console_reseau'},
                ]
            }
        ]
    },
    {
        key: 'superv',
        value: [
            {
                key:'server' ,
                default:'superv_server_metier',
                value:[
                    {key:'nb', icon:'superv_server_nb'},
                    {key:'admin', icon:'superv_server_admin'},
                    {key:'metier', icon:'superv_server_metier'},
                    {key:'tech', icon:'superv_server_tech'},
                ]
            },
            {
                key:'client' ,
                default:'superv_client_metier',
                value:[
                    {key:'nb', icon:'superv_client_nb'},
                    {key:'metier', icon:'superv_client_metier'}
                ]
            },
            {
                key:'historian' ,
                default:'superv_historian_metier',
                value:[
                    {key:'nb', icon:'superv_historian_nb'},
                    {key:'metier', icon:'superv_historian_metier'},
                ]
            },

        ]
    },
    {
        key: 'process',
        value: [
            {
                key:'ied' ,
                default:'process_ied_metier',
                value:[
                    {key:'nb', icon:'process_ied_nb'},
                    {key:'metier', icon:'process_ied_metier'}
                ]
            },
            {
                key:'iot' ,
                default:'process_iot_metier',
                value:[
                    {key:'nb', icon:'process_iot_nb'},
                    {key:'metier', icon:'process_iot_metier'},
                    {key:'res', icon:'process_iot_res'},
                    {key:'techno', icon:'process_iot_techno'},
                ]
            },
            {
                key:'machine' ,
                default:'process_machine_metier',
                value:[
                    {key:'nb', icon:'process_machine_nb'},
                    {key:'metier', icon:'process_machine_metier'}
                ]
            },
            {
                key:'plc' ,
                default:'process_plc_metier',
                value:[
                    {key:'nb', icon:'process_plc_nb'},
                    {key:'metier', icon:'process_plc_metier'}
                ]
            }
        ]
    },
    {
        key: 'network',
        value: [
            {
                key:'firewall' ,
                default:'network_firewall_metier',
                value:[
                    {key:'admin', icon:'network_firewall_admin'},
                    {key:'metier', icon:'network_firewall_metier'},
                    {key:'nb', icon:'network_firewall_nb'},
                    {key:'res', icon:'network_firewall_res'},
                ]
            },
            {
                key:'router' ,
                default:'network_router_metier',
                value:[
                    {key:'admin', icon:'network_router_admin'},
                    {key:'metier', icon:'network_router_metier'},
                    {key:'nb', icon:'network_router_nb'},
                    {key:'res', icon:'network_router_res'},
                ]
            },
            {
                key:'switch' ,
                default:'network_switch_metier',
                value:[
                    {key:'admin', icon:'network_switch_admin'},
                    {key:'metier', icon:'network_switch_metier'},
                    {key:'nb', icon:'network_switch_nb'},
                    {key:'res', icon:'network_switch_res'},
                ]
            }
        ]
    },
]

export function generateIdAsset(ipv4:string, mac:string): string{
    return btoa(ipv4 + '-' + mac);
}
