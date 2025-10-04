import { Component, EventEmitter, Input, Output } from '@angular/core';
import { listProtocols , ProtocolsList } from '../../ot.utility';
import { protocol } from './protcolsDto';
import { NgIf } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
interface assetInterface {
  id:string;
  ip:string;
  mac:string;
}
interface conversationInterface {
  assetDest: assetInterface;
  assetSrc: assetInterface;
  from: string;
  to: string;
  protocols: string;
}
@Component({
    selector: 'app-topology-legend',
    imports: [MatTooltipModule],
    template: `
      <div #otStatsProto id="otStatsProto">
          @for (proto of this.protocols; track proto) {
              @if(!isHidden(proto.key)){
                <div
                  class="item"
                  [class.clicked]="this.selected.includes(proto.key)"
                  [class.disabled]="isHidden(proto.key)"
                  (click)="clickProto($event)"
                  (mouseenter)="showToolTips($event)"
                  id="{{ proto.key }}">
                    <div style="background-color:{{ proto.color }};">
                      {{ proto.key.toUpperCase() }}
                      <span class="count">{{getCountByProtoName(proto.key)}}</span>
                    </div>
                  </div>
                }
          }
      </div>
    `,
    styles: `
    #otStatsProto {
      position: fixed;
      display: flex;
      flex-direction:row;
      bottom: calc(var(--footer-height) - 15px);
      flex-wrap: nowrap;
      gap: 0.5rem;
      background-color: rgba(255,255,255,0.7);
      width: auto;
      padding: 0.3rem 1.5rem 0.5rem 0.3rem;
      border-radius: 4px 0;
      justify-content: flex-start;
      align-items: center;
      overflow-x: auto;
      z-index: 99;
      font-size:0.7rem;
    }
    .item {
      .count{
        border-radius: 4px;
        background-color: #333;
        color: white;
        margin-left: 0.2rem;
        padding: 0 0.2rem;
        line-height:1rem;
      }
      &.disabled{
        display:none;
        div { background-color:gray !important; }
        opacity:0.5;
      }
      &.clicked{
        div {
          border-bottom:0.5rem solid #333;
        }
      }
      div{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      padding: 0.1rem;
      margin-left: 0.5rem;
      cursor: pointer;
      width: 100%;
      color: white;

    }
    }

    `
})

export class LegendProtoComponent  {
    protocols:ProtocolsList[] = listProtocols;
    selected :string[] = [];
    tooltipText! :string ;
    @Output() protocolChange:EventEmitter<string[]> = new EventEmitter();
    @Output() protocolHover:EventEmitter<any[]> = new EventEmitter();
    @Input() protocolsConv!:protocol[];
    @Input() links! : any;
    tooltipByProto: Record<string, string> = {};

    /**
     * event for click protocol
     * @param event
     */
    clickProto(event:Event):void{
      const element : HTMLElement = event.currentTarget  as HTMLElement ;
      const protocol:string = element.id ?? null;
      if(protocol !== null){
        // add the protcolo on the list or remove it
        if(this.selected.includes(protocol))
          this.selected = this.selected.filter(p => p !== protocol);
        else
            this.selected.push(protocol);
        // emit the change
        this.protocolChange.emit(this.selected);
      }
    }

    /**
     * event for click protocol
     * @param event
     */
    showToolTips(event: Event): void {
      const element = event.currentTarget as HTMLElement;
      const protocol = element.id;
      this.tooltipByProto = {};
      const list : conversationInterface[] = this.links?.filter((l: conversationInterface) => l.protocols === protocol);
      if (protocol && list?.length > 0) {
        this.protocolHover.emit(list)
      }
    }
    /**
     * return true or false if the protocol exists
     * @param protocol
     * @returns
     */
    isHidden(protocol:string):boolean{
      for( const proto of this.protocolsConv){
        if(proto.protocol === protocol )
            return false
      }
      return true;
    }
    /**
     * get the occurence of the protocol by it's name
     * @param protocol
     * @returns
     */
    getCountByProtoName(protocol:string):number{
      for( const proto of this.protocolsConv){
        if(proto.protocol === protocol )
            return proto.count
      }
      return 0;
    }
}
