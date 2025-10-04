import {   Component, EventEmitter, Input, Output, signal  } from '@angular/core';
import { listProtocols , ProtocolsList } from '../ot.utility';
@Component({
    selector: 'app-topology-legend',
    standalone: true,
    imports: [  ],
    template: `
        <div #otStatsProto id="otStatsProto">
            @for (proto of this.protocols; track proto) {
                <div class="item {{ !this.selected.includes(proto.key) ? 'disabled' :'' }}">
                    <span
                    (click)="clickProto($event)"
                    id="{{ proto.key }}"
                    style="background-color:{{ proto.color }};">
                        {{ proto.key.toUpperCase() }}
                    </span>
                </div>
            }
        </div>
    `,
    styles: `
        #otStatsProto{
            width: auto;
            background-color: #eee;
            overflow-x: scroll;
            position: absolute;
            left:10%;
            bottom: 0;
            z-index: 99;
            padding:0.5rem;
            opacity: 0.9;
            color: #333;
            display:flex;
            flex-direction:row;
            border-radius:4px 0;
            font-size:0.7rem;
            height:2rem;
            overflow:visible;
        }
        .item {
            cursor:pointer;
            margin:0 0.2rem;
            &.disabled{
                opacity:0.7;
            }
            span {
                border-radius:4px;
                color:white;
                padding:0.2rem;
            }
        }
    `,
    providers : [ ]
})

export class LegendProtoComponent   {
    protocols:ProtocolsList[] = listProtocols;
    selected :string[] = [];
    @Output() protocolChange:EventEmitter<string[]> = new EventEmitter();
    @Input() protocolsConversations = [];
    /**
     * event for click protocol
     * @param event
     */
    clickProto(event:Event):void{
        const element : HTMLElement = event.target  as HTMLElement ;
        const protocol:string = element.id ?? null;
        // if the protocol exists and its not null
        if(protocol !== null){
            // add the protcolo on the list or remove it
            if(this.selected.includes(protocol))
                this.selected.splice(this.selected.indexOf(protocol));
            else
                this.selected.push(protocol);
            // emit the change
            this.protocolChange.emit(this.selected);
        }
    }
}