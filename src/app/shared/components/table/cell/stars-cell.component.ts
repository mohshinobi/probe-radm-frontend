import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseCellComponent } from './base-cell.component';

@Component({
  standalone: true,
  selector: 'app-stars-cell',
  template: `
    <span [style.color]="getStarsColor()" [innerHTML]="getStarsHtml()"></span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarsCellComponent extends BaseCellComponent {
  getStarsHtml(): string {
    const numStars = this.getDataKeyValue.full;
    return '★'.repeat(numStars);
  }

  getStarsColor(): string {
    const numStars = this.getDataKeyValue.full;
    switch (numStars) {
      case 1:
        return 'rgb(244, 73, 73)';
      case 2:
        return 'rgb(255, 102, 51)';
      case 3:
        return 'rgb(248, 146, 0)';
      case 4:
        return 'rgb(247, 215, 170)';
      default:
        return 'black'; // default color
    }
  }

}