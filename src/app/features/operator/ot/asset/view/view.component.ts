import { Component, inject  , OnInit , signal , ElementRef , ViewChild} from '@angular/core';
import { OTService , robustness } from '@features/operator/ot/services/ot.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule} from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { Observable, switchMap , firstValueFrom} from "rxjs";
import { getImageSvg } from "../../topology/gojs.utility"
import { FormsModule, ReactiveFormsModule , FormControl, FormGroup  } from '@angular/forms';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MatSelectModule} from '@angular/material/select';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { types , TypesInterface } from '../../ot.utility';
import { criticity, OtAsset } from '../../services/interface';
import {PageHeaderComponent} from "@layout/page-header.component";

@Component({
    selector: 'app-view',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [MatIconModule, CommonModule, MatButtonModule, MatCardModule, MatListModule, MatGridListModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, PageHeaderComponent],
    templateUrl: './view.component.html',
    styleUrl: './view.component.scss',
    providers: [OTService]
})


export class ViewComponent implements OnInit {
  dialog = inject(MatDialog);
  private _router = inject(Router);
  private _service = inject(OTService);
  private route = inject(ActivatedRoute);
  private _toast = inject(ToastrService);
  id = signal<string>('');
  asset$: Observable<OtAsset> | undefined;
  editMode = signal<boolean>(false);
  @ViewChild('modalContent', { static: true }) modalContent!: ElementRef;
  form : FormGroup = new FormGroup({
    type: new FormControl<string | null>(null),
    nom_client_usuel : new FormControl<string | null>(null),
    belonging_zone : new FormControl<string | null>(null),
    product_commercial_name : new FormControl<string | null>(null),
    firmware_version : new FormControl<string | null>(null),
    criticity : new FormControl<string | null>(null),
    robustesse : new FormControl<string | null>(null),
    champs_descriptif : new FormControl<string | null>(null),
  });
  criticityList = criticity;
  robustnessList = robustness;
  listZones = signal(this._service.getZonesList())
  ngOnInit() {
    // get the asset object from the id parameter passed via the query route
    this.asset$ = this.route.paramMap.pipe(
      switchMap((params) => this._service.getSingleAsset(params.get('id')!))
    );
    // fill the form values from the asset object
    this.asset$.subscribe({
      next: (asset:any) => {
        this.form.patchValue({
          type: asset.type.toLowerCase(), // to lower ca because the list key is to lower case
          nom_client_usuel : asset.nom_client_usuel,
          belonging_zone : asset.belonging_zone,
          product_commercial_name : asset.product_commercial_name,
          firmware_version : asset.firmware_version	,
          criticity : asset.criticity,
          robustesse : asset.robustesse,
          champs_descriptif : asset.champs_descriptif,
        });
      }
    })
  }
/**
 * get the image icon via the type of the asset
 * @param asset$
 * @returns
 */
  getImgUrl(asset$ : OtAsset):string{
    return getImageSvg(asset$.type);
  }
/**
 * update the data via asset object
 */
  async updateAsset(){
    const formData :any[] = this.form.value;
    const asset :any = await firstValueFrom(this.asset$! );
    const updatedAsset = { ...formData , id:asset.id};
    const answer = this.openModal('Update asset' , 'Are you sure you want to update this asset?');
    answer.afterClosed().subscribe((answer:boolean) => {
      if(answer == true){
        this._service.updateAsset(updatedAsset).subscribe({
          next: () => {
            this.editMode.set(false);
            this._toast.success('Success updating asset' ,'Api')
            // must do this trick to refresh components, because it must navigate to route other than itself and redirect to itself
            this._router.navigateByUrl('/operator/ot/assets',{skipLocationChange:true}).then(()=>{
              this._router.navigate([`/operator/ot/asset/details/${asset.id}`]).then(()=>{
              })
            })
          },
          error: (error) => {
            this._toast.error('Error while saving asset','Api')
          }
        });
      }
    });


  }

/**
 * Delete the asset via the id
 */
async deleteAsset() {
  const answer =  this.openModal('Delete asset' , 'Are you sure you want to delete');
  const asset :any = await firstValueFrom(this.asset$!);
  answer.afterClosed().subscribe((answer:boolean) => {
    if(answer == true){
      this._service.deleteAsset(asset.id).subscribe({
        next: () => {
          this.editMode.set(false);
          this._toast.success('Success delete asset' ,'Api')
          this._router.navigateByUrl('/operator/ot/assets');
        },
        error: (error) => {
          this._toast.error(`Error while deleting asset ${error.error}` ,'Api')
        }
      });
    }
  });
}
/**
 * switch between modes edit and view
 * we set the signal value to true or false
 */
  switchMode(){
    if(this.editMode()){
      this.editMode.set(false);
    }else{
      this.editMode.set(true);
    }
  }

 /**
  * Returns the list of the type of asset
  * @returns
  */
  getTypesList():TypesInterface[]{
    return types;
  }

  /**
   * Open modal and save the list of assets into file
   */
  openModal( title: string, message:string){
    // open the modal and get the answer if its yes or no
    return this.dialog.open(ModalComponent, {
      data: {
        title: title,
        contentTemplate: this.modalContent,
        contentContext: message
      }
    });
  }

}
