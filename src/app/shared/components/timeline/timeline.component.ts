import { CommonModule, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-timeline',
    imports: [MatIcon, NgStyle, CommonModule],
    templateUrl: './timeline.component.html',
    styleUrl: './timeline.component.scss'
})
export class TimelineComponent {
  @Input() events: any[] = [];
  @Input() lastData: any = {};
  @Input() firstData: any = null;
  @Output() loadMore: EventEmitter<void> = new EventEmitter<void>();
  loading = false;

  getCombinedEvents(): any[] {
    return this.firstData ? [this.firstData, ...this.events] : this.events;
  }

  getIcon(index: number): string {
    const total = this.events.length;
    if (index === 0) {
      return 'new_releases';
    } else if (index === total - 1) {
      return 'error_outline';
    } else {
      return 'report_problem';
    }
  }

  getColor(severity: number): {
    textColor: string;
    backgroundColor: string;
    iconColor: string;
  } {
    switch (severity) {
      case 4:
        return {
          textColor: '#000000',
          backgroundColor: '#FFC080',
          iconColor: '#FFC080',
        };
      case 3:
        return {
          textColor: '#000000',
          backgroundColor: '#F89200',
          iconColor: '#F89200',
        };
      case 2:
        return {
          textColor: '#000000',
          backgroundColor: '#FF6633',
          iconColor: '#FF6633',
        };
      case 1:
        return {
          textColor: '#000000',
          backgroundColor: '#F44949',
          iconColor: '#F44949',
        };
      default:
        return {
          textColor: '#333',
          backgroundColor: 'gray',
          iconColor: 'gray',
        };
    }
  }

  get lastEvent() {
    return this.lastData;
  }
}