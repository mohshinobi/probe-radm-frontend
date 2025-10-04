import { HttpClient } from '@angular/common/http';
import { inject} from '@angular/core';
import { criticity, GoGroup, GojsAsset, OtAsset, QueryParams, SeverityInterface} from './interface';
import { FormControl, FormGroup} from "@angular/forms";
import { BaseField, SelectField, TextField} from "@shared/components/form/fields";
import { TableCellTypeEnum} from "@core/enums";
import { Router} from '@angular/router';
import { catchError, map, Observable, of} from 'rxjs';
import { ApiResponse} from "@core/interfaces/api-response.interface";
import { getImageSvg } from '@features/operator/ot/topology/gojs.utility';
import { ToastrService } from 'ngx-toastr';
import { proxyPath } from '@configs/api-url.config';
import { TableColumnInterface } from '@core/interfaces';



const mapColumns :any = {
  belonging_zone : 'belongingzone',
  product_commercial_name : 'productcommercialname',
  nom_client_usuel : 'nomclientusuel',
  champs_descriptif : 'champsdescriptif',
  mac_address : 'macaddress',
  ip_address: 'ipaddress',
  type:'type',
  criticity: 'criticity',
  robustesse: 'robustesse',
  size:'size',
  page: 'page'

}
export const  robustness : SeverityInterface[]= [
  {key:5, label:5 , value:5},
  {key:4, label:4 , value:4},
  {key:3, label:3 , value:3},
  {key:2, label:2 , value:2},
  {key:1, label:1 , value:1}
]

const _manageApi = proxyPath.management;
export class OTService {
  router = inject(Router)
  toast = inject(ToastrService);
  private _http = inject(HttpClient);

  // list of file name svg icons available
  displayedColumns : string[] = ['type','product_commercial_name','ics_name','nom_client_usuel','mac_address','ip_address','robustesse','criticity','belonging_zone','champs_descriptif' ];
  severity :any[]= [
    {key:4, value:'Low'},
    {key:3, value:'Medium'},
    {key:2, value:'High'},
    {key:1, value:'Critical'}
  ];

  getTopology(): Observable<any[]> {
    return this._http.get<any[]>(_manageApi+`/ot/topology`)
    .pipe(
      map((value: any) => {
        let flattenedData: any[] = []; // final array we push elements into
        let i :number = 0;
        // lopp for each values
        (value.data).forEach((item: any) => { // add the layers
        // value.forEach((item: any) => { // add the layers

          let level: GoGroup = {
            key: item.id,
            isGroup: true,
            row:i, // for draw arrangement if 90 vertically if 0 horizontally
            isLevel: true,
            isZone: false,
            raw: { id:i, name: item.name } // needed for label level text
          };
          flattenedData.push(level);

          // add the zones
          for (let zone of item.zones_inside) {
            let zoneInside: GoGroup = {
              key: zone.id,
              isGroup: true,
              row:i,
              raw:zone,
              group: item.id,
              isZone: true, // is a zone
              isLevel: false // group zone is not a leve
            };
            flattenedData.push(zoneInside);
            // add the assets
            for (let asset of zone.assets_inside) {
              let assetInside: GojsAsset = {
                key: asset.id, // set ip adress to be the key
                type: asset.type,
                id:asset.id,
                raw:asset,
                group: zone.id
              };
              flattenedData.push(assetInside);
            }
          }
          i++;
        });
        flattenedData  = flattenedData.reverse();
        return flattenedData;
      }),

    );
  }

  getSingleAsset(id?: string): Observable<OtAsset> {
    return this._http.get<any>(_manageApi+`/ot/assets/${id}`).pipe(
      map((response) => ({
        id: response["id"] ,
        type: response["type"],
        product_commercial_name: response["productcommercialname"],
        productcommercialname: response["productcommercialname"],
        nom_client_usuel: response["nomclientusuel"],
        firmware_version: response["firmwareversion"],
        mac_address: response["macaddress"],
        ip_address: response["ipaddress"],
        robustesse:response["robustesse"],
        criticity: response["criticity"],
        belonging_zone: response["belongingzone"],
        champs_descriptif: response["champsdescriptif"]
      })),
    catchError(error => {
      // this.toast.error("Error fetching single asset", "Api Error");
      console.error("Error HTTP:", error);
      return of({} as OtAsset);
    })
    );
  }

  /**
   * get the data paginated for all assets from the core api
   * @param params
   * @returns
   */
  getAssets(params: QueryParams): Observable<ApiResponse<OtAsset>> {
    return this._http.get<ApiResponse<any>>(_manageApi+`/ot/assets${this.getParamsQuery(params)}`).pipe(
      map( (response:any) => {
        response.data = response.data ? response.data.map((asset:any) =>    {
          return {
              id: asset.id,
              type: asset.type,
              belonging_zone: asset.belongingzone,
              product_commercial_name: asset.productcommercialname,
              nom_client_usuel: asset.nomclientusuel,
              firmware_version: asset.firmwareversion,
              mac_address: asset.macaddress,
              ip_address: asset.ipaddress,
              robustesse: Number(asset.robustesse),
              criticity:  Number(asset.criticity),
              champs_descriptif: asset.champsdescriptif,
              icon:getImageSvg(asset.type)
            }
          }) : [];

        return response;
      }),
      catchError(error => {
        this.toast.error("Error fetching ot stats", "Api Error");
        console.error("Error HTTP:", error);
        return [];
      })
    );
  }
/**
 * change the parameters because it differente in api core not like elasicsearch backend
 * @param params
 * @returns
 */
  getParamsQuery(params: any):string{
    const {size,page, display_col,action,...others} = params;
    let paramsQuery :string = `?size=${size || 10}&page=${page || 1}`;
    if(others){
      for(const key of Object.keys(others)){
        if( others[key] !== '' && others[key] !== null && Object.keys(mapColumns).includes(key)  ) {
          paramsQuery += `&${mapColumns[key] ?? key}=${others[key]}`;
        }
      }
    }
    return paramsQuery;
  }

  getDisplayedAssetsColumns():string[] {
    return this.displayedColumns;
  }
 getFormFields(): BaseField<string>[] {
      const form: BaseField<any>[] = [
        new TextField({
            key: 'type',
            label: 'Type',
        }),
        new TextField({
            key: 'belongingzone',
            label: 'Zone',
        }),
        new TextField({
            key: 'ip_address',
            label: 'ip',
        }),
        new TextField({
            key: 'mac_address',
            label: 'mac',
        }),
        new TextField({
            key: 'nomclientusuel',
            label: 'Client name',
        }),
        new SelectField({
          key: 'criticity',
            label: 'Criticity',
          options: criticity
        }),
        new SelectField({
          key: 'robustesse',
            label: 'Robustness',
          options: robustness
        }),
        new TextField({
          key: 'productcommercialname',
          label: 'Commercial name',
        })
      ]

      return form.sort((a, b) => a.order - b.order);
  }


  getOrderTablesColumns() :TableColumnInterface[] {
    return [
      { name: 'Type', dataKey: 'type', type: TableCellTypeEnum.TEXT },
      { name: 'Client Name', dataKey: 'nom_client_usuel', type: TableCellTypeEnum.TEXT },
      { name: 'Commercial Name', dataKey: 'product_commercial_name', type: TableCellTypeEnum.TEXT },
      { name: 'Ip', dataKey: 'ip_address', type: TableCellTypeEnum.TEXT },
      { name: 'Criticity', dataKey: 'criticity', type: TableCellTypeEnum.SEVERITY },
      { name: 'Robustness', dataKey: 'robustesse', type: TableCellTypeEnum.TEXT },
      { name: 'Zone', dataKey: 'belonging_zone', type: TableCellTypeEnum.TEXT },
      { name: 'Mac', dataKey: 'mac_address', type: TableCellTypeEnum.TEXT },
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
/**
 *
 * @returns
 */
  getFormGroup(): FormGroup<any> {
      const group: any = {};
      this.getFormFields().forEach(field => {
          group[field.key] = new FormControl(field.value || '', field.validation.constraints)
      });
      return new FormGroup(group);
  }

/**
  * Go to the asset details page
  * @param id
  */
  navigateToAsset(id:string){
    window.open(`/operator/ot/asset/details/${id}`, '_blank');
  }
/**
  * Go to the conversation details page
  * @param id
  */
  navigateToConversation(id:string){
    this.router.navigate([`/operator/ot/conversation/details/${id}`]);
  }
  navigateToConversationPage(data:{ ipSrc: string,  ipDest : string , macSrc : string,  macDest : string}){
    window.open(`/operator/ot/conversation?src_ip=${data.ipSrc}&dest_ip=${data.ipDest}&layers.eth.eth_eth_src=${data.macSrc.toLowerCase()}&layers.eth.eth_eth_dst=${data.macDest.toLowerCase()}`, '_blank');
  }
/**
   * Update asset
   * Note that we cannot and must not change the id ipv4 and mac_adress necessary for identification
   * @param assets
   * @returns
   */
  updateAsset(asset:any): Observable<any>{
    const newAsset = {
      id:asset.id,
      type: asset.type,
      productcommercialname: asset.product_commercial_name ?? asset.productcommercialname,
      nomclientusuel: asset.nom_client_usuel ?? asset.nomclientusuel,
      firmwareversion: asset.firmware_version ?? asset.firmwareversion ,
      vulnerabilityscore: asset.score_vulnerability ??  asset.scorevulnerability,
      robustesse: Number(asset.robustesse) ,
      criticity: Number(asset.criticity) ,
      belongingzone: asset.belonging_zone ?? asset.belongingzone ,
      champsdescriptif: asset.champs_descriptif ?? asset.champsdescriptif,
    };
    return this._http.put(_manageApi+`/ot/assets/modify`, newAsset ,{ responseType: 'text' }  );
  }

/**
 * Add new Asset
 * @param asset
 * @returns
 */
  addAsset(zoneId:string, asset:any): Observable<any>{
    const newAsset = {
      id: asset.id ,
      type: asset.type || "unknown",
      productcommercialname: asset.product_commercial_name || asset.ip,
      nomclientusuel: asset.nom_client_usuel || asset.ip,
      firmwareversion: asset.firmware_version || '0',
      macaddress: asset.mac,
      ipaddress: asset.ip,
      robustesse: asset.robustesse || '2',
      criticity	: asset.criticity || '2',
      belongingzone: zoneId || asset.group,
      champsdescriptif: asset.descriptif || "From conversations",
    };
    return this._http.post(_manageApi+`/ot/assets/add`, newAsset );
  }

  /**
   * Delete an asset by his id
   * @param id
   * @returns
   */
  deleteAsset(id:string) :Observable<any>{
    return this._http.delete(_manageApi+`/ot/assets/delete/${id}` ,{responseType: 'text' } );
  }
  /**
   * Get list of the ot zones
   * @returns
   */
  getZonesList(size:number = 10000):Observable<any>{
    return this._http.get(_manageApi+`/ot/zones?size=${size}`).pipe(map((response:any) => response.data ?? []));
  }

}

