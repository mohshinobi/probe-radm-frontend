import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'round',
  standalone: true
})
export class RoundPipe implements PipeTransform {
    transform(value: number|undefined): string {
      if(!value) {
        return 'N/A';
      }
      if(value <1) {
        return value.toString();
      }
      return Math.round(value).toString();
    }
}
