import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BaseCellComponent } from './base-cell.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-feedback-cell',
    template: `
    <div class="feedback">
      <div class="actions">
        @if(element.feedback.value=="positive") {
        <span class="br-20 positive"> positive </span>
        } @else if (element.feedback.value=="negative") {
        <span class="br-20 negative"> Negative </span>
        } @else {
        <div class="d-flex">
          <span class="br-20">
            <mat-icon class="positive-feed" (click)="onFeedback('positive')"
              >thumb_up</mat-icon
            >
          </span>
          <span class="br-20">
            <mat-icon class="negative-feed" (click)="onFeedback('negative')"
              >thumb_down</mat-icon
            >
          </span>
        </div>
        }
      </div>
    </div>
  `,
    styles: [
        `
      .d-flex {
        display: inline-flex;
        gap: 5px;
      }
      .mat-icon {
        cursor: pointer;
      }
      .positive-feed:hover {
        color: green;
      }
      .negative-feed:hover {
        color: red;
      }
      .negative {
        color: red;
      }
      .positive {
        color: green;
      }
    `,
    ],
    imports: [MatIconModule, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackCellComponent extends BaseCellComponent {
  @Input() feedbackData: any;
  @Output() feedbackChange = new EventEmitter<{
    value: 'positive' | 'negative';
    datas: any;
  }>();

  onFeedback(value: 'positive' | 'negative') {
    // this.feedbackChange.emit({ value, datas: this.element });
    this.element['actionName'] = 'feedbackData';
    this.element['feedbackData'] = value;
    this.cellDatas.emit(this.element);
  }


}
