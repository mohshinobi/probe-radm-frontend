import {ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from './base-cell.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-confidence-cell',
    template: `
    <span [ngClass]="getSeverityClass(getDataKeyValue.full)">{{getConfidence(getDataKeyValue.full)}}</span>
  `,
    styles: `
   .critical {
      color: #F44949;
    }
    .high {
      color: #FF6633;
    }
    .medium {
      color: #F89200;
    }
    .low {
      color: #FFC080;
    }
  `,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
    // styleUrl: ''
})
export class ConfidenceCellComponent extends BaseCellComponent {

  getConfidence(confidence: number) {
    // Return the confidence level
    switch (confidence) {
      case 1: return 'Very Low';
      case 2: return 'Low';
      case 3: return 'High';
      case 4: return 'Very High';
      default: return ''; 
    }
  }

  getSeverityClass(confidence: number) {
    // Return the severity class
    switch (confidence) {
      case 1: return 'low';
      case 2: return 'medium';
      case 3: return 'high';
      case 4: return 'critical';
      default: return '';
    }
  }
}