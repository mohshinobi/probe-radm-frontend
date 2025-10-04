import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, lastValueFrom, map, switchMap } from 'rxjs';
import { Router, RouterOutlet } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BytestohumanPipe } from '@shared/pipes/bytestohuman.pipe';
import { RuleFlowService } from './rule-flow.service';

@Component({
    selector: 'app-rule-flow',
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatSlideToggleModule,
        RouterOutlet,
        MatTooltipModule,
        BytestohumanPipe
    ],
    templateUrl: './rule-flow.component.html',
    styleUrl: './rule-flow.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RuleFlowComponent {
  private _service = inject(RuleFlowService);
  private _router = inject(Router);
  private toastr = inject(ToastrService);

  readonly rulesFilesList = toSignal(
    combineLatest([toObservable(this._service.onListRulesFiles)]).pipe(
      switchMap(() => {
        return this._service.getListFileRules().pipe(map(response => response?.data?.sources))
      })
    )
  );

  async changeRuleFlowActivation(fileName: string, checked: boolean) {
    const action = checked ? 'activate' : 'deactivate';

    try {
      await lastValueFrom(this._service.changeRuleFlowActivation(fileName, action));
      this.messageSuccess(`Rules File ${action}d successfully`);
    } catch (error) {
      this.toastr.error(`Error when ${action} Rules File`);
      console.error('Error occurred:', error);
    }
  }

  view(file: any) {
    this._service.msg.set(null);
    this._service.selectedRuleFileName.update(() => file.name);
    this._router.navigate(['/operator/parameters/rules/view-rules']);
  }

  private messageSuccess(message: string) {
    setTimeout(() => {
      this._service.onListRulesFiles.update((update) => update + 1);
    }, 5000);

    this.toastr.success(`Wait, processing the update of the List Rules...`, message, {
      timeOut: 5000,
      extendedTimeOut: 5000,
      tapToDismiss: false,
      progressBar: true
    });
  }
}
