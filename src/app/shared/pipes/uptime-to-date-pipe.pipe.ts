import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uptimeToDatePipe',
  standalone: true
})
export class UptimeToDatePipePipe implements PipeTransform {

  transform(value: number): string {
    const days = Math.floor(value / 86400);
    const hours = Math.floor((value % 86400) / 3600);
    const minutes = Math.floor(((value % 86400) % 3600) / 60);
    const seconds = Math.floor(((value % 86400) % 3600) % 60);
    return `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;
  }

}
