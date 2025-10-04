import {Component, Input} from '@angular/core';
import {BaseCellComponent} from './base-cell.component';
import {CommonModule} from '@angular/common';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
  selector: 'app-progress-cell',
  standalone: true,
  imports: [MatProgressBarModule, CommonModule],
  template: `
      <div class="progress-container">
          <mat-progress-bar class="custom-progress"
                            mode="determinate"
                            [ngClass]="getDynamicColor()"
                            [value]="getDataKeyValue.full">
          </mat-progress-bar>
          <span class="progress-value">{{ getDataKeyValue.full }}%</span>
      </div>
  `,
  styles: [`
    .custom-progress.mat-mdc-progress-bar {
      --mdc-linear-progress-track-height: 20px;
      --mdc-linear-progress-active-indicator-height: 20px;
      --mdc-linear-progress-track-color: #454443;
      &.yellow {
        --mdc-linear-progress-active-indicator-color: #ffd100;
      }
      &.orange {
        --mdc-linear-progress-active-indicator-color: #ff7c0a;
      }
      &.red {
        --mdc-linear-progress-active-indicator-color: #c41e3a;
      }
      height: 20px;
      border-radius: 4px;
    }

    .progress-container {
      position: relative;
      width: 100%;
      margin: 16px 0;
    }

    .progress-value {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 14px;
      color: #fff;
      font-weight: bold;
    }
  `],
})
export class ProgressCellComponent extends BaseCellComponent {
  @Input() progress: number | undefined;

  getDynamicColor(): string {
    if (this.getDataKeyValue.full <= 33) return 'yellow';
    else if (this.getDataKeyValue.full <= 70) return 'orange';
    else return 'red';
  }
}
