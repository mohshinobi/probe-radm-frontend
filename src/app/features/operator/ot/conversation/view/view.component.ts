import { AfterViewInit, Component, computed, inject , OnDestroy,  Renderer2, signal} from '@angular/core';
import { OTServiceConversations  } from '@features/operator/ot/services/ot.conversations.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule} from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { getImageSvg } from "../../topology/gojs.utility"
import { switchMap} from "rxjs";
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MatChipsModule} from '@angular/material/chips';
import { getColorProtocol } from '../../ot.utility';
import { toSignal } from '@angular/core/rxjs-interop';
import { AssetImageComponent } from '../../asset.image.component';
import { MatDividerModule} from '@angular/material/divider';
interface alerts{
  message: string,
  protocolosAnalysis:{
    used: string|number,
    specified: string|number,
    current: string|number,
  },
  nbOccurences:{
    last5Minutes: string|number,
    last15Minutes: string|number,
    last60Minutes: string|number,
  }
}

@Component({
    selector: 'app-view',
    imports: [MatDividerModule, AssetImageComponent, BreadcrumbComponent, MatIconModule, CommonModule, MatButtonModule, MatCardModule, MatListModule, MatGridListModule, MatChipsModule],
    templateUrl: './view.component.html',
    styleUrl: './view.component.scss',
    providers: [OTServiceConversations]
})

export class ViewComponent  implements AfterViewInit, OnDestroy {
  private _renderer = inject(Renderer2);
  _service = inject(OTServiceConversations);
  private route = inject(ActivatedRoute);
  id = signal<string>('') ;
  conversation  = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => this._service.getSingleConversation(params.get('id')!))
    ),
    { initialValue: null } // ou {} ou autre valeur par défaut
  );

  alertsInfos = computed<alerts>( ( ) => {
    const conversation = this.conversation();
    const alertInfo = {
      message: 'n/a',
      protocolosAnalysis:{
        used: 'n/a',
        specified: 'n/a',
        current: 'n/a',
      },
      nbOccurences:{
        last5Minutes: 0,
        last15Minutes: 0,
        last60Minutes: 0,
      }
    };
    if(!conversation) return alertInfo as alerts;

    const ipSrc = conversation?.src_ip;
    const ipDst = conversation?.dest_ip ;
    const macSrc = conversation?.layers?.eth?.eth_eth_src;
    const macDst  = conversation?.layers?.eth.eth_eth_dst ;
    const protocol = this._service.extractProtocol(conversation?.layers?.frame.frame_frame_protocols); // extract the protocol from the list of proto
    // used protocol last extracted
    alertInfo.protocolosAnalysis.used = this._service.extractProtocol(conversation?.layers?.frame.frame_frame_protocols);

    if(protocol && macDst && macSrc && ipDst && ipSrc){

      let alertsOt = this._service.getAlertsOtByConversation(ipSrc,ipDst,macSrc,macDst,'enip').subscribe(
        {
          next: (res:any) => {
          const data = res?.data.map((item:any) => {
            return item;
          })
          }
        }
      );
    }
    return alertInfo as alerts;
  })
  getImgUrl(type : string  = "unknown" ):string{
    return getImageSvg(type);
  }
  getProtocolList(string :string, delimiter : string = ":") : string[]{
    let protocols : string[] = [];

    return protocols;
  }
  getProtoColors(protocol :string) :string{
    return getColorProtocol(protocol);
  }

    ngAfterViewInit(): void {
    const parentElement = document.querySelector('.div-content');
    if (parentElement) {
      this._renderer.setStyle(parentElement, 'background', '#1F1F1F');
      this._renderer.setStyle(parentElement, 'padding', '14px 14px 14px 0');
      this._renderer.setStyle(parentElement, 'border-left', '1px solid #323231');
      this._renderer.setStyle(parentElement, 'border-bottom', '1px solid #323231');
    }
  }
  ngOnDestroy(): void {
    const parentElement = document.querySelector('.div-content');
    this._renderer.removeStyle(parentElement, 'background');
    this._renderer.setStyle(parentElement, 'padding', '14px');
    this._renderer.removeStyle(parentElement, 'border-left');
    this._renderer.removeStyle(parentElement, 'border-bottom');
  }
}
