import { Component , inject ,signal, computed , OnInit, ViewChild} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { OTServiceConversations } from '@features/operator/ot/services/ot.conversations.service';
import { ChipFilterDataInterface, TableComponent } from '@shared/components/table/table.component';
import { MatCardModule } from '@angular/material/card';
import { FormGroup } from '@angular/forms';
import { toObservable  } from '@angular/core/rxjs-interop';
import { switchMap , map } from 'rxjs';
import { TableColumnInterface } from '@core/interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { TimeSelectorComponent } from "@shared/components/time-selector/time-selector.component";
import { BaseField } from '@shared/components/form/fields';
import {PageHeaderComponent} from "@layout/header/page-header.component";

@Component({
    selector: 'app-conversation',
  imports: [TableComponent, MatCardModule, TimeSelectorComponent, PageHeaderComponent],
    templateUrl: './conversation.component.html',
    styleUrl: './conversation.component.scss',
    providers: [OTServiceConversations]
})
export class ConversationComponent implements OnInit {
  _service  = inject(OTServiceConversations);

  constructor(private router : Router, private route: ActivatedRoute){}

  displayedColumns =  this._service.getDisplayedColumns();
  length :number = 0;
  queryParams  = signal<any>({display_col: this.displayedColumns });
  form  = signal<FormGroup<any>>(this._service.getFormConvGroup());
  params = computed(() => {  return  { ...this.queryParams() }});
  fields: BaseField<any>[] = this._service.getFormFields();
  @ViewChild("tableComponent") tableComponent!: TableComponent;

  ngAfterViewInit() {
    const querParams = this.route.snapshot.queryParams;
    const params : ChipFilterDataInterface[] = [];
    for ( let key in querParams){
      params.push({key:key,value: querParams[key], columnName:key} )
    }
    if( params.length > 0 ) this.tableComponent.chipFilterData.set(params);
  }

  ngOnInit(): void {
    // change query params from the route parameters we get
    this.route.queryParamMap.subscribe((params:any) => {
      this.queryParams.update(()=>({display_col: this.displayedColumns, ...params.params ?? {} }));
    });
  }

  ordersTableColumns: TableColumnInterface[]  = this._service.getOrderTablesColumns();
  title = 'OT / Conversations';

  data = toSignal(
    toObservable(this.params).pipe(
      switchMap(() =>{
        return this._service.getTableConversations(this.params()).pipe(
          map((response :any)  => {
            this.length = response.total;
            return response.data;
          })
        );
      })
    ), { initialValue: [] }
  );

  tableActions(tableActions: Partial<any>) {
    this.queryParams.update(()=>({...this.queryParams(), ...tableActions}));
  }

  handelDataSet(action: any) {
      if(action.actionName === 'detail' && action?._id) {
      window.open(`/operator/ot/conversation/details/${action._id}`, '_blank');
    }
  }

}
