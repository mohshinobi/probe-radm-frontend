import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'leftDays',
  standalone: true
})
export class LeftDaysPipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (!value) {
      return 'No date';
    }
    const currentDate = new Date();
    const targetDate = new Date(value);
    const diffInMs = targetDate.getTime() - currentDate.getTime();
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    return `${days} days`;
  }
}