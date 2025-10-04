import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { TableComponent } from '@shared/components/table/table.component';
import { OtAlertsService } from './ot.alerts.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { BaseField } from '@shared/components/form/fields';
import { TableColumnInterface } from '@core/interfaces';
import { map, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '@shared/components/modal/modal.component';
import {PageHeaderComponent} from "@layout/header/page-header.component";

@Component({
    selector: 'app-ot-alerts',
  imports: [TableComponent, PageHeaderComponent],
    templateUrl: './ot.alerts.html',
    styleUrl: './ot.alerts.scss',
    providers: [OtAlertsService,]
})
export class OtAlertsComponent {
  private _toast = inject(ToastrService);
  private _router = inject(Router);
  dialog = inject(MatDialog);
  @ViewChild('modalContent', { static: true }) modalContent!: ElementRef;
  _service = inject(OtAlertsService);
  displayedColumns =  this._service.getDisplayedColumns();
  length :number = 0;
  queryParams  = signal<any>({display_col: this.displayedColumns , size : 10 , page : 1 });
  form  = signal<FormGroup<any>>(this._service.getFormConvGroup());
  fields: BaseField<any>[] = this._service.getFormFields();
  @ViewChild("tableComponent") tableComponent!: TableComponent;
  ordersTableColumns: TableColumnInterface[]  = this._service.getOrderTablesColumns();
  data = toSignal(
    toObservable(this.queryParams).pipe(
      switchMap(() =>{
        return this._service.getAlertsOt(this.queryParams()).pipe(
          map((response :any)  => {
            this.length = response.total;
            return response.data;
          })
        );
      })
    ), { initialValue: [] }
  );

  /**
   * All the interactions with the data table
   * @param tableActions
   */
  tableActions(tableActions: Partial<any>) {
    console.log('tableActions',tableActions)
    this.queryParams.update(()=>({...this.queryParams(), ...tableActions}));
  }

  /**
   * Column action to what we want after we click
   * @param action
   */
  handelDataSet(action: any) {
    console.log('handelDataSet',action)
    // when we click on delete
    if(action.actionName == 'delete'){
      // todo: call the api to delete alert
      delete action.actionName
      const alert = action;
      this.deleteAsset(alert);
    }else if (action.actionName == 'details' && action?._id){
      window.open(`/operator/ot/alert/details/${action._id}`, '_blank');
    }
  }

  async deleteAsset(data:any) {
    const answer =  this.openModal('Delete OT alert' , 'Are you sure you want to delete this alert');
    answer.afterClosed().subscribe((answer:boolean) => {
      if(answer == true){
        this._service.deleteAlert(data).subscribe({
          next: () => {
            this._toast.success('Success delete asset' ,'Api')
            this._router.navigateByUrl('/operator/ot/alerts');
          },
          error: (error) => {
            this._toast.error(`Error while deleting asset ${error.error}` ,'Api')
          }
        });
      }
    });
  }

    openModal( title: string, message:string){
      // open the modal and get the answer if its yes or no
      return this.dialog.open(ModalComponent, {
        panelClass: 'custom-slide-dialog',
        backdropClass: 'dialog-backdrop',
        autoFocus: false,
        disableClose: true,
        data: {
          title: title,
          contentTemplate: this.modalContent,
          contentContext: message
        }
      });
    }


}
