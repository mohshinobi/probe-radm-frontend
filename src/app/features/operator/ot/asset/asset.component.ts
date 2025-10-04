import { Component, computed, inject, signal} from '@angular/core';
import { toObservable, toSignal} from '@angular/core/rxjs-interop';
import { CommonModule} from '@angular/common';
import { MatCardModule} from '@angular/material/card';
import { MatSidenavModule} from '@angular/material/sidenav';
import { OTService} from '@features/operator/ot/services/ot.service';
import { TableComponent} from '@shared/components/table/table.component';
import { map, switchMap} from 'rxjs';
import { TableColumnInterface} from '@core/interfaces';
import { FormGroup} from "@angular/forms"; 
import { MatButtonModule} from '@angular/material/button';
import { MatIconModule} from '@angular/material/icon';
import { TimeSelectorComponent} from "@shared/components/time-selector/time-selector.component";
import { QueryParams } from '../services/interface';
import {PageHeaderComponent} from "@layout/header/page-header.component";

@Component({
    selector: 'app-asset',
  imports: [MatIconModule, CommonModule, MatCardModule, MatButtonModule, MatSidenavModule, TableComponent, TimeSelectorComponent, PageHeaderComponent],
    templateUrl: './asset.component.html',
    styleUrl: './asset.component.scss',
    providers: [OTService]
})

export class AssetComponent { 
  _service = inject(OTService);
  displayedColumns =  this._service.getDisplayedAssetsColumns();
  length :number = 0;
  queryParams  = signal<QueryParams>({display_col: this.displayedColumns , size:10, page:1});
  fields  = this._service.getFormFields();
  title = 'OT / Assets';
  form  = signal<FormGroup<any>>(this._service.getFormGroup());
  ordersTableColumns: TableColumnInterface[]  = this._service.getOrderTablesColumns();
  data = toSignal(
    toObservable(this.queryParams).pipe(
      switchMap(() =>{
        return this._service.getAssets(this.queryParams()).pipe(
          map((response :any)  => {
            this.length = response.total;
            return response.data;
          })
        );
      })
    ), { initialValue: [] }
  );

  tableActions(tableActions: Partial<any>) {
    this.queryParams.update(()=>({ ...this.queryParams(),...tableActions}));
  }

  handelDataSet(action: any) {
    if (action.actionName === 'detail' && action?.id) {
      window.open(`/operator/ot/asset/details/${action.id}`, '_blank');
    }
  }
}
