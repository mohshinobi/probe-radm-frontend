import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ago',
  standalone: true
})
export class DateAgoPipe implements PipeTransform {

  transform(value: string | number | Date): string | null {
    if (!value) return null;

    const date = new Date(value as string | number | Date);
    const now = new Date();

    if (isNaN(date.getTime())) return null;

    let diffMs = now.getTime() - date.getTime();

    if (diffMs < 0) {
      diffMs = 0; // Evite les valeurs négatives pour les dates futures
    }

    const minutesTotal = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(minutesTotal / (60 * 24));
    const hours = Math.floor((minutesTotal % (60 * 24)) / 60);
    const minutes = minutesTotal % 60;

    const parts: string[] = [];

    if (days > 0) {
      parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    }
    if (hours > 0 || days > 0) {
      parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    }
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);

    return parts.join(' and ');
  }

}
