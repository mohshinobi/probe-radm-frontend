import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {HighchartsNode} from '@core/interfaces/highcharts-node.interface';
import {HighchartsLink} from '@core/interfaces/highcharts-link.interface';
import {HeatChart} from '@core/interfaces/charts/heat-map.interface';
import {ProtocolInfo} from '@core/interfaces/protocol-info.interface';
import { proxyPath } from '@configs/api-url.config';

const _webApi = proxyPath.web;
@Injectable({
  providedIn: 'root',
})
export class TopologyService {
  private _zeekConnIndex = 'logstash-zeek-conn-*';

  private colorProto = {
    tcp: '#f44949',
    udp: '#94da30',
    icmp: '#9999ff',
    tls: '#f2d000',
    http: '#9999ff',
    failed: '#f44949',
    dns: '#f89200',
    smtp: '#ec72eb',
    smb: '#019c76',
    snmp: '#28baeb',
    ftp: '#526aff',
    other: '#bebebe',
    others: '#bebebe',
    disabled: '#565656',
    unknown: '#ADD8E6',
  };

  lineWidth: number = 5; // width of the stroke for the circle nodes

  constructor(private _http: HttpClient) {}

  /**
   * return the hex color with the given list of protocols
   */
  getColorProtocol(proto: any[]): string {
    // return the default protocol value if the array is empty
    if (proto.length == 0) return this.colorProto.unknown;

    const protoString: string = proto[0].toLowerCase(); // TODO: find the right way to choose the color protocols from the array

    for (const [index, [key, value]] of Object.entries(
      Object.entries(this.colorProto)
    )) {
      if (key === protoString) {
        return value;
      }
    }
    return this.colorProto.unknown;
  }

  getSankeyChartData(
    interval: number,
    maxNode: number,
    maxLinksByNode: number,
    maxProto: number
  ): Observable<any[]> {
    return this._http.get<any[]>(_webApi + `/sankey_chart`, {
      params: {
        index: this._zeekConnIndex,
        'fieldAggregation[]': [
          'src_ip.keyword',
          'dest_ip.keyword',
          'proto.keyword',
        ],
        interval,
        'sizeAggregation[]': [maxNode, maxLinksByNode, maxProto],
      },
    });
  }

  transformSankeyDataResponse = (
    response: any[]
  ): { nodes: HighchartsNode[]; links: HighchartsLink[] } => {
    const nodesMap: { [macAddress: string]: HighchartsNode } = {};
    const linksMap: { [key: string]: HighchartsLink } = {};

    response.forEach((linkData) => {

      const [from, to, count, protocols] = linkData;
      const data = {
          from : linkData[0] ?? null,
          to : linkData[1] ?? null,
          count : linkData[2] ?? 0,
          protocols : linkData[3] ?? [],
      }
      if (!nodesMap[from]) {
        nodesMap[from] = {
          id: from,
          hostName: '',
          status: false,
          color: '#5D737E', // color for circle source mac
          marker: {
            radius: this.getRadiusFromCount(count), // calculate radius from count
            symbol: 'circle',
            lineWidth: this.lineWidth,
            lineColor: '#87BBA2', // stroke or border for source mac
          },
          macAdress: from,
          os: '',
          ipAdress: '',
          securityScore: 0,
          nbAlerts: 0,
          data:data
        };
      }
      if (!nodesMap[to]) {
        nodesMap[to] = {
          id: to,
          hostName: '',
          status: false,
          color: '#8797AF', // color for circle destination mac
          marker: {
            radius: this.mapCountToWidth(count), // calculate radius from count
            symbol: 'circle',
            lineWidth: this.lineWidth,
            lineColor: '#56667A', // stroke or border for source destincation
          },
          macAdress: to,
          os: '',
          ipAdress: '',
          securityScore: 0,
          nbAlerts: 0,
          data:data
        };
      }

      const linkKey = `${from}-${to}`; // key for lins from to

      if (linksMap[linkKey]) {
        linksMap[linkKey].protocol += `, ${protocols}`;
        linksMap[linkKey].count += count;
        linksMap[linkKey].width = this.mapCountToWidth(linksMap[linkKey].count);
      } else {
        linksMap[linkKey] = {
          from: from,
          to: to,
          count,
          protocol: protocols,
          width: this.mapCountToWidth(count),
          color: this.getColorProtocol(protocols),
          dataLabels: {
            enabled: true,
            format: '{point.protocol}',
          },
        };
      }
    });

    return { nodes: Object.values(nodesMap), links: Object.values(linksMap) };
  };

  private mapCountToWidth(count: number): number {
    const minWidth = 1;
    const maxWidth = 1;
    return Math.min(maxWidth, Math.max(minWidth, count / 100));
  }

  private getRadiusFromCount(count: number): number {
    const log = Math.log(count) * 2;
    return log == 0 ? 1000 : log;
  }

  getSankeyData(interval: number) {
    return this._http
      .get<any[]>(_webApi+`/sankey_chart`, {
        params: {
          index: this._zeekConnIndex,
          'fieldAggregation[]': [
            'src_ip.keyword',
            'dest_ip.keyword',
            'proto.keyword',
          ],
          'sizeAggregation[]': ['10', '2', '2'],
          timeInterval: interval.toString(),
        },
      })
      .pipe(catchError(() => of([])));
  }

  getHeatmapData() {
    return this._http
      .get<any[]>(_webApi+`/dynamic-aggregation`, {
        params: {
          index: this._zeekConnIndex,
          'fieldAggregation[]': [
            'orig_l2_addr.keyword',
            'proto.keyword',
            'orig_ip_bytes',
          ],
          aggregationType: 'sum',
          fieldToAggregate: 'orig_bytes',
          histoInterval: '1',
          timeInterval: 12,
        },
      })
      .pipe(
        map((response) => {
          return this.formatToHeatChart(response);
        }),
        catchError(() => {
          return of({
            title: '',
            xAxis: [],
            yAxis: [],
            data: [],
            stops: [],
            tickPositions: []
          });
        })
      );
  }



  private getLast12hours() {
    const now = new Date();
    // get the actual hour with 00 minutes
    now.setMinutes(0);
    // return the list of last 12 hours in reverse order from now
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now);
      date.setHours(date.getHours() - i);
      // return on human readable format (dd-mm-yyyy hh:mm)
      return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}h`;
    })
  }

  private formatToHeatChart(response: any): HeatChart {
    const data = response.data;

    if (!Array.isArray(data)) {
      return {
        title: '',
        xAxis: [],
        yAxis: [],
        data: [],
        height: '600px',
        stops: undefined,
        tickPositions: undefined,
      };
    }

    let xAxis: string[] = [];
    let yAxis: string[] = this.getLast12hours().reverse();
    let mapData: any[] = [];

    data.sort((a: any, b: any) => a.key - b.key);

    data.forEach((hourlyData: any, index: number) => {
      const yIndex = index % 12;

      hourlyData.by_source_mac.buckets.forEach((macData: any) => {
        const macAddress = macData.key;

        if (!xAxis.includes(macAddress)) {
          xAxis.push(macAddress);
        }

        let totalTraffic = 0;
        let protocols: ProtocolInfo[] = [];

        macData.by_protocol.buckets.forEach((protocolData: any) => {
          const traffic = protocolData.total_traffic?.value || 0;
          totalTraffic += traffic;

          protocols.push({
            protocol: protocolData.key,
            value: traffic,
          });
        });

        const xIndex = xAxis.indexOf(macAddress);

        mapData.push({
          x: xIndex,
          y: yIndex,
          value: totalTraffic,
          protocols: protocols,
        });
      });
    });


    return {
      title: '',
      xAxis: xAxis,
      yAxis: yAxis,
      data: mapData,
      stops: undefined,
      tickPositions: undefined,
      height: '500px'
    };
  }
}
