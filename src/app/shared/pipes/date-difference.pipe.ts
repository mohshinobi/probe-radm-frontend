import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'dateDifference'
})
export class DateDifferencePipe implements PipeTransform {

  transform(startDate: string, endDate: string): string {
    if (startDate === '' || endDate === '') {
      return '0';
    }

    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();

    const timeDifferenceInMilliseconds = endTime - startTime;
    const isPositiveDifference = timeDifferenceInMilliseconds >= 0;
    const absoluteTimeDifference = Math.abs(timeDifferenceInMilliseconds);

    const differenceInDays = Math.floor(absoluteTimeDifference / (1000 * 60 * 60 * 24));
    const remainingMillisecondsAfterDays = absoluteTimeDifference % (1000 * 60 * 60 * 24);

    const differenceInHours = Math.floor(remainingMillisecondsAfterDays / (1000 * 60 * 60));
    const remainingMillisecondsAfterHours = remainingMillisecondsAfterDays % (1000 * 60 * 60);

    const differenceInMinutes = Math.floor(remainingMillisecondsAfterHours / (1000 * 60));

    const timeDifferenceSign = isPositiveDifference ? '+' : '-';


    if (differenceInDays >= 1) {
      return `${timeDifferenceSign}${differenceInDays}d`;
    } else if (differenceInHours >= 1) {
      return `${timeDifferenceSign}${differenceInHours}h`;
    } else if (differenceInMinutes >= 1) {
      return `${timeDifferenceSign}${differenceInMinutes}m`;
    } else {
      return `${timeDifferenceSign}0m`;
    }
  }
}


