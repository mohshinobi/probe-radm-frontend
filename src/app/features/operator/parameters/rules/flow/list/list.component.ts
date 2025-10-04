import { Component ,inject, Input, signal } from '@angular/core';
import { BaseField } from '@shared/components/form/fields';
import { toSignal , toObservable } from '@angular/core/rxjs-interop';
import { switchMap , map, combineLatest, lastValueFrom } from 'rxjs';
import { TableColumnInterface } from '@core/interfaces';
import { TableCellTypeEnum } from "@core/enums";
import { FormGroup,ReactiveFormsModule } from '@angular/forms';
import { FileInterface, RulesFlowQueryParams } from '@features/operator/parameters/rules/flow/rule-flow.interface';
import { ToastrService } from 'ngx-toastr';
import { TableComponent } from '@shared/components/table/table.component';
import { RuleFlowService } from '../rule-flow.service';
import { RuleFlowFormService } from '../rule-flow-form.service';
import { Router } from '@angular/router';
import { DetailField } from '@shared/components/table/detail/detail.component';

@Component({
    selector: 'app-rule-flow-list',
    imports: [ReactiveFormsModule, TableComponent],
    providers: [RuleFlowFormService],
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss'
})
export class RuleFlowListComponent  {

  @Input() sid!: string;
  private _service = inject(RuleFlowService);
  private _formService = inject(RuleFlowFormService);
  toastr = inject(ToastrService);
  displayedColumns = ["msg", "protocol", "src_ip", "src_port", "dest_ip", "dest_port", "sid", "rev", "action", "status"];
  files: FileInterface[] = [];
  length: number = 0;
  fields: BaseField<string>[]= this._formService.getFormFields();
  form  = signal<FormGroup<any>>(this._formService.getFormGroup());

  ngOnInit() {
    if (this.sid) {
      //this.form().controls['msg'].setValue(this.msg);
      this._service.msg.set(this.sid);
    }
  }

  get ordersTableColumns(): TableColumnInterface[] {
    return [
      { name: 'Signature', dataKey: 'msg', type: TableCellTypeEnum.TEXT },
      { name: 'Sid', dataKey: 'sid', type: TableCellTypeEnum.TEXT },
      { name: 'Rev', dataKey: 'rev', type: TableCellTypeEnum.TEXT },
      { name: 'Protocol', dataKey: 'protocol', type: TableCellTypeEnum.TEXT },
      { name: 'IP Src', dataKey: 'src_ip', type: TableCellTypeEnum.TEXT },
      { name: 'Port Src', dataKey: 'src_port', type: TableCellTypeEnum.TEXT },
      { name: 'IP Dest', dataKey: 'dest_ip', type: TableCellTypeEnum.TEXT },
      { name: 'Port Dest', dataKey: 'dest_port', type: TableCellTypeEnum.TEXT },
      { name: 'Action', dataKey: 'action', type: TableCellTypeEnum.TEXT },
      { name: 'Status', dataKey: 'status', type: TableCellTypeEnum.CHECKBOX },
      {
        name: '',
        dataKey: 'actions',
        type: TableCellTypeEnum.ACTIONS,
        actions: [{ name: 'edit', label: 'Edit Rule', icon: 'mode_edit' }],
      }
    ];
  }

  getCellDatas(data: any) {

    switch (data.actionName) {
      case 'edit':
        this.redirectToListAlert(data);
        break;
      case 'checkbox':
        this.updateRuleStatusBySid(data.sid, data.checkboxValue);
        break;

      default:
        break;
    }
  }
  private _router = inject(Router);

  redirectToListAlert(data: any) {
    this._router.navigate(['/operator/parameters/rules/edit-rule'], {
      queryParams: { sid: data.sid},
    });
  }


  async updateRuleStatusBySid(sid: number, checked: boolean) {

    const action = checked ? 'enable' : 'disable';

    const response = this._service.updateRuleStatusBySid(sid, action);

    await lastValueFrom(response)
    .then(() => {
      setTimeout(() => {
        this._service.onListRulesFiles.update((update) => update+1);
      }
      , 20000);
      this.toastr.success(`Wait, processing the update of the List Files Rules...`, `Rule Flow ${action}d successfully`, {
        timeOut: 20000,
        extendedTimeOut: 20000,
        tapToDismiss: false,
        progressBar: true
      });
    })
    .catch((error) => {
      this.toastr.error(`Error when ${action} Rule Flow`);
      console.error('Error occurred:', error);
    });
  }

  ruleFlowQueryParams  = signal<RulesFlowQueryParams>({source: ''});

  selectedFileName = this._service.selectedRuleFileName;

  rulesFlow = toSignal(
    combineLatest([toObservable(this.selectedFileName), toObservable(this.ruleFlowQueryParams), toObservable(this._service.onListRulesFiles)]).pipe(
      switchMap(([filename, ruleFlowQueryParams]) =>{
        this.ruleFlowQueryParams().source = filename;
        return this._service.getRulesByFileName(this.ruleFlowQueryParams()).pipe(
          map((response: any) => {
            this.length = response?.total || 0;
            return response?.data || [];
          })
        );
      })
    ), { initialValue: [] }
  );

  sortbyArray: string[] = [];

  tableActions(tableActions: Partial<RulesFlowQueryParams>) {
    if (!tableActions.sortedBy)
    {
      this.ruleFlowQueryParams.update(() => ({
        ...this.ruleFlowQueryParams(),
        ...tableActions,
      }));

      //return;
    } else {
      const sortedKeys = Array.isArray(tableActions.sortedBy) ? tableActions.sortedBy : [tableActions.sortedBy];

      sortedKeys.forEach((key) => {
        const field = key.replace(".keyword", "");
        const existingIndex = this.sortbyArray.findIndex(item => item === field || item === `-${field}`);

        switch (tableActions.orderBy) {
          case "asc":
            existingIndex !== -1 ? this.sortbyArray[existingIndex] = field : this.sortbyArray.push(field);
            break;
          case "desc":
            existingIndex !== -1 ? this.sortbyArray[existingIndex] = `-${field}` : this.sortbyArray.push(`-${field}`);
            break;
          default:
            if (existingIndex !== -1) this.sortbyArray.splice(existingIndex, 1);
        }
      });

      this.ruleFlowQueryParams.update(() => ({
          ...this.ruleFlowQueryParams(),
          sortby: this.sortbyArray.length ? this.sortbyArray.join(',') : undefined,
      }));
    }
  }

  anomaliesDetails = (data: any) => [
    { key: 'Source',    value: data?.source,    type: 'text' },
    { key: 'Status',    value: data?.status,    type: 'text' },
    { key: 'Action',    value: data?.action,    type: 'text' },
    { key: 'Src Port',  value: data?.src_port,  type: 'text' },
    { key: 'Dest Port', value: data?.dest_port, type: 'text' },
    { key: 'Src IP',    value: data?.src_ip,    type: 'text' },
    { key: 'Dest IP',   value: data?.dest_ip,   type: 'text' },
    { key: 'Protocol',  value: data?.protocol,  type: 'text' },
    { key: 'Direction', value: data?.direction, type: 'text' },
    { key: 'SID',       value: data?.sid,       type: 'text' },
    { key: 'REV',       value: data?.rev,       type: 'text' },
    { key: 'Threshold', value: data?.threshold, type: 'text' },
    { key: 'Rule',      value: data.rule,       type: 'area' },
    { key: 'Options	',  value: data.options,    type: 'area' },
  ] as DetailField[];
}
