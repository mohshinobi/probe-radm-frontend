import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bytesConvert',
  standalone: true
})
export class BytesConvertPipe implements PipeTransform {
  
  transform(value: number | undefined): string {
    if (value === undefined || value === null) {
        return 'N/A';
    }
    
    if (value >= 1000000000) { // Check for Gbps
        const gbps = (value / 1000000000).toFixed(2);
        return `${gbps} Gbps`;
    } else if (value >= 1000000) { // Check for Mbps
        const mbps = (value / 1000000).toFixed(2);
        return `${mbps} Mbps`;
    } else { // Return in Bps
        return `${value.toFixed(2)} Bps`;
    }
}
}
