import {inject, Injectable} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalDeleteComponent } from '../modal-delete.component';
import {catchError, concatMap, Observable, of, tap} from 'rxjs';
import {ToastrService} from "ngx-toastr";
import {RuleFlowService} from "@features/operator/parameters/rules/flow/rule-flow.service";

@Injectable({ providedIn: 'root' })
export class DeleteModalService {

  private _dialog = inject(MatDialog);
  private _toastrService = inject(ToastrService);
  private _ruleService = inject(RuleFlowService);

  open(data: any, checkedIds: string[] = []): Observable<any> {
    const dialogRef = this._dialog.open(ModalDeleteComponent, {
      data: { data, checkedIds },
      width: '700px',
      disableClose: true,
      panelClass: 'custom-dialog-container',
      autoFocus: false
    });

    const component = dialogRef.componentInstance;

    return new Observable((observer) => {
      const sub1 = component.confirm.subscribe((payload: any) => {
        observer.next(payload);
        observer.complete();
        dialogRef.close();
      });
      const sub2 = component.cancel.subscribe(() => {
        observer.next(null);
        observer.complete();
        dialogRef.close();
      });
      dialogRef.afterClosed().subscribe(() => {
        sub1.unsubscribe();
        sub2.unsubscribe();
      });
    });

  }

  prepareDelete(payload: any, deleteService: { deleteAlertsAdvanced: (body: any) => Observable<any> }, refresh: () => void): void {
    const allowedFields = ['_id', 'alert.signature_id', 'src_ip', '@timestamp'];
    const should: any[] = [];
    let hasCriteria = false;

    function safeField(field: string) {
      return allowedFields.includes(field);
    }

    if (payload?.data?._id) {
      should.push({field: '_id', values: [payload.data._id]});

      if (payload.deleteAllAlertsBySignature && payload.data.alert?.signature_id) {
        should.push({field: 'alert.signature_id', values: [payload.data.alert.signature_id]});
      }
      if (payload.deleteAllAlertsBySource && payload.data.src_ip) {
        should.push({field: 'src_ip', values: [payload.data.src_ip]});
      }
      hasCriteria = true;

      if ((payload.checkedIds && payload.checkedIds.length > 0) || payload.deleteByDate) {
        this._toastrService.error('You cannot combine unique delete with multiple selection or date.');
        return;
      }

    } else {
      if (payload.checkedIds && payload.checkedIds.length > 0) {
        should.push({field: '_id', values: payload.checkedIds});
        hasCriteria = true;
      }
      if (payload.deleteByDate && payload.startDate && payload.endDate) {
        if (new Date(payload.startDate) > new Date(payload.endDate)) {
          this._toastrService.error('Start date must be before end date');
          return;
        }
        should.push({
          field: '@timestamp',
          range: {gte: payload.startDate, lte: payload.endDate}
        });
        hasCriteria = true;
      }
    }

    if (!hasCriteria) {
      this._toastrService.warning('No valid delete option selected.');
      return;
    }

    for (const cond of should) {
      if (!safeField(cond.field)) {
        this._toastrService.error('Unauthorized field in delete request.');
        return;
      }
    }

    const sidToUpdate: number | undefined =
      payload?.data?.alert?.signature_id ??
      should.find(s => s.field === 'alert.signature_id')?.values?.[0];

    deleteService.deleteAlertsAdvanced({should}).pipe(
      tap(() => this._toastrService.success(`Alerts deleted`)),
      concatMap(() => {
        if (!sidToUpdate) {
          return of(null);
        }
        return this._ruleService.updateRuleStatusBySid(Number(sidToUpdate), 'disable').pipe(
          tap(() => this._toastrService.success(`Rule ${sidToUpdate} disabled`)),
          catchError(() => {
            this._toastrService.error(`failed to disabled rule ${sidToUpdate}`);
            return of(null);
          })
        );
      }),
      catchError(() => {
        this._toastrService.error('Error deleting alerts');
        return of(null);
      })
    ).subscribe({
      next: () => {
        refresh();
      }
    });
  }

  openAndDelete({rowData, checkedIds, deleteService, refreshFn}: {
    rowData?: any;
    checkedIds: string[];
    deleteService: { deleteAlertsAdvanced: (body: any) => Observable<any> };
    refreshFn: () => void;
  }) {
    this.open(rowData, checkedIds).subscribe((payload: any) => {
      if (payload) {
        this.prepareDelete(payload, deleteService, () => {
          refreshFn();
          if (checkedIds) checkedIds.length = 0;
        });
      }
    });
  }
}
