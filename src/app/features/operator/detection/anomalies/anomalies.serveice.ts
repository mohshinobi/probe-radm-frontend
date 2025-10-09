import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { ApiResponse } from '@core/interfaces/api-response.interface';
import { buildHttpParams2 } from '@core/services/buildHttpParams';
import { HttpClient } from '@angular/common/http';
import { BaseParamsInterface } from '@core/interfaces/base-params.interface';
import { AnomalyInterface } from '@features/operator/detection/interfaces/anomaly.interface';
import { TableColumnInterface } from '@core/interfaces';
import { TableCellTypeEnum } from '@core/enums';
import { AnomalyQueryParamsInterface } from '../interfaces/anomaly-query-params.interface';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DetailField } from '@shared/components/table/detail/detail.component';
import { proxyPath } from '@configs/api-url.config';
import {CommonService} from "@core/services";

const _webApi = proxyPath.web;

@Injectable()
export class AnomaliesService {

    private _weirdIndex: string     = 'logstash-zeek-weird-*';
    private _noticeIndex: string    = 'logstash-zeek-notice-*';
    private _anomaliesIndex: string = 'logstash-zeek-weird-*,logstash-zeek-notice-*';
    private _http = inject(HttpClient);
    private _commonService = inject(CommonService);
    length        = signal(0);

    displayedColumns = [
        '@timestamp',
        'type',
        'src_geoip.geo.country_iso_code',
        'src_ip',
        'dest_ip',
        'dest_port',
        'addl'
    ];

    requestColumns = [
        ...this.displayedColumns,
        'dest_geoip.geo.country_iso_code',
        'src_port',
        'note',
        'msg',
        'sub',
        'proto',
        'conn_count'
    ];

    weirdQueryParams  = signal<AnomalyQueryParamsInterface>({display_col: this.requestColumns, orderBy: 'desc', sortedBy: 'ts', size: 10, type: 'zeek-notice'});

    anomalies = toSignal(
        toObservable(this.weirdQueryParams).pipe(
            switchMap(() =>{
            this.weirdQueryParams().display_col = this.requestColumns;
            return this.getAllAlerts(this.weirdQueryParams())
            .pipe(
                map(response => {
                    this.length.set(response.total);
                    response.data.map((ano: AnomalyInterface) => {
                        if(ano.type === 'zeek-notice'){
                            ano.addl = (ano.msg ?? "") +" "+ (ano?.sub);
                            ano.name =  ano?.note || ano?.name;
                        }
                        ano.ts = (ano.ts ?? 0) * 1000;
                        ano.type = ano.type === 'zeek-notice' ? 'N' : 'W'
                    })
                    return response.data;
                }));
            })
        )
    );

    getAnoType (ano: string){
        return ano === 'N' ? 'Notice' : 'Weird'
    }

    ordersTableColumns: TableColumnInterface[] = [
        {name: 'SEEN', dataKey: '@timestamp', type: TableCellTypeEnum.DATE },
        {name: 'SRC IP', dataKey: 'src_ip', type: TableCellTypeEnum.FLAG },
        {name: 'DEST IP', dataKey: 'dest_ip', type: TableCellTypeEnum.FLAG },
        {name: 'Src PORT', dataKey: 'src_port', type: TableCellTypeEnum.TEXT },
        {name: 'DEST PORT', dataKey: 'dest_port', type: TableCellTypeEnum.TEXT },
        {name: 'Description', dataKey: 'addl', type: TableCellTypeEnum.TEXT, hideContextMenu: true, isSortable: false},
        {name: 'Type', dataKey: 'type', type: TableCellTypeEnum.TEXT},
        {name: 'Note', dataKey: 'note', type: TableCellTypeEnum.TEXT},
        {name: 'Protocol', dataKey: 'proto', type: TableCellTypeEnum.TEXT},
    ];

    tableActions(tableActions: AnomalyQueryParamsInterface) {
        if(tableActions.type === null){
            tableActions.type = this.weirdQueryParams().type;
        }
        this.weirdQueryParams.update(()=>({...this.weirdQueryParams(), ...tableActions}));
    }

    getAllAlerts(queryParams: BaseParamsInterface): Observable<ApiResponse<AnomalyInterface>> {
        let params = buildHttpParams2(this._anomaliesIndex, queryParams);
        return this._http.get<ApiResponse<AnomalyInterface>>(_webApi+'/documents', { params });
    }

    getAnomaliesNumber(time?: number, beginDate?: string, endDate?: string) {
        return this._http.get<any[]>(_webApi+`/pie_chart?index=${this._anomaliesIndex}&fieldAggregation[]=type.keyword&sizeAggregation[]=10`+
          this._commonService.setTime(time, beginDate, endDate)
        );
    }

    getLineNotice(time?: number, beginDate?: string, endDate?: string) {
      return this._http.get<any[]>(_webApi+`/line-area?index=${this._noticeIndex}`+
        this._commonService.setTime(time, beginDate, endDate)
      );
    }

    getLineWeird(time?: number, beginDate?: string, endDate?: string) {
      return this._http.get<any[]>(_webApi+`/line-area?index=${this._weirdIndex}`+
        this._commonService.setTime(time, beginDate, endDate)
      );
    }


    getSankeyNotice(time?: number, beginDate?: string, endDate?: string) {
        return this._http.get<any[]>(_webApi+`/sankey_chart?index=${this._noticeIndex}&fieldAggregation[]=src_ip.keyword&fieldAggregation[]=dest_ip.keyword&sizeAggregation[]=10&sizeAggregation[]=1` +
          this._commonService.setTime(time, beginDate, endDate)
        );
    }

    getSankeyWeird(time?: number, beginDate?: string, endDate?: string) {
        return this._http.get<any[]>(_webApi+`/sankey_chart?index=${this._weirdIndex}&fieldAggregation[]=src_ip.keyword&fieldAggregation[]=dest_ip.keyword&sizeAggregation[]=10&sizeAggregation[]=1`+
          this._commonService.setTime(time, beginDate, endDate)
        );

    }

    getWorldMapSourceData(type: string, time?: number, beginDate?: string, endDate?: string) {
        return this._http.get<any[]>(_webApi+`/map_chart?index=${this._anomaliesIndex}&fieldAggregation[]=${type}_geoip.geo.country_iso_code.keyword&sizeAggregation[]=10`+
        this._commonService.setTime(time, beginDate, endDate)
        )
      }

    anomaliesDetails = (data: any) => [
        { key: 'title', value: data?.msg || data?.addl, type: 'text' },
        { key: 'Date', value: data?.ts, type: 'text' },
        { key: 'Type', value: this.getAnoType(data?.type), type: 'text' },
        { key: 'Protocol', value: data?.proto?.toUpperCase(), type: 'text' },
        { key: 'Src Port', value: data?.src_port, type: 'text' },
        { key: 'Dest Port', value: data?.dest_port, type: 'text' },
        { key: 'Offender', value: data?.src_ip, type: 'img', srcImg: 'assets/images/' + data?.src_geoip?.geo?.country_iso_code?.toLowerCase() + '.svg' },
        { key: 'Victim', value: data?.dest_ip, type: 'img', srcImg: 'assets/images/' + data?.dest_geoip?.geo?.country_iso_code?.toLowerCase() + '.svg' },
        { key: 'Additional Info', value: `${data?.msg || data?.addl} ${data?.sub || ''}`, type: 'area' },
    ] as DetailField[];
}
