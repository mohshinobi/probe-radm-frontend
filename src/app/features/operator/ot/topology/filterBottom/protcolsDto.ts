import { ProtocolsList , listProtocols } from "../../ot.utility";


export interface protocol  {protocol:string, count:number};


export class protocolsDto {

  private  protocols : protocol[] = [];
  private protoConfig : string[] = [];
  constructor(){
    this.protoConfig = listProtocols.map((d:ProtocolsList) => d.key);
  }
/**
 * Return all protocols
 * @returns
 */
  public getAll():protocol[]{
    return this.protocols;
  }
  public addProto(proto:string){
    const list = this.protocols.map((p:protocol) => p.protocol);
    // if the proto dont exist
    if(!list.includes(proto) && this.protoConfig.includes(proto)){
      this.protocols.push({protocol:proto , count:1});
    // else incremente count
    }else if(!list.includes(proto) && !this.protoConfig.includes(proto)){
      console.warn(`Protocol:${proto} in conversation but not available in config.`);
    }else{
      for( const p of this.protocols){
        if(p.protocol ==  proto ){
          p.count++;
        }
      }
    }
  }

}
