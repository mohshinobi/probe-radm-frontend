import {ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { BaseCellComponent } from './base-cell.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TokenService } from '@core/services/token.service';

@Component({
    selector: 'app-checkbox-cell',
    template: `
    @if(this.element.username != 'admin' && this.element.username != username ) {
      <mat-checkbox
        class="example-margin"
        (change)="onCheck($event.checked)"
        [checked]="isChecked()"
      />
    }
      @else {
        @if(this.element.username == 'admin') {
          <mat-icon class="mr-2" matTooltip='This user is protected: It cannot be deleted or modified (except to change their own password). Additionally, even if LDAP authentication is enabled, this user cannot log in via LDAP.'>help</mat-icon>
        }
        @else {
                    <mat-icon class="mr-2" matTooltip='You cannot delete your own account.'>help</mat-icon>
        }

      }
  `,
    styles: `
  .mr-2 {
    margin-left: 12%;
  }`,
    imports: [
        MatCheckboxModule, MatIconModule, MatTooltipModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
    // styleUrl: ''
})
export class CheckboxCell2Component extends BaseCellComponent {

  @Input() checkedIds: number[] = [];

  private _tokenService = inject(TokenService)

  isChecked(): boolean {
    return this.checkedIds.includes(this.element[this.tableColumn.dataKey]); // ou .full selon ton modèle
  }

  onCheck(checked: boolean) {
    this.element['actionName'] = 'checkbox';
    this.element['checked'] = checked;
    this.cellDatas.emit(this.element);
  }

  username = this._tokenService.getUser()?.username;


}
