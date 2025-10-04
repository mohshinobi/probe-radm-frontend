import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numbersPipe',
  standalone: true
})
export class NumbersPipe implements PipeTransform {
    transform(value: number|undefined): string {
      if(!value && value != 0) {
        return 'Undefined'
      }
      if (value >= 1000000000) {
        return (value / 1000000000).toFixed(1) + 'B';
      } 
      else if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
      } else {
        return value.toString();
      }
    }
}
