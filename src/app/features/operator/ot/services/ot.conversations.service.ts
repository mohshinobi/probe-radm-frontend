
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { FormControl, FormGroup } from "@angular/forms";
import { BaseField} from "@shared/components/form/fields";
import { TableCellTypeEnum } from "@core/enums";
import {  OtAsset , OtConversation, QueryConvParams, QueryParams} from './interface';
import { Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ApiResponse } from '@core/interfaces/api-response.interface';
import { TextField, DateField } from '@shared/components/form/fields';
import { TableColumnInterface } from '@core/interfaces';
import { buildHttpParams2 } from '../../../../core/services/buildHttpParams';
import { ToastrService } from 'ngx-toastr';
import { generateIdAsset } from '@features/operator/ot/ot.utility';
import { proxyPath } from '@configs/api-url.config';

const _manageApi = proxyPath.management;
const _webApi = proxyPath.web;

export class OTServiceConversations {
  router = inject(Router)
  toast = inject(ToastrService);
  private _http = inject(HttpClient);
  private index = "logstash-ot-tshark-*";
  displayedColumns : string[] = [
    '@timestamp',
    'src_ip',
    'dest_ip',
    'layers.eth.eth_eth_src' ,
    'layers.eth.eth_eth_dst',
    'protocols',
    'zones',
    'alert' ,
    'layers.frame.frame_frame_protocols'
  ];

  getOrderTablesColumns() :TableColumnInterface[] {
    return [
      { name: 'Date', dataKey: '@timestamp', type: TableCellTypeEnum.DATE },
      { name: 'Ip_src', dataKey: 'src_ip', type: TableCellTypeEnum.HTML },
      { name: 'Ip_dest', dataKey: 'dest_ip', type: TableCellTypeEnum.HTML },
      { name: 'Mac_src', dataKey: 'layers.eth.eth_eth_src', type: TableCellTypeEnum.TEXT },
      { name: 'Mac_dest', dataKey: 'layers.eth.eth_eth_dst', type: TableCellTypeEnum.TEXT },
      { name: 'Protocol', dataKey: 'layers.frame.frame_frame_protocols', type: TableCellTypeEnum.TEXT },
      { name: 'Zones', dataKey: 'zones', type: TableCellTypeEnum.HTML , isSortable:false, filtarable:false },
      { name: 'Alert', dataKey: 'alert', type: TableCellTypeEnum.TEXT , isSortable:false, filtarable:false },
      {
        name: 'Actions',
        dataKey: 'actions',
        type: TableCellTypeEnum.ACTIONS,
        isSortable: false,
        actions: [
          { name:'detail', icon: 'visibility' , label:'Details' },
        ]
      }
    ];
  }

  getAllAssets(): Observable<ApiResponse<OtAsset>> {
    return this._http.get<ApiResponse<any>>(_manageApi+`/ot/assets?size=10000&page=1`).pipe(
      map((response) => ({
        ...response,
        data: response.data.map((asset: any) => ({
          id: asset['id'] ?? null,
          type: asset['type'] ?? null,
          product_commercial_name: asset['productcommercialname'] ?? null,
          productcommercialname: asset['productcommercialname'] ?? null,
          ics_name: asset['are2version'] ?? null,
          nom_client_usuel: asset['nomclientusuel'] ?? null,
          firmware_version: asset['firmwareversion'] ?? null,
          mac_address: asset['macaddress'],
          ip_address: asset['ipaddress'],
          robustesse: parseFloat(asset['robustesse'] ?? null),
          criticity: asset['criticity'] ?? null,
          belonging_zone: asset['belongingzone'] ?? null,
          champs_descriptif: asset['champsdescriptif'] ?? null,
        })),
      })),
      catchError(error => {
        this.toast.error("Failed fetching conversations", "Api Error");
        console.error("Error HTTP:", error);
        return [];
      })
    );
  }

  /**
   * Return the complete paginated conversation objects
   * also includes the assets informations from the list of assets
   * @param params
   * @returns
   */
  getTableConversations(params: QueryConvParams): Observable<ApiResponse<OtConversation[]>> {

    let paramsBuild = buildHttpParams2(this.index, params);

    return forkJoin({
      assets : this.getAllAssets() ?? [],
      conversations: this._http.get<ApiResponse<any[]>>(_webApi+`/documents`, { params: paramsBuild })
    }).pipe(
      map( (response:any) => {
        const assets = response.assets.data;
        const conversations = response.conversations;

        if( conversations.data.length > 0 &&  assets.length > 0 ) {
          [...conversations.data].map( (conversation: OtConversation , index:number) => {
            const srcIp = conversation.src_ip;
            const dstIp = conversation.dest_ip;
            const srcMac = conversation.layers?.eth.eth_eth_src;
            const dstMac = conversation.layers?.eth.eth_eth_dst;
            const assetSource = this.findAssetById(srcIp,srcMac, assets); // fill the asset src from the list of assets
            const assetDestination = this.findAssetById(dstIp,dstMac, assets);// fill the asset dest from the list of assets
            const protocolExtracted = this.extractProtocol(conversation.layers?.frame.frame_frame_protocols);
            conversation.asset_src = assetSource;  // add the asset source
            conversation.asset_dest = assetDestination;  // add the asset destination
            conversation.zones = this.getSpanCopZoneProto(assetSource,assetDestination,protocolExtracted);

          })
        }
        return conversations as ApiResponse<OtConversation[]>;
      }
      ),
      catchError(error => {
        this.toast.error("Failed fetching conversations", "Api Error");
        console.error("Error HTTP:", error);
        return [];
      })
    )
  }
  /**
   * extract the real proto must be the last exept data
   * the protocol is the last value and it must not be 'data'
   * @param str
   * @returns
   */
  extractProtocol(str?:string):string{
    str = str ? str.toLowerCase() : '' ;
    let array:string[] = str.split(':') ?? [];
    // try extract the protocol from the list
    let lastProto = array[array.length - 1] ?? undefined ;
    // the protocol is the last value and it must not be 'data'
    return  lastProto.includes('data') ? (array[array.length - 2] ?? undefined) : lastProto;
  }
/**
 * Return a html base to represent conversations
 * @param src
 * @param dest
 * @param proto
 * @returns
 */
getSpanCopZoneProto(src:any, dest:any,proto:string):string{
    const emojis  = {notFound : "&#x2753;",bulb : "&#x1F4A1;",arrowRight : "&#x27A1;"};
    // add the zones conversation src > dest "&#x2754;" is the emoji interogation and  &#x27A1; is the emoji arrow right
    const zoneSrc = src?.belonging_zone ?   `<span class="text-yellow">${src.belonging_zone}</span>`  : emojis.notFound ;
    const zoneDst = dest?.belonging_zone ?   `<span class="text-yellow">${dest.belonging_zone}</span>`  : emojis.notFound;
    return `${zoneSrc} ${emojis.arrowRight} ${zoneDst}`;

  }

  /**
   * Return the first asset in the list matching the given IP and MAC address.
   * @param ip
   * @param mac
   * @param array
   * @returns
   */
  findAssetById(ip: string | undefined, mac: string | undefined, array: any[]): OtAsset | null {
    return array.find((item: OtAsset) => item.ip_address === ip && item.mac_address === mac) ?? null;
  }
  /**
   * Create a string for quering the api url
   * @param params
   * @returns
   */
  getParamsQuery(params: QueryParams):string{
    const size :number = params.size ?? 10;
    const page :number = params.page ?? 1;
    let paramsQuery :string = `&size=${size}&page=${page}`;
    for (const [key, value] of Object.entries(params)) {
      if(key !== 'page' && key !== 'size' && key !== 'display_col' && key !== 'layers.frame.frame_frame_protocols' && value !== undefined && value !== null){
        paramsQuery += `&filter[${key}]=${value}`;
      }
      if(key == 'layers.frame.frame_frame_protocols'){
        paramsQuery += `&match[${key}]=${value}`;
      }
    }
    return paramsQuery;
  }

  getDisplayedColumns():string[] {
    return this.displayedColumns;
  }

  getFormFields(): BaseField<any>[] {
    const endDate = new Date();
    const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 24);
    const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;

    const form: BaseField<any>[] = [
      // daterange
      new DateField({key: 'startDate',label: 'From',value: startDateStr}),
      new DateField({key: 'endDate',label: 'To',value: endDateStr}),
      // protocol
      new TextField({key: 'layers.frame.frame_frame_protocols',label: 'Protocols' }),
      // source filter
      new TextField({key: 'src_ip',label: 'Ip Source'}),
      new TextField({key: 'layers.eth.eth_eth_src',label: 'Mac source'}),
      // destination filter
      new TextField({key: 'dest_ip',label: 'Ip Destination'}),
      new TextField({key: 'layers.eth.eth_eth_dst',label: 'Mac Destination'})

    ]
    return form.sort((a, b) => a.order - b.order);
}

  getFormConvGroup(): FormGroup<any> {
    const group: any = {};
    this.getFormFields().forEach(field => {
        group[field.key] = new FormControl(field.value || '', field.validation.constraints)
    });
    return new FormGroup(group);
  }

  /**
   * Return a single conversation object by his _id
   * @param id
   * @returns
   */
  getSingleConversation(id?:string): Observable<OtConversation>{
    // const assets = this._http.get<ApiResponse<OtAsset[]>>(_webApi+`/ot/topology/assets?size=10000`);// returns all the assets
    const assets = this.getAllAssets();// returns all the assets
    const conversations=  this._http.get<ApiResponse<OtConversation[]>>(_webApi+`/document?index=${this.index}&match[_id]=${id}&size=1`).pipe(
      catchError(error => {
        this.toast.error("Failed fetching conversations", "Api Error");
        console.error("Error HTTP:", error);
        return [];
      })
    );
    // search the wanted conversation with the given id
    return forkJoin([assets ,conversations]).pipe(
      switchMap(([assets, conversations]) => {

        const assetsList = assets?.data;
        const conversation : any = conversations?.data[0]; // get the single data conversation
        const time: string = conversation?.layers?.frame?.frame_frame_time ?? '';
        const timeFrame = new Date() ; // get the date from frame time for later use
        // calcualte the last 1 hours from the frame time
        const timeFrameLastHour = new Date(time) ;
        timeFrameLastHour.setHours(timeFrameLastHour.getHours() - 1);
        // calcualte the last 1 minutes from the frame time
        const timeFrameLast1Minutes = new Date(time) ;
        timeFrameLast1Minutes.setMinutes(timeFrameLastHour.getMinutes() - 1);
        // calcualte the last 5 minutes from the frame time
        const timeFrameLast5Minutes = new Date(time) ;
        timeFrameLast5Minutes.setMinutes(timeFrameLastHour.getMinutes() - 5);
        // calcualte the last 15 minutes from the frame time
        const timeFrameLast15Minutes = new Date(time) ;
        timeFrameLast15Minutes.setMinutes(timeFrameLastHour.getMinutes() - 15);

        const timeRangeForHistory = `&startDate=${this.getFormat(timeFrameLastHour)}&endDate=${this.getFormat(timeFrame)}`; // construct the query string for the range

        const srcIp = conversation.src_ip;
        const dstIp = conversation.dest_ip;
        const srcMac = conversation.layers?.eth.eth_eth_src;
        const dstMac = conversation.layers?.eth.eth_eth_dst;
        const assetSource = this.findAssetById(srcIp,srcMac, assetsList); // fill the asset src from the list of assets
        const assetDestination = this.findAssetById(dstIp,dstMac, assetsList);// fill the asset dest from the list of assets

        conversation.asset_src = assetSource;  // add the asset source
        conversation.asset_dest = assetDestination;  // add the asset destination
        conversation.zones = `${ assetSource?.belonging_zone ?? undefined } > ${assetDestination?.belonging_zone ?? undefined}`;

        // construct the object for history calculation use needed
        conversation.history = {
          timeRange : timeRangeForHistory,
          last60Minutes : 0,
          bw : {
            last1Minutes : 0 ,
            last5Minutes : 0 ,
            last15Minutes : 0
          },
          payloads : {
            last1Minutes : 0 ,
            last5Minutes : 0 ,
            last15Minutes : 0
          }
        };

        // do others calculation based on the forkJoin response
        return this._http.get(_webApi+`/document?index=${this.index}&size=1000${timeRangeForHistory}`).pipe(
          map((response:any) => {
            const conversationHisto : OtConversation[] = response?.data ?? [];
            // loop for every data and sum the frame lenght
            conversationHisto.forEach( (tram:OtConversation) => {
              const frameLenght : number = Number(tram.layers?.frame?.frame_frame_len) || 0; // size of the frame
              const currentTimeFrame = new Date(tram?.layers?.frame?.frame_frame_time ?? '') ; // time for frame
              const ipLen : number = tram?.layers?.ip?.ip_ip_len ? Number(tram?.layers?.ip?.ip_ip_len) : 0; // ip lenght ??
              const ipHdrLen : number = tram?.layers?.ip?.ip_ip_hdr_len ? Number(tram?.layers?.ip?.ip_ip_hdr_len) : 0; // ip hdr lenght ??
              conversation.history.last60Minutes += frameLenght; // sum the frame for last 60 minutes
              // sum frame lenght for last 15 minutes
              if(currentTimeFrame >= timeFrameLast15Minutes){
                conversation.history.bw.last15Minutes += frameLenght; // sum the frame
                conversation.history.payloads.last15Minutes += (ipLen - ipHdrLen); // calculate the utility charge
                // sum frame lenght for last 5 minutes
                if(currentTimeFrame  >=  timeFrameLast5Minutes){
                  conversation.history.bw.last5Minutes += frameLenght; // sum the frame
                  conversation.history.payloads.last5Minutes += (ipLen - ipHdrLen);// calculate the utility charge
                  // sum frame lenght for last 1 minute
                  if(currentTimeFrame  >=  timeFrameLast1Minutes){
                    conversation.history.bw.last1Minutes += frameLenght; // sum the frame
                    conversation.history.payloads.last1Minutes += (ipLen - ipHdrLen); // calculate the utility charge
                  }
                }
              }
            })
            conversation.history.payloads.last1Minutes = (conversation.history.payloads.last1Minutes  / 60).toFixed(2); // calculate payloads for last 1 minute
            conversation.history.payloads.last5Minutes = (conversation.history.payloads.last5Minutes / (60 * 5)).toFixed(2) ; // calculate payloads for last 5 minute
            conversation.history.payloads.last15Minutes = (conversation.history.payloads.last15Minutes / (60 * 15)).toFixed(2); // calculate  payloads for last 15 minute
            conversation.history.bw.last1Minutes = ((conversation.history.bw.last1Minutes * 8) / 60).toFixed(2); // calculate for last 1 minute
            conversation.history.bw.last5Minutes = ((conversation.history.bw.last5Minutes * 8 )/ (60 * 5)).toFixed(2) ; // calculate for last 5 minute
            conversation.history.bw.last15Minutes = ((conversation.history.bw.last15Minutes * 8 )/ (60 * 15)).toFixed(2); // calculate for last 15 minute
            return conversation;
          })
        )
        }
      )
    )
  }

    /**
     * Returns the list of conversations between assets
     * @returns
     */
    getLinksForTopology(limit:number = 50): Observable<any[]> {
      return this._http.get<any>(_webApi+`/aggs/composite` ,{
        params: {
          index : "logstash-ot-tshark-*",
          'fieldAggsComposite[]' : [
            'src_ip.keyword' ,
            'dest_ip.keyword',
            'layers.eth.eth_eth_src.keyword',
            'layers.eth.eth_eth_dst.keyword',
            'layers.frame.frame_frame_protocols.keyword'
          ],
          size : limit
        }
      }).pipe(
        map((res:any) => {
          if(!res.data){
            return [] as  string[];
          }
          return [...res.data].map((conversation: any) => {
            const ipv4Src = conversation?.key["src_ip.keyword"];
            const ipv4Dest = conversation?.key["dest_ip.keyword"];
            const macSrc = conversation?.key["layers.eth.eth_eth_src.keyword"];
            const macDest = conversation?.key["layers.eth.eth_eth_dst.keyword"];
            const protocolsRaw = conversation?.key["layers.frame.frame_frame_protocols.keyword"].toLowerCase();
            // get the true protocol the last key without data
            let lastProtocol = this.extractProtocol(conversation?.key["layers.frame.frame_frame_protocols.keyword"]);

            const idSrc = generateIdAsset(ipv4Src,macSrc);
            const idDest = generateIdAsset(ipv4Dest,macDest);
            return {
              from: idSrc, // id asset source
              to: idDest, // id asset to destination,
              protocols: lastProtocol,
              protocolsRaw,
              assetSrc: {
                id: idSrc, // calculate the id from base64(ipv4-mac_adresse)
                ip: ipv4Src, // ip source,
                mac: macSrc, // ip source
              },
              assetDest: {
                id: idDest, // calculate the id from base64(ipv4-mac_adresse)
                ip: ipv4Dest, // ip destination,
                mac: macDest, // ip destination,
              }
            } ;
          });
        }),
        catchError(error => {
          this.toast.error("Failed fetching conversations", "Api Error");
          console.error("Error HTTP:", error);
          return of([]);
        })
      );
    }

/**
 *
 */
  getAlertsOtByConversation(
    ipSrc:string,
    ipDest:string,
    macSrc:string,
    macDst:string,
    protocol:string
  ):Observable<any>{
    const params =  {
        index : 'logstash-ot-alerts-*',
        size: 10000,
        page: 1,
        'filter[ip_src.keyword]':ipSrc,
        'filter[ip_dst.keyword]':ipDest,
        'filter[mac_src.keyword]':macSrc,
        'filter[mac_dst.keyword]':macDst,
        'filter[protocol.keyword]':protocol.toUpperCase(),
        //'displayedField[]' : '@timestamp,initial_seen,last_seen,protocol,asset_dst,asset_src,ip_src,ip_dst,mac_src,mac_dst,severity,Rule,detection,description'
    };
    return this._http.get(`/api/documents`,{ params});
  }

  getFormat(datetime:Date):string{
      const year =  datetime.getUTCFullYear();
      const month =  this.formatNumber(datetime.getUTCMonth() + 1); // months are from 0-11
      const date =  this.formatNumber(datetime.getUTCDate());
      const hours =  this.formatNumber(datetime.getUTCHours());
      const minutes =  this.formatNumber(datetime.getUTCMinutes());
      const seconds =  this.formatNumber(datetime.getUTCSeconds());
      return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}`;
  }
  formatNumber(number: number): string {
    return number < 10 ? `0${number}` : number.toString();
  }
}
