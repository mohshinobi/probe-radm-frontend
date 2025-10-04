

import { HttpClient, HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { inject } from '@angular/core';
import { catchError, map, Observable} from 'rxjs';
import { TableColumnInterface } from '@core/interfaces';
import { TableCellTypeEnum } from '@core/enums';
import { FormControl, FormGroup } from '@angular/forms';
import { BaseField, DateField, SelectField, TextField } from '@shared/components/form/fields';
import { ApiResponse } from '@core/interfaces/api-response.interface';
import { proxyPath } from '@configs/api-url.config';
import { criticity } from '../services/interface';

export const detectionValueForAi : string = 'Detected By AI';

const _coreApi  = proxyPath.core;
const _webApi   = proxyPath.web;

interface Assert {
  id: string;
  product_commercial_name: string;
  belonging_zone:string;
  type: string;
}
export interface OtAlert{
  _id:string;
  description	:string;
  protocol :string;
  asset_dst	:string;
  type :string;
  event :string;
  ip_src :string;
  host :{ name :string};
  asset_src :string;
  ip_dst :string;
  severity :number;
  mac_src :string;
  mac_dst :string;
  timestamp :string;
  "@timestamp":string;
  Rule :string;
  initial_seen :string;
  last_seen :string;
  detection :string;
  // AI keys
  protocols? :string;
  predicted_labels?: {key:string, value:number}[];
  adjusted_labels?:{key:string, value:number}[];
  boost_applied?: number;
  related_conversation?: number;
  confidence_score?: number;
  is_deviant: boolean;
  asset_1?: { ip_addr: string; mac_addr: string};
  asset_2?:{ ip_addr: string; mac_addr: string};
  dst_criticity?:string;
  src_client_name?: string;
  dst_client_name?: string;
  deviance_score?: number;
  all_timestamps?: string[];
  conversation_id?: string;
  correlations?: {
    predecessor: {
      asset_src: Assert;
      protocol: string;
      asset_dst: Assert;
    },
    successor: {
      asset_src: Assert;
      protocol: string;
      asset_dst: Assert;
    }
  },
  temporal_analysis?:{
    predecessor_techniques:string[];
    successor_techniques:string[];
  },
  asset_analysis?:{
    base_deviance_score:number;
    final_deviance_score:number;
    boost_applied_percentage:number;
    total_related_conversations:number;
    suspicious_related_conversations:number;
  },
  adjustment_summary?:{
    has_predecessor_techniques: boolean;
    has_successor_techniques: boolean;
    asset_boost_applied: boolean;
    score_increase: number;
  },
  deviant_related_conversations?: number
  alert_title?:string;
}

const paramMapping : { [key: string]: string }= {
  display_col: 'displayedField[]',
  severity:'filter[severity]' ,
  mac_dst: 'filter[mac_dst.keyword]',
  timestamp: 'filter[timestamp.keyword]',
  '@timestamp': 'filter[@timestamp.keyword]',
  initial_seen: 'filter[initial_seen]',
  last_seen: 'filter[last_seen]',
  protocol: 'filter[protocol.keyword]',
  description: 'filter[description.keyword]',
  asset_dst: 'filter[asset_dst.keyword]',
  asset_src: 'filter[asset_src.keyword]',
  ip_src: 'filter[ip_src.keyword]',
  ip_dst: 'filter[ip_dst.keyword]',
  Rule: 'filter[Rule.keyword]',
  detection: 'filter[detection.keyword]',
  startDate: 'startDate',
  endDate: 'endDate',
  sortedBy: 'sortedBy',
  orderBy: 'orderBy'
};

export class OtAlertsService {
    private _http = inject(HttpClient);
    private _toast = inject(ToastrService);
    private _index = 'logstash-ot-alerts-*';
    private _allColumns :string[]= [
      '@timestamp',
      'initial_seen',
      'last_seen',
      'protocol',
      'asset_dst',
      'asset_src',
      'ip_src',
      'ip_dst',
      'mac_src',
      'mac_dst',
      'severity',
      'Rule',
      'detection',
      'description',
      'predicted_labels',
      'boost_applied',
      'related_conversation',
      'adjusted_labels',
      'confidence_score',
      'is_deviant',
      'asset_1',
      'asset_2',
      'adjusted_deviance_score',
      'temporal_analysis',
      'adjustment_summary',
      'all_timestamps',
      'adjustment_log',
      'conversation_id',
      'correlations',
      'temporal_predecessor',
      'deviant_related_conversations',
      'asset_analysis',
      "alert_title"
    ];
    private _displayColumns :string[]= [
      '@timestamp',
      'initial_seen',
      'last_seen',
      'asset_src',
      'asset_dst',
      'protocol',
      'detection',
      'severity'
    ];

    getDisplayedColumns():string[]{
      return this._displayColumns;
    }

    getOrderTablesColumns() :TableColumnInterface[] {
      return [
        { name: 'Date', dataKey: '@timestamp', type: TableCellTypeEnum.DATE },
        { name: 'Detection', dataKey: 'detection', type: TableCellTypeEnum.TEXT },
        { name: 'Protocol', dataKey: 'protocol', type: TableCellTypeEnum.TEXT },
        { name: 'Asset Source', dataKey: 'asset_src', type: TableCellTypeEnum.TEXT },
        { name: 'Asset Destination', dataKey: 'asset_dst', type: TableCellTypeEnum.TEXT },
        { name: 'Rule', dataKey: 'Rule', type: TableCellTypeEnum.TEXT },
        { name: 'Severity', dataKey: 'severity', type: TableCellTypeEnum.SEVERITY },
        { name: 'Ip source', dataKey: 'ip_src', type: TableCellTypeEnum.TEXT },
        { name: 'Ip destination', dataKey: 'ip_dst', type: TableCellTypeEnum.TEXT },
        { name: 'Mac source', dataKey: 'mac_src', type: TableCellTypeEnum.TEXT },
        { name: 'Mac destination', dataKey: 'mac_dst', type: TableCellTypeEnum.TEXT },
        { name: 'Initial Seen', dataKey: 'initial_seen', type: TableCellTypeEnum.DATE   },
        { name: 'Last Seen', dataKey: 'last_seen', type: TableCellTypeEnum.DATE },
        { name: 'Description', dataKey: 'description', type: TableCellTypeEnum.TEXT },
        {
          name: 'Actions',
          dataKey: 'actions',
          type: TableCellTypeEnum.ACTIONS,
          filtarable:false,
          isSortable:false,
          pivot:false,
          actions: [
            // { name:'delete', icon: 'delete' , label:'delete' },
            { name:'details', icon: 'remove_red_eye' , label:'details' },
          ]
        }
      ];
    }

    getFormConvGroup(): FormGroup<any> {
      const group: any = {};
      this.getFormFields().forEach(field => {
          group[field.key] = new FormControl(field.value || '', field.validation.constraints)
      });
      return new FormGroup(group);
    }

    getFormFields(): BaseField<any>[] {

      const form: BaseField<any>[] = [
        new DateField({key: 'startDate',label: 'From',value: ''}),
        new DateField({key: 'endDate',label: 'To',value: ''}),
        new SelectField({
          key: 'type',
          label: 'Alerts category',
          options: [
            { key:'with_ai',  value:'Detected By AI'},
            { key:'without_ai',  value:'Detected Without AI'}
          ] }),
        new TextField({key: 'initial_seen',label: 'Initial Seen'}),
        new TextField({key: 'last_seen',label: 'Last Seen'}),
        new TextField({key: 'asset_src',label: 'Ip Source'}),
        new TextField({key: 'protocol',label: 'Protocol'}),
        new TextField({key: 'asset_dst',label: 'Asset Destination'}),
        new TextField({key: 'detection',label: 'Detection' }),
        new SelectField({key: 'severity',label: 'Severity' , options :  criticity })
      ]
      return form.sort((a, b) => a.order - b.order);
    }

    /**
     * Get all ot alerts from the api response to render in table
     * @param parameters
     * @returns
     */
    getAlertsOt(parameters:any){
      parameters = this.cleanParams(parameters);
      const {display_col,size,page,...otherParams} = parameters;

      let params = new HttpParams()
        .set('index', this._index)
        .set('page', page )
        .set('size', size)
        .set('orderBy', '')
        .set('sortedBy', '@timestamp')
        .set(paramMapping['display_col'], this._allColumns.join(',') || '');

      params = this.addOtherParams(params,otherParams);

      return this._http.get<ApiResponse<OtAlert[]>>( _webApi+`/document`,{ params}).pipe(
          map((response:any) => {
            if(response.data){
              response.data = response.data.map( (item :OtAlert) =>  {
                  // if we want some modification its here
                  return item;
                }
              );
            }
            return response;
          }),
          catchError(error => {
            this._toast.error("Failed fetching OT alerts", "Api Error");
            console.error("Error HTTP:", error);
            return [];
          })
      );
    }

    /**
     * Clean the empty values
     * @param parameters
     * @returns
     */
    cleanParams(parameters:any):any{
      for(const key in parameters){
        if(parameters[key] == "" || parameters[key] == null ) delete parameters[key];
      }
      return parameters;
    }

    /**
     * Inject the other parameters in the existing object like filter or noMatch ...etc
     * @param params
     * @param otherParams
     * @returns
     */
    addOtherParams(params:HttpParams , otherParams:any ):HttpParams{
      for (const key in otherParams){
        if(paramMapping[key] &&  otherParams[key] !== '' ) {
          let value = otherParams[key];
          let index = paramMapping[key];
          if(otherParams[key]  && otherParams[key].length > 0 &&  otherParams[key].charAt(0) === '!') {
            index = `notMatch[${key}]`;
            value = value.slice(1);
          }
          if( key == 'sortedBy' && ( otherParams[key] == 'initial_seen.keyword' || otherParams[key] == 'last_seen.keyword' )){
            let v = otherParams[key];
            value = v.substring(0, v.lastIndexOf(".keyword"));
          }
          params = params.set(index, value );
        }
      }

      // add switch type for ai and core but we must check if the Detection is not null or do nothing
      // for ai set the value detection to Detected By AI
      if( !params.has('detection') && otherParams.type == 'with_ai'){
        params = params.set(paramMapping['detection'], detectionValueForAi );
        // for core set the value differnet of Detected By AI so exclusion
      }else if( !params.has('detection') && otherParams.type == 'without_ai'){
        params = params.set(`notMatch['detection']`, detectionValueForAi );

      }
      return params;
    }
    /**
     * Get a single object
     * @param id
     * @returns
     */
    getSingleOtAlertById(id:string):Observable<OtAlert>{
      let params = new HttpParams()
      .set('index', this._index)
      .set('page', 1 )
      .set('size', 10)
      // .set('orderBy', '')
      // .set('sortedBy', '@timestamp')
      .set('match[_id]', id)
        .set(paramMapping['display_col'], this._allColumns.join(',') || '');
      return this._http.get<any>( _webApi+`/document`,{ params}).pipe(
        map( (response:any) => {
          response = response?.data?.[0];
          response = this.formatDataForAlertDetailsOt(response);
          return response;
        }),
        catchError(error => {
          this._toast.error("Failed fetching conversations", "Api Error");
          console.error("Error HTTP:", error);
          return [];
        })
      );
    }

    deleteAlert(data:any):Observable<OtAlert>{
      let params = new HttpParams()
      .set('data', data);
      return this._http.delete<any>( _coreApi+`/ot/alert`,{ params}).pipe(
        catchError(error => {
          this._toast.error(`Failed to delete alert Ot ${data?._id}`, "Api Error");
          console.error("Error HTTP:", error);
          return [];
        })
      );
    }

/**
 *  format the data for predicted_label and correlations
 * @param data
 * @returns
 */
  formatDataForAlertDetailsOt(data:any):any{
    // prepare the mitre-attack data
    if(data?.predicted_labels){
      const object = data?.predicted_labels;
      const keys = object ? Object.keys(object) : [] ;
      data.predicted_labels = [];
      keys.forEach(key => {
          data.predicted_labels.push({key , value:(object[key] * 100).toFixed(2)}) // arrange the object for later use
      });
    }
    if(data?.correlations?.predecessor){
      data.correlations.predecessor = this.formatCorrelation(data?.correlations?.predecessor);
    }
    if(data?.correlations?.successor){
      data.correlations.successor = this.formatCorrelation(data?.correlations?.successor);
    }
    return data;
  }

  formatCorrelation(data:{
    asset_dst_client_name: string;
    asset_dst_id: string;
    asset_dst_zone: string;​
    asset_dst_type: string;
    asset_src_client_name: string;
    asset_src_id: string;​
    asset_src_zone: string;​
    asset_src_type: string;
    conversation_protocol: string;

  }):any{
    return {
      asset_src : this.mapCorrelationSrc(data),
      protocol: data?.conversation_protocol,
      asset_dst : this.mapCorrelationDst(data)
    };
  }
  mapCorrelationSrc(data:any) :{
    id:string;
    nom_client_usuel:string;
    belonging_zone:string;
    type:string;
  }{
    return {
        id: data?.asset_src_id,
        nom_client_usuel: data?.asset_src_client_name,
        belonging_zone: data?.asset_src_zone,
        type: data?.asset_src_type
    }
  }
  mapCorrelationDst(data:any):{
    id:string;
    nom_client_usuel:string;
    belonging_zone:string;
    type:string;
  }{
    return {
        id: data?.asset_dst_id,
        nom_client_usuel: data?.asset_dst_client_name,
        belonging_zone: data?.asset_dst_zone,
        type: data?.asset_dst_type
    }
  }


}
