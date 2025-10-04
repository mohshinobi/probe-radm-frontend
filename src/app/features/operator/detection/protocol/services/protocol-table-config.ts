import { TableCellTypeEnum } from '@core/enums';
import { columnSets } from '../protocol-properties';
import { TableColumnInterface } from '@core/interfaces';
import { inject, Injectable } from '@angular/core';
import { ProtocolIndex } from './protocol.service';
import { DetailField } from '@shared/components/table/detail/detail.component';
import { CommonService } from '@core/services';

@Injectable({
  providedIn: 'root',
})
export class ProtocolTableConfig {
  commonService = inject(CommonService);

  parseDate(dateTime: string) {
    this.commonService.parseDate(dateTime);
  }
  commonColumns = {
    timestamp: { name: 'SEEN', dataKey: '@timestamp', type: TableCellTypeEnum.DATE, },
    src_ip: { name: 'SRC IP', dataKey: 'src_ip', type: TableCellTypeEnum.FLAG },
    dest_ip: { name: 'DEST IP', dataKey: 'dest_ip', type: TableCellTypeEnum.FLAG, },
    src_port: { name: 'SRC PORT', dataKey: 'src_port', type: TableCellTypeEnum.TEXT, },
    dest_port: { name: 'DEST PORT', dataKey: 'dest_port', type: TableCellTypeEnum.TEXT, },
  };

  alertColumns = [
    { name: 'Threat', dataKey: 'threat', type: TableCellTypeEnum.TEXT },
    { name: 'Severity', dataKey: 'alert.severity', type: TableCellTypeEnum.SEVERITY, },
    { name: 'App Proto', dataKey: 'app_proto', type: TableCellTypeEnum.FLAG, },
    { name: 'Signature', dataKey: 'alert.signature', type: TableCellTypeEnum.TEXT, },
    {
      name: 'Actions', dataKey: 'actions', type: TableCellTypeEnum.ACTIONS,
      isSortable: false,
      actions: [{ name: 'list', label: 'Alert list', icon: 'list' }],
    },
  ];

  dnsColumns = [
    { name: 'RR NAME', dataKey: 'query', type: TableCellTypeEnum.TEXT },
    { name: 'Answers', dataKey: 'answers', type: TableCellTypeEnum.TEXT },
    { name: 'RR TYPE', dataKey: 'qtype_name', type: TableCellTypeEnum.TEXT },
  ];

  sshColumns = [
    { name: 'Client', dataKey: 'client', type: TableCellTypeEnum.TEXT },
    { name: 'Server', dataKey: 'server', type: TableCellTypeEnum.TEXT },
    { name: 'Auth Attemps', dataKey: 'auth_attempts', type: TableCellTypeEnum.TEXT, },
    { name: 'Auth Success', dataKey: 'auth_success', type: TableCellTypeEnum.TEXT, },
  ];

  tlsColumns = [
    { name: 'TLS VERSION', dataKey: 'version', type: TableCellTypeEnum.TEXT }
  ];

  httpColumns = [
    { name: 'URL', dataKey: 'http.url', type: TableCellTypeEnum.TEXT },
    { name: 'HTTP Method ', dataKey: 'http.http_method', type: TableCellTypeEnum.TEXT, },
    { name: 'HOSTNAME', dataKey: 'http.hostname', type: TableCellTypeEnum.TEXT, },
  ];

  fileInfoColumns = [
    {
      name: 'FILENAME',
      dataKey: 'fileinfo.filename',
      type: TableCellTypeEnum.TEXT,
    },
    { name: 'SIZE', dataKey: 'fileinfo.size', type: TableCellTypeEnum.TEXT },
    {
      name: 'STORED',
      dataKey: 'fileinfo.stored',
      type: TableCellTypeEnum.TEXT,
    },
    { name: 'STATE', dataKey: 'fileinfo.state', type: TableCellTypeEnum.TEXT },
    { name: 'Proto', dataKey: 'app_proto', type: TableCellTypeEnum.TEXT },
    {
      name: 'HOSTNAME',
      dataKey: 'http.hostname',
      type: TableCellTypeEnum.TEXT,
    },
    { name: 'URL', dataKey: 'http.url', type: TableCellTypeEnum.TEXT },
    {
      name: 'METHOD',
      dataKey: 'http.http_method',
      type: TableCellTypeEnum.TEXT,
    },
    { name: 'STATUS', dataKey: 'http.status', type: TableCellTypeEnum.TEXT },
  ];

  rdpColumns = [
    {
      name: 'RDP Event Type',
      dataKey: 'rdp.event_type',
      type: TableCellTypeEnum.TEXT,
    },
    { name: 'RDP Cookie', dataKey: 'rdp.cookie', type: TableCellTypeEnum.TEXT },
    {
      name: 'Transaction ID',
      dataKey: 'rdp.tx_id',
      type: TableCellTypeEnum.TEXT,
    },
  ];

  smbColumns = [
    {
      name: 'SMB Command',
      dataKey: 'smb.command',
      type: TableCellTypeEnum.TEXT,
    },
  ];

  krb5Columns = [
    {
      name: 'Requested Origin',
      dataKey: 'krb5.cname',
      type: TableCellTypeEnum.TEXT,
    },
    {
      name: 'Kerberos Realm',
      dataKey: 'krb5.realm',
      type: TableCellTypeEnum.TEXT,
    },
    {
      name: 'Service To Access',
      dataKey: 'krb5.sname',
      type: TableCellTypeEnum.TEXT,
    },
  ];

  buildColumns = (columns: any, additionalColumns = []) => {
    return [
      ...Object.values(this.commonColumns),
      ...columns,
      ...additionalColumns,
    ];
  };

  overviewTableColumns = this.buildColumns(this.alertColumns);
  fileInfoTableColumns = this.buildColumns(this.fileInfoColumns);
  dnsTableColumns = this.buildColumns(this.dnsColumns);
  sshTableColumns = this.buildColumns(this.sshColumns);
  tlsTableColumns = this.buildColumns(this.tlsColumns);
  httpTableColumns = this.buildColumns(this.httpColumns);
  rdpTableColumns = this.buildColumns(this.rdpColumns);
  smbTableColumns = this.buildColumns(this.smbColumns);
  krb5TableColumns = this.buildColumns(this.krb5Columns);

  getColumnsConfig(
    type: 'displayed' | 'requested' | 'table',
    index: ProtocolIndex
  ) {
    const columnsConfig = {
      [ProtocolIndex.alert]: {
        displayed: columnSets.overview.displayed,
        requested: columnSets.overview.requested,
        table: this.overviewTableColumns,
      },
      [ProtocolIndex.dns]: {
        displayed: columnSets.dns.displayed,
        requested: columnSets.dns.requested,
        table: this.dnsTableColumns,
      },
      [ProtocolIndex.ssh]: {
        displayed: columnSets.ssh.displayed,
        requested: columnSets.ssh.requested,
        table: this.sshTableColumns,
      },
      [ProtocolIndex.tls]: {
        displayed: columnSets.tls.displayed,
        requested: columnSets.tls.requested,
        table: this.tlsTableColumns,
      },
      [ProtocolIndex.http]: {
        displayed: columnSets.http.displayed,
        requested: columnSets.http.requested,
        table: this.httpTableColumns,
      },
      [ProtocolIndex.fileinfo]: {
        displayed: columnSets.fileInfo.displayed,
        requested: columnSets.fileInfo.requested,
        table: this.fileInfoTableColumns,
      },
      [ProtocolIndex.rdp]: {
        displayed: columnSets.rdp.displayed,
        requested: columnSets.rdp.requested,
        table: this.rdpTableColumns,
      },
      [ProtocolIndex.smb]: {
        displayed: columnSets.smb.displayed,
        requested: columnSets.smb.requested,
        table: this.smbTableColumns,
      },
      [ProtocolIndex.krb5]: {
        displayed: columnSets.krb5.displayed,
        requested: columnSets.krb5.requested,
        table: this.krb5TableColumns,
      },
      [ProtocolIndex.ssl]: {
        displayed: [],
        requested: [],
        table: [],
      },
    };
    return columnsConfig[index][type];
  }

  getDisplayedColumns(index: ProtocolIndex) {
    return this.getColumnsConfig('displayed', index);
  }

  getRequestedColumns(index: ProtocolIndex) {
    return this.getColumnsConfig('requested', index);
  }

  getTableColumns(index: ProtocolIndex): TableColumnInterface[] {
    return this.getColumnsConfig('table', index) as TableColumnInterface[];
  }

  alertDetails = (data: any) =>
    [
      { key: 'Title', value: data?.alert?.signature, type: 'text' },
      { key: 'Date', value: data?.['@timestamp'], type: 'text' },
      { key: 'Protocol', value: data?.proto?.toUpperCase(), type: 'text' },
      { key: 'Src Port', value: data?.src_port, type: 'text' },
      { key: 'Dest Port', value: data?.dest_port, type: 'text' },
      {
        key: 'Offender',
        value: data?.src_ip,
        type: 'img',
        srcImg:
          'assets/images/' +
          data?.src_geoip?.geo?.country_iso_code?.toLowerCase() +
          '.svg',
      },
      {
        key: 'Victim',
        value: data?.dest_ip,
        type: 'img',
        srcImg:
          'assets/images/' +
          data?.dest_geoip?.geo?.country_iso_code?.toLowerCase() +
          '.svg',
      },
      {
        key: 'Mitre Techniques',
        value: data?.mitre_techniques?.toString(),
        type: 'area',
      },
    ] as DetailField[];

  dnsDetails = (data: any) =>
    [
      { key: 'UID', value: data?.uid, type: 'text' },
      { key: 'Date', value: data?.['@timestamp'], type: 'text' },
      { key: 'Title', value: data?.alert?.signature, type: 'text' },
      { key: 'RR Name', value: data?.query, type: 'text' },
      { key: 'Q Type Name', value: data?.qtype_name, type: 'text' },
      { key: 'Trans ID', value: data?.trans_id, type: 'text' },
      { key: 'R Code', value: data?.rcode, type: 'text' },
      { key: 'R Code Name', value: data?.rcode_name, type: 'text' },
      { key: 'AA', value: data?.AA, type: 'text' },
      { key: 'TC', value: data?.TC, type: 'text' },
      { key: 'RD', value: data?.RD, type: 'text' },
      { key: 'RA', value: data?.RA, type: 'text' },
      { key: 'Z', value: data?.Z, type: 'text' },
      { key: 'Q Class ', value: data?.qclass, type: 'text' },
      { key: 'Q Class Name', value: data?.qclass_name, type: 'text' },
      { key: 'Q RTT', value: data?.rtt, type: 'text' },
      { key: 'Answers', value: data?.answers?.join(', '), type: 'text' },
      { key: 'TTLs', value: data?.TTLs?.join(', '), type: 'text' },
      { key: 'Protocol', value: data?.proto?.toUpperCase(), type: 'text' },
      { key: 'Src Port', value: data?.src_port, type: 'text' },
      { key: 'Dest Port', value: data?.dest_port, type: 'text' },
      {
        key: 'Offender',
        value: data?.src_ip,
        type: 'img',
        srcImg: `assets/images/${data?.src_geoip?.geo?.country_iso_code?.toLowerCase()}.svg`,
      },
      {
        key: 'Victim',
        value: data?.dest_ip,
        type: 'img',
        srcImg: `assets/images/${data?.dest_geoip?.geo?.country_iso_code?.toLowerCase()}.svg`,
      },
      { key: 'Rejected', value: data?.rejected, type: 'text' },
    ] as DetailField[];

  sshDetails = (data: any) =>
    [
      { key: 'Date', value: data?.['@timestamp'], type: 'text' },
      { key: 'UID', value: data?.uid, type: 'text' },
      { key: 'Src IP', value: data?.['id.orig_h'], type: 'text' },
      { key: 'Src Port', value: data?.['id.orig_p'], type: 'text' },
      { key: 'Dest IP', value: data?.['id.resp_h'], type: 'text' },
      { key: 'Dest Port', value: data?.['id.resp_p'], type: 'text' },
      { key: 'Version', value: data?.version, type: 'text' },
      { key: 'Auth Success', value: data?.auth_success, type: 'text' },
      { key: 'Auth Attempts', value: data?.auth_attempts, type: 'text' },
      { key: 'Client', value: data?.client, type: 'text' },
      { key: 'Server', value: data?.server, type: 'text' },
      { key: 'Cipher Alg', value: data?.cipher_alg, type: 'text' },
      { key: 'MAC Alg', value: data?.mac_alg, type: 'text' },
      { key: 'Compression Alg', value: data?.compression_alg, type: 'text' },
      { key: 'Key Exchange Alg', value: data?.kex_alg, type: 'text' },
      { key: 'Host Key Alg', value: data?.host_key_alg, type: 'text' },
      { key: 'Host Key', value: data?.host_key, type: 'text' },
      { key: 'Hassh Version', value: data?.hasshVersion, type: 'text' },
      { key: 'Hassh', value: data?.hassh, type: 'text' },
      { key: 'Hassh Server', value: data?.hasshServer, type: 'text' },
      { key: 'CSHKA', value: data?.cshka, type: 'text' },
      { key: 'Hassh Algorithms', value: data?.hasshAlgorithms, type: 'text' },
      {
        key: 'Hassh Server Algorithms',
        value: data?.hasshServerAlgorithms,
        type: 'text',
      },
      // { key: 'Offender', value: data?.src_ip, type: 'img', srcImg: 'assets/images/' + data?.src_geoip?.geo?.country_iso_code?.toLowerCase() + '.svg' },
      // { key: 'Victim', value: data?.dest_ip, type: 'img', srcImg: 'assets/images/' + data?.dest_geoip?.geo?.country_iso_code?.toLowerCase() + '.svg' },
    ] as DetailField[];

  tlsDetails = (data: any) =>
    [
      { key: 'Date', value: data?.['@timestamp'], type: 'text' },
      { key: 'Protocol', value: data?.proto, type: 'text' },
      {
        key: 'Validation Status',
        value: data?.validation_status,
        type: 'text',
      },
      {
        key: 'Established',
        value: data?.established ? 'Yes' : 'No',
        type: 'text',
      },
      { key: 'Resumed', value: data?.resumed ? 'True' : 'false', type: 'text' },
      { key: 'Cipher Suite', value: data?.cipher, type: 'text' },
      { key: 'Curve Algorithm', value: data?.curve, type: 'text' },
      {
        key: 'Certificate Chain Fingerprints',
        value: data?.cert_chain_fps,
        type: 'text',
      },
      {
        key: 'Client Certificate Chain Fingerprints',
        value: data?.client_cert_chain_fps,
        type: 'text',
      },
      { key: 'Point Formats', value: data?.point_formats, type: 'text' },
      {
        key: 'Signature Algorithms',
        value: data?.sigalgs?.join(', '),
        type: 'text',
      },
      {
        key: 'Hash Algorithms',
        value: data?.hashalgs?.join(', '),
        type: 'text',
      },
      { key: 'SSL History', value: data?.ssl_history, type: 'text' },
      { key: 'Next Protocol', value: data?.next_protocol, type: 'text' },
      { key: 'Original ALPN', value: data?.orig_alpn, type: 'text' },
      {
        key: 'Validation Status of CT Logs',
        value: data?.valid_ct_logs,
        type: 'text',
      },
      {
        key: 'Validation Status of CT Operators',
        value: data?.valid_ct_operators,
        type: 'text',
      },
      { key: 'Client IP', value: data?.src_ip, type: 'text' },
      { key: 'Client Port', value: data?.src_port, type: 'text' },
      {
        key: 'Client Location',
        value: data?.src_geoip?.geo?.country_name,
        type: 'text',
      },
      { key: 'JA3 Fingerprint', value: data?.ja3, type: 'text' },
      { key: 'Client Version', value: data?.client_version, type: 'text' },
      {
        key: 'Client Ciphers',
        value: data?.client_ciphers?.join(', '),
        type: 'text',
      },
      {
        key: 'Client Supported Versions',
        value: data?.client_supported_versions?.join(', '),
        type: 'text',
      },
      {
        key: 'Client Key Share Groups',
        value: data?.client_key_share_groups?.join(', '),
        type: 'text',
      },
      {
        key: 'Client Curves',
        value: data?.client_curves?.join(', '),
        type: 'text',
      },
      {
        key: 'Client Compression Methods',
        value: data?.client_comp_methods?.join(', '),
        type: 'text',
      },
      {
        key: 'Client Extensions',
        value: data?.ssl_client_exts?.join(', '),
        type: 'text',
      },
      { key: 'Server IP (Destination)', value: data?.dest_ip, type: 'text' },
      { key: 'Server Port', value: data?.dest_port, type: 'text' },
      {
        key: 'Server Location',
        value: data?.dest_geoip?.geo?.country_name,
        type: 'text',
      },
      { key: 'JA3S Fingerprint', value: data?.ja3s, type: 'text' },
      { key: 'Server Version', value: data?.server_version, type: 'text' },
      {
        key: 'Server Extensions',
        value: data?.ssl_server_exts?.join(', '),
        type: 'text',
      },
      {
        key: 'PSK Key Exchange Modes',
        value: data?.psk_key_exchange_modes,
        type: 'text',
      },
    ] as DetailField[];

  httpDetails = (data: any) =>
    [
      { key: 'Date', value: data?.timestamp, type: 'text' },
      {
        key: 'Offender',
        value: data?.src_ip,
        type: 'img',
        srcImg:
          'assets/images/' +
          data?.src_geoip?.geo?.country_iso_code?.toLowerCase() +
          '.svg',
      },
      { key: 'Offender Port', value: data?.src_port, type: 'text' },
      {
        key: 'Victim',
        value: data?.dest_ip,
        type: 'img',
        srcImg:
          'assets/images/' +
          data?.dest_geoip?.geo?.country_iso_code?.toLowerCase() +
          '.svg',
      },
      { key: 'Victim Port', value: data?.dest_port, type: 'text' },
      { key: 'HTTP Method', value: data?.http?.http_method, type: 'text' },
      {
        key: 'HTTP Protocol Version',
        value: data?.http?.protocol,
        type: 'text',
      },
      {
        key: 'Protocol',
        value: data?.proto,
        type: 'text',
      },
      { key: 'Status Code', value: data?.http?.status, type: 'text' },
      {
        key: 'HTTP Content-Type',
        value: data?.http?.http_content_type,
        type: 'text',
      },
      { key: 'HTTP Referer', value: data?.http?.http_refer, type: 'text' },
      { key: 'HTTP Body Length', value: data?.http?.length, type: 'text' },
      { key: 'User Agent', value: data?.http?.http_user_agent, type: 'text' },
      {
        key: 'User Agent Name',
        value: data?.http?.user_agent?.name,
        type: 'text',
      },
      {
        key: 'User Agent OS',
        value: data?.http?.user_agent?.os?.full,
        type: 'text',
      },
      {
        key: 'User Agent OS Version',
        value: data?.http?.user_agent?.os?.version,
        type: 'text',
      },
      {
        key: 'Device Name',
        value: data?.http?.user_agent?.device?.name,
        type: 'text',
      },
      {
        key: 'User Agent Version',
        value: data?.http?.user_agent?.version,
        type: 'text',
      },
    ] as DetailField[];

  fileinfoDetails = (data: any) =>
    [
      { key: 'title', value: data?.alert?.signature, type: 'text' },
      { key: 'Date', value: data?.timestamp, type: 'text' },
      { key: 'Protocol', value: data?.proto?.toUpperCase(), type: 'text' },
      { key: 'Src Port', value: data?.src_port, type: 'text' },
      { key: 'Dest Port', value: data?.dest_port, type: 'text' },
      {
        key: 'Offender',
        value: data?.src_ip,
        type: 'img',
        srcImg:
          'assets/images/' +
          data?.src_geoip?.geo?.country_iso_code?.toLowerCase() +
          '.svg',
      },
      {
        key: 'Victim',
        value: data?.dest_ip,
        type: 'img',
        srcImg:
          'assets/images/' +
          data?.dest_geoip?.geo?.country_iso_code?.toLowerCase() +
          '.svg',
      },
      {
        key: 'Mitre Techniques',
        value: data?.mitre_techniques?.toString(),
        type: 'area',
      },
    ] as DetailField[];

  rdpDetails = (data: any) =>
    [
      { key: 'Date', value: data?.timestamp, type: 'text' },
      {
        key: 'Offender',
        value: data?.src_ip,
        type: 'img',
        srcImg:
          'assets/images/' +
          data?.src_geoip?.geo?.country_iso_code?.toLowerCase() +
          '.svg',
      },
      { key: 'Offender Port', value: data?.src_port, type: 'text' },
      {
        key: 'Victim',
        value: data?.dest_ip,
        type: 'img',
        srcImg:
          'assets/images/' +
          data?.dest_geoip?.geo?.country_iso_code?.toLowerCase() +
          '.svg',
      },
      { key: 'Victim Port', value: data?.dest_port, type: 'text' },
      { key: 'Protocol', value: data?.proto, type: 'text' },
      { key: 'Flow ID', value: data?.flow_id, type: 'text' },
      { key: 'Community ID', value: data?.community_id, type: 'text' },
    ] as DetailField[];

  smbDetails = (data: any) =>
    [
      { key: 'Date', value: data?.timestamp, type: 'text' },
      {
        key: 'Offender',
        value: data?.src_ip,
        type: 'img',
        srcImg:
          'assets/images/' +
          data?.src_geoip?.geo?.country_iso_code?.toLowerCase() +
          '.svg',
      },
      { key: 'Offender Port', value: data?.src_port, type: 'text' },
      {
        key: 'Victim',
        value: data?.dest_ip,
        type: 'img',
        srcImg:
          'assets/images/' +
          data?.dest_geoip?.geo?.country_iso_code?.toLowerCase() +
          '.svg',
      },
      { key: 'Victim Port', value: data?.dest_port, type: 'text' },
      { key: 'SMB Command', value: data?.smb?.command, type: 'text' },
      {
        key: 'SMB Client Dialects',
        value: data?.smb?.client_dialects,
        type: 'text',
      },
      { key: 'SMB Client GUID', value: data?.smb?.client_guid, type: 'text' },
      { key: 'SMB Dialect', value: data?.smb?.dialect, type: 'text' },
      { key: 'SMB Session ID', value: data?.smb?.session_id, type: 'text' },
      { key: 'SMB Tree ID', value: data?.smb?.tree_id, type: 'text' },
      { key: 'SMB ID', value: data?.smb?.id, type: 'text' },
      { key: 'SMB Server GUID', value: data?.smb?.server_guid, type: 'text' },
      { key: 'Protocol', value: data?.proto, type: 'text' },
    ] as DetailField[];

  krb5Details = (data: any) =>
    [
      { key: 'Date', value: data?.timestamp, type: 'text' },
      {
        key: 'Client',
        value: data?.src_ip,
        type: 'img',
        srcImg:
          'assets/images/' +
          data?.src_geoip?.geo?.country_iso_code?.toLowerCase() +
          '.svg',
      },
      { key: 'Client Port', value: data?.src_port, type: 'text' },
      {
        key: 'Server',
        value: data?.dest_ip,
        type: 'img',
        srcImg:
          'assets/images/' +
          data?.dest_geoip?.geo?.country_iso_code?.toLowerCase() +
          '.svg',
      },
      { key: 'Server Port', value: data?.dest_port, type: 'text' },
      { key: 'KRB5 Message Type', value: data?.krb5?.msg_type, type: 'text' },
      { key: 'KRB5 Client Name', value: data?.krb5?.cname, type: 'text' },
      { key: 'KRB5 Service Name', value: data?.krb5?.sname, type: 'text' },
      { key: 'KRB5 Realm', value: data?.krb5?.realm, type: 'text' },
      {
        key: 'KRB5 Encryption Type',
        value: data?.krb5?.encryption,
        type: 'text',
      },
      {
        key: 'Weak Encryption',
        value: data?.krb5?.weak_encryption,
        type: 'text',
      },
      { key: 'Protocol', value: data?.proto, type: 'text' },
    ] as DetailField[];

  expandableDetailsData(data: any, protocolIndex: ProtocolIndex) {
    const protocolDetails = {
      [ProtocolIndex.alert]: this.alertDetails(data),
      [ProtocolIndex.dns]: this.dnsDetails(data),
      [ProtocolIndex.ssh]: this.sshDetails(data),
      [ProtocolIndex.tls]: this.tlsDetails(data),
      [ProtocolIndex.http]: this.httpDetails(data),
      [ProtocolIndex.fileinfo]: this.fileinfoDetails(data),
      [ProtocolIndex.rdp]: this.rdpDetails(data),
      [ProtocolIndex.smb]: this.smbDetails(data),
      [ProtocolIndex.krb5]: this.krb5Details(data),
      [ProtocolIndex.ssl]: this.tlsDetails(data),
    };
    return protocolDetails[protocolIndex];
  }
}
