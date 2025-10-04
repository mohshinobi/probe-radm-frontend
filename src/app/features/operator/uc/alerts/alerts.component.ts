import {AfterViewInit, Component, inject, OnDestroy, Renderer2, signal} from '@angular/core';
import {TableComponent} from "@shared/components/table/table.component";
import {FormGroup} from "@angular/forms";
import {TableColumnInterface} from "@core/interfaces";
import {UsecasesService} from "@features/operator/uc/usecases/usecases.service";
import {UsecasesFormService} from "@core/services/forms/usecases-form.service";
import {BaseField} from "@shared/components/form/fields";
import {AlertsUcService} from "@features/operator/uc/alerts/alerts-uc.service";
import {Router} from "@angular/router";
import {JsonPipe} from "@angular/common";
import {PageHeaderComponent} from "@layout/page-header.component";

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [TableComponent, JsonPipe, PageHeaderComponent],
  providers: [UsecasesService, UsecasesFormService, AlertsUcService],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.scss'
})
export class AlertsComponent{

  private _renderer = inject(Renderer2);
  private _usecasesService     = inject(UsecasesService);
  private _usecasesFormService = inject(UsecasesFormService);
  private _alertsUcFormService = inject(AlertsUcService);
  private _router = inject(Router)

  fields!: BaseField<string | number>[];
  displayedColumns = this._alertsUcFormService.displayedColumns;
  form = signal<FormGroup<any>>(this._usecasesFormService.getFormGroup());
  ordersTableColumns: TableColumnInterface[] = this._alertsUcFormService.ordersTableColumns;
  length = this._usecasesService.length;

  alerts = this._alertsUcFormService.getAllAlerts();

  getCellDatas(data: any) {
    switch (data.actionName) {
      case 'details':
        this.redirectToDetail(data);
        break;
      default:
        break;
    }
  }

  redirectToDetail(data: any) {
    console.log(data)
    this._router.navigate(['/operator/uc/alerts/details'], {
      queryParams: {
        ucId: data.usecase_alert_ID
      }
    });
  }

}
