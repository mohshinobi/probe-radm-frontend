import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CsvService {

    exportAsCsv(dataSource: string[], fileNameTitle: string) {
        const data = dataSource;
        const header = Object.keys(data[0]);
        let csv = data.map((row: any) => header.map((fieldName: string) => JSON.stringify(row[fieldName])).join(','));
        csv.unshift(header.join(','));
        let csvArray = csv.join('\r\n');
        var blob = new Blob([csvArray], {type: 'text/csv' })
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileNameTitle}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}