import { AfterViewInit, Component, effect,  ElementRef, inject, OnDestroy, Renderer2, signal, ViewChild } from '@angular/core';
import { OtAlertsService } from '../ot.alerts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, forkJoin, map, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { OTService } from '@features/operator/ot/services/ot.service';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { AssetImageComponent } from '../../asset.image.component';
import { getImageSvg } from '../../topology/gojs.utility';
import { MatIconModule} from '@angular/material/icon';
import { MatButtonModule} from '@angular/material/button';
import { OtAsset } from '../../services/interface';

@Component({
    selector: 'app-ot-alert-details',
    imports: [MatIconModule, MatButtonModule, MatListModule, CommonModule, MatCardModule, BreadcrumbComponent, AssetImageComponent],
    templateUrl: './ot.alert.details.html',
    styleUrl: './ot.alert.details.scss',
    providers: [OtAlertsService, OTService]
})
export class OtAlertDetailsComponent implements AfterViewInit, OnDestroy {
  constructor( ) {
    effect(() => {
      const alert = this.alert();
      if (!alert) {
        this.infos.set({ asset_src: undefined, asset_dst: undefined });
        return;
      }
      const idSrc = btoa(`${alert.ip_src}-${alert.mac_src}`);
      const idDst = btoa(`${alert.ip_dst}-${alert.mac_dst}`);
      forkJoin({
        asset_src: this._serviceAsset.getSingleAsset(idSrc),
        asset_dst: this._serviceAsset.getSingleAsset(idDst)
      }).subscribe({
        next: ({ asset_src, asset_dst }) => {
          if (asset_src && asset_dst) {
            this.infos.set({ asset_src, asset_dst });
            setTimeout(() => {
              this.drawCurve();
            }, 50);
          } else {
            this.infos.set({asset_src: undefined, asset_dst: undefined });
          }
        },
        error: () => this.infos.set({asset_src: undefined, asset_dst: undefined })
      });
    },{allowSignalWrites: true});
  }
  private _route = inject(ActivatedRoute);
  private _service = inject(OtAlertsService);
  private _serviceAsset = inject(OTService);
  private _renderer = inject(Renderer2);
  private _router = inject(Router);
  infos = signal<{ asset_src: OtAsset|undefined ; asset_dst: OtAsset|undefined} >({ asset_src: undefined, asset_dst: undefined });
  @ViewChild('graphConversation', { static: true }) graphConversation!:ElementRef<HTMLCanvasElement>;
  linkColor:string = 'var(--radm-lightblue)';
  viewBox: string = '';
  @ViewChild('svg') svgEl!: ElementRef<SVGElement>;
  @ViewChild('source') sourceEl!: ElementRef<HTMLElement>;
  @ViewChild('target') targetEl!: ElementRef<HTMLElement>;
  id = signal<string>('') ;
  alert = toSignal(
    this._route.paramMap.pipe(
      map(params => params.get('id')),
      filter((id): id is string => !!id),
      switchMap(id => this._service.getSingleOtAlertById(id))
    ),
    { initialValue: null }
  );

  getImgUrl(type : string  = "unknown" ):string{
    return getImageSvg(type);
  }
  parseDateBack(str:string|undefined):any{
    const date = new Date(str ?? '');
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')} ${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}:${date.getUTCSeconds().toString().padStart(2, '0')}`;
  }

  redirectToAsset(id:string|undefined){
    if(id){
      this._router.navigateByUrl(`/operator/ot/asset/details/${id}`);
    }
  }


  drawCurve() {
    const predElDiv = document.getElementById('predecessorConv');// the div that contain the predecessor conversation
    const currElDiv = document.getElementById('currentConv'); // the current conversation
    const succElDiv = document.getElementById('successorConv'); // the div that contain the successor conversation
    const svgEl = document.getElementById('svgContainer'); // the svg to drawn in
    // prepare the list of every id element and save it in separate array
    const listIdPred :{key:string, element:HTMLElement}[] = predElDiv ? this.getIdsFromDiv(predElDiv) : [];
    const listIdSucc :{key:string, element:HTMLElement}[] = succElDiv ? this.getIdsFromDiv(succElDiv) : [];
    const listCurrId :{key:string, element:HTMLElement}[] = currElDiv ? this.getIdsFromDiv(currElDiv) : [];
    // loop for every id and search for the predecessor or successor if exist and draw the arc/link
    if(currElDiv && svgEl){
      listCurrId.forEach( curr => {
        // search for the predecessor/successor if the id exist then draw the link
         Object.values({ pred: listIdPred, succ: listIdSucc}).forEach( (block:{key:string, element:HTMLElement}[]) => {
          // loop for the element block containing the conversation
           block.forEach(el => {
             if( el.key != '' && curr.key != '' && (el.key == curr.key) ){
               this.drawLink(curr.element , el.element,this.linkColor); // draw the curve if the id of element of current conversation exist in another block
             }
           });

        })

      })
    }
  }

  /**
   * Return the list Ids for every assets div
   * for further link association
   * @param el
   * @returns
   */
  getIdsFromDiv(el:HTMLElement):{key:string, element:HTMLElement}[]{
    const listAssets : NodeListOf<Element> = el.querySelectorAll('.assetConv');
    return Object.values(listAssets).map( (data:any) => {return { key:data?.id , element : data} });
  }

  /**
   * draw curved arc from two element
   * @param srcEl
   * @param dstEl
   */
  drawLink(srcEl:HTMLElement, dstEl:HTMLElement , color:string ){
    const svgEl = this.svgEl.nativeElement;
    const containerRect = svgEl.getBoundingClientRect();
    const sourceRect = srcEl.getBoundingClientRect();
    const targetRect = dstEl.getBoundingClientRect();

    const x1 = sourceRect.left + sourceRect.width / 2 - containerRect.left;
    const y1 = sourceRect.top + sourceRect.height / 2 - containerRect.top;

    const x2 = targetRect.left + targetRect.width / 2 - containerRect.left;
    const y2 = targetRect.top + targetRect.height / 2 - containerRect.top;

    const cx = (x1 + x2) / 2;
    const cy = Math.min(y1, y2) - 100;

    const width = containerRect.width;
    const height = containerRect.height;
    this.viewBox = `0 0 ${width} ${height}`;
    const path = `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`;
    const link = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    link.setAttribute('stroke', color);
    link.setAttribute('fill', 'transparent');
    link.setAttribute('d', path);
    link.setAttribute('stroke-width', '2');
    link.setAttribute('stroke-dasharray', "4 4");
    link.setAttribute('marker-start', 'url(#arrow-start)');
    link.setAttribute('marker-end', 'url(#arrow-end)');
    svgEl.appendChild(link);
  }


  actionNoDeviance(data:any){
    console.warn('No deviance ', data)
  }

  ngAfterViewInit(): void {
    const parentElement = document.querySelector('.div-content');
    if (parentElement) {
      this._renderer.setStyle(parentElement, 'background', '#1F1F1F');
      this._renderer.setStyle(parentElement, 'padding', '14px 14px 14px 0');
      this._renderer.setStyle(parentElement, 'border-left', '1px solid #323231');
      this._renderer.setStyle(parentElement, 'border-bottom', '1px solid #323231');
    }
    this.drawCurve();
  }
  ngOnDestroy(): void {
    const parentElement = document.querySelector('.div-content');
    this._renderer.removeStyle(parentElement, 'background');
    this._renderer.setStyle(parentElement, 'padding', '14px');
    this._renderer.removeStyle(parentElement, 'border-left');
    this._renderer.removeStyle(parentElement, 'border-bottom');
  }


}
