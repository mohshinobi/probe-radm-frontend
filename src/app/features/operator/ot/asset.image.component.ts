import { Component,  inject,  Input  } from '@angular/core';
import { getImageSvg } from './topology/gojs.utility';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-asset-img',
    imports: [MatIcon],
    template: `
      <div class="asset">
        <p class="asset_zone">{{ asset?.belonging_zone ?? "unknown" }}</p>
        <img mat-card-md-image class="asset_image"  mat-card-image src="{{ getImgUrl( asset?.type ?? 'unknown' ) }}"  alt="{{ asset?.product_commercial_name }}" >
        <p class="asset_name">
          {{ asset?.nom_client_usuel  ??  "unknown"  }}
          @if( asset?.id ){<mat-icon class="link" (click)="redirectToAsset(asset?.id )">open_in_new</mat-icon>}
        </p>
      </div>`,
    styles: `
  .asset{
    position:relative;
    margin:0.5rem;
    padding: 0;
    border-radius: 4px;
    display: flex;
    flex-direction:column;
    background-color: lightgray;
    width: 10rem;
    height: 10rem;
    .asset_image{
      width: 5rem;
      height: 5rem;
      margin: auto auto ;
    }
    .asset_zone,
    .asset_name{
      flex: 1 1 auto;
      font-family: Inter,sans-serif;
      text-align: center;
      color: #1F1F1F;
      align-content: center;
      align-items: center;
      text-align:center;

    }
    .link{
      position:absolute;
      top:2px;
      right:2px;
      cursor: pointer;
      &:hover{
        color: lightgray;
        background-color:#1F1F1F;
        border-radius:4px;
      }
    }
  }
  `,
    providers: []
})
export class AssetImageComponent  {
  @Input('asset') asset! : any;
  private _router = inject(Router);


  getImgUrl(type : string  = "unknown" ):string{
    return getImageSvg(type);
  }

  redirectToAsset(id:string|undefined){
    if(id){
      const url = `${location.origin}/operator/ot/asset/details/${id}`;
      window.open(url, '_blank');
    }
  }
}
