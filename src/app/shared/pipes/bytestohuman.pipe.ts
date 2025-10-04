import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bytestohuman',
  standalone: true
})
export class BytestohumanPipe implements PipeTransform {

  transform(bytes: number, precision: number = 2): string {
    if (!bytes || bytes <= 0) {
      return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let index = 0;

    while (bytes >= 1024 && index < units.length - 1) {
      bytes /= 1024;
      index++;
    }

    return `${bytes.toFixed(precision)} ${units[index]}`;
  }

}

