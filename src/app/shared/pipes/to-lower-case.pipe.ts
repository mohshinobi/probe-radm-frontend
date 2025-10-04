import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toLowerCase',
  standalone: true
})
export class ToLowerCasePipe implements PipeTransform {

  transform(value: string): string {

    return value.toLowerCase();
  }

}
