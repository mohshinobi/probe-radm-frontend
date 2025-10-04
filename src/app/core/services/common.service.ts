import { Injectable } from '@angular/core';
import { PortMappings, PortData } from '@core/interfaces';

@Injectable({
  providedIn: 'root'
})

export class CommonService {

  // COLORS
  sevColors = ['#F44949', '#94da30', '#F89200', '#FFC080','#019c76','#526aff', '#9C27B0','#33FFBD', '#ec7063', '#a569bd' ];
  chartsColors = [ '#FFC107', '#8BC34A',  '#9C27B0','#03A9F4', '#E5E5EA', '#FF9800',  '#4CAF50', '#673AB7',  '#2196F3',  '#F7DC6F'];
  areaChartColor = '#FFF73F';
  barChartColor = '#FFC107';
  sourceColor = '#33FFBD';
  destinationColor = '#FFBD33';
  dangerColor = '#F44949';

  // IL FAUT METTRE TOUS LES PROTOS
  private colorProto = {
    tcp: '#f44949',
    udp: '#94da30',
    ssh: '#673AB7',
    icmp: '#9999ff',
    tls: '#f2d000',
    http: '#9999ff',
    https: '#ff0000',
    failed: '#f44949',
    dns: '#f89200',
    smtp: '#ec72eb',
    smb: '#019c76',
    snmp: '#28baeb',
    ftp: '#526aff',
    other: '#bebebe',
    others: '#bebebe',
    disabled: '#565656',
    unknown: '#ADD8E6',
  };

  portMappings: PortMappings = {
    80: 'http',
    8080: 'http',
    443: 'https',
    25: 'smtp',
    587: 'smtp',
    143: 'imap',
    993: 'imap',
    110: 'pop3',
    21: 'ftp',
    22: 'ssh',
    53: 'dns',
  };

  transformPortData(data: PortData[], mappings: PortMappings) {
    const transformedData: { [key: string]: number } = {};

    data.forEach(item => {
      const mappedName = mappings[item.name] || 'unknown';
      if (transformedData[mappedName]) {
        transformedData[mappedName] += item.y;
      } else {
        transformedData[mappedName] = item.y;
      }
    });

    return Object.keys(transformedData).map(key => ({
      name: key,
      y: transformedData[key]
    })).sort((a, b) => b.y - a.y);
  }

  getProtosColors(data: any[]) {
    const colors: string[] = [];
    data.forEach(element => {
      const name: keyof typeof this.colorProto = element.name.toLowerCase(); // Add type annotation
      const color = this.colorProto?.[name];
      if (color) {
        colors.push(color);
      } else {
        console.warn(`Color not found for ${element.name}`);
      }
    });
    return colors;
  }

  hexToRgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  }

  exportToCsv(data: any , filename: string) {
    if (data.length === 0) {
      return;
    }
    let csv = '';
    csv += Object.keys(data[0]).join(',') + '\n';
    for (let item of data) {
      csv += Object.values(item).join(',') + '\n';
    }
    let blob = new Blob([csv], { type: 'text/csv' });
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  date(){
    const today = new Date();
    let dates: string[] = [];

    for (let i = 0; i < 8; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const day = date.getDate();
      const month = date.getMonth() + 1;

      dates.push(`${day}/${month}`);
    }
    dates.sort((a, b) => {
      const dateA = new Date(`${a.split('/')[1]}/${a.split('/')[0]}/2024`);
      const dateB = new Date(`${b.split('/')[1]}/${b.split('/')[0]}/2024`);
      return dateA.getTime() - dateB.getTime();
    });
    return dates
  }

  getEmptyMap(){
    return [
      ['fo', 0],
      ['um', 0],
      ['us', 0],
      ['jp', 0],
      ['sc', 0],
      ['in', 0],
      ['fr', 0],
      ['fm', 0],
      ['cn', 0],
      ['pt', 0],
      ['sw', 0],
      ['sh', 0],
      ['br', 0],
      ['ki', 0],
      ['ph', 0],
      ['mx', 0],
      ['es', 0],
      ['bu', 0],
      ['mv', 0],
      ['sp', 0],
      ['gb', 0],
      ['gr', 0],
      ['as', 0],
      ['dk', 0],
      ['gl', 0],
      ['gu', 0],
      ['mp', 0],
      ['pr', 0],
      ['vi', 0],
      ['ca', 0],
      ['st', 0],
      ['cv', 0],
      ['dm', 0],
      ['nl', 0],
      ['jm', 0],
      ['ws', 0],
      ['om', 0],
      ['vc', 0],
      ['tr', 0],
      ['bd', 0],
      ['lc', 0],
      ['nr', 0],
      ['no', 0],
      ['kn', 0],
      ['bh', 0],
      ['to', 0],
      ['fi', 0],
      ['id', 0],
      ['mu', 0],
      ['se', 0],
      ['tt', 0],
      ['my', 0],
      ['pa', 0],
      ['pw', 0],
      ['tv', 0],
      ['mh', 0],
      ['cl', 0],
      ['th', 0],
      ['gd', 0],
      ['ee', 0],
      ['ag', 0],
      ['tw', 0],
      ['bb', 0],
      ['it', 0],
      ['mt', 0],
      ['vu', 0],
      ['sg', 0],
      ['cy', 0],
      ['lk', 0],
      ['km', 0],
      ['fj', 0],
      ['ru', 0],
      ['va', 0],
      ['sm', 0],
      ['kz', 0],
      ['az', 0],
      ['tj', 0],
      ['ls', 0],
      ['uz', 0],
      ['ma', 0],
      ['co', 0],
      ['tl', 0],
      ['tz', 0],
      ['ar', 0],
      ['sa', 0],
      ['pk', 0],
      ['ye', 0],
      ['ae', 0],
      ['ke', 0],
      ['pe', 0],
      ['do', 0],
      ['ht', 0],
      ['pg', 0],
      ['ao', 0],
      ['kh', 0],
      ['vn', 0],
      ['mz', 0],
      ['cr', 0],
      ['bj', 0],
      ['ng', 0],
      ['ir', 0],
      ['sv', 0],
      ['sl', 0],
      ['gw', 0],
      ['hr', 0],
      ['bz', 0],
      ['za', 0],
      ['cf', 0],
      ['sd', 0],
      ['cd', 0],
      ['kw', 0],
      ['de', 0],
      ['be', 0],
      ['ie', 0],
      ['kp', 0],
      ['kr', 0],
      ['gy', 0],
      ['hn', 0],
      ['mm', 0],
      ['ga', 0],
      ['gq', 0],
      ['ni', 0],
      ['lv', 0],
      ['ug', 0],
      ['mw', 0],
      ['am', 0],
      ['sx', 0],
      ['tm', 0],
      ['zm', 0],
      ['nc', 0],
      ['mr', 0],
      ['dz', 0],
      ['lt', 0],
      ['et', 0],
      ['er', 0],
      ['gh', 0],
      ['si', 0],
      ['gt', 0],
      ['ba', 0],
      ['jo', 0],
      ['sy', 0],
      ['mc', 0],
      ['al', 0],
      ['uy', 0],
      ['cnm', 0],
      ['mn', 0],
      ['rw', 0],
      ['so', 0],
      ['bo', 0],
      ['cm', 0],
      ['cg', 0],
      ['eh', 0],
      ['rs', 0],
      ['me', 0],
      ['tg', 0],
      ['la', 0],
      ['af', 0],
      ['ua', 0],
      ['sk', 0],
      ['jk', 0],
      ['bg', 0],
      ['qa', 0],
      ['li', 0],
      ['at', 0],
      ['sz', 0],
      ['hu', 0],
      ['ro', 0],
      ['ne', 0],
      ['lu', 0],
      ['ad', 0],
      ['ci', 0],
      ['lr', 0],
      ['bn', 0],
      ['iq', 0],
      ['ge', 0],
      ['gm', 0],
      ['ch', 0],
      ['td', 0],
      ['kv', 0],
      ['lb', 0],
      ['dj', 0],
      ['bi', 0],
      ['sr', 0],
      ['il', 0],
      ['ml', 0],
      ['sn', 0],
      ['gn', 0],
      ['zw', 0],
      ['pl', 0],
      ['mk', 0],
      ['py', 0],
      ['by', 0],
      ['cz', 0],
      ['bf', 0],
      ['na', 0],
      ['ly', 0],
      ['tn', 0],
      ['bt', 0],
      ['md', 0],
      ['ss', 0],
      ['bw', 0],
      ['bs', 0],
      ['nz', 0],
      ['cu', 0],
      ['ec', 0],
      ['au', 0],
      ['ve', 0],
      ['sb', 0],
      ['mg', 0],
      ['is', 0],
      ['eg', 0],
      ['kg', 0],
      ['np', 0]
    ];
  }

  formatDateTimeLocal(date: Date): string {
    const pad = (num: number) => num.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  convertDateToString(date: Date): string {
      date = new Date(date);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      // Extract the components of the date
      const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with zero if needed
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-indexed) and pad
      const year = date.getFullYear(); // Get full year
      const hours = String(date.getHours()).padStart(2, '0'); // Get hours and pad
      const minutes = String(date.getMinutes()).padStart(2, '0'); // Get minutes and pad
      const seconds = String(date.getSeconds()).padStart(2, '0'); // Get seconds and pad

      // Format the date as 'dd-mm-yyyy hh:mm:ss'
      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }

  setTime(interval?: number, dateBegin?: string, dateEnd?: string) {
    if (dateBegin && dateEnd) {
      return `&startDate=${dateBegin}&endDate=${dateEnd}`
    }
    return `&timeInterval=${interval}`
  }

  /**
   * Get string date
   * Warning : in javascript getMonth start with 0 - for Janury  And getDate not getDay
   * */
  parseDate(datetime: string){
    const date:Date = new Date(datetime);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`; // getMonth start with 0
  }

  /**
   * Get string date for call to api back
   * Warning : in javascript getMonth start with 0 - for Janury  And getDate not getDay
   * */
  parseDateBack(datetime: string) {
    const date = new Date(datetime);
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}T${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}:${date.getUTCSeconds().toString().padStart(2, '0')}`;
  }

  onToggleCheckbox(event: any, checkedIds: string[]) {
    const { _id, checked } = event;
    if (checked && !checkedIds.includes(_id)) {
      checkedIds.push(_id);
    } else {
      const idx = checkedIds.indexOf(_id);
      if (idx !== -1) checkedIds.splice(idx, 1);
    }
  }

  generatePassword(minLength: number = 15, maxLength: number = 25): string {
    // Vérifier que les longueurs minimales et maximales sont valides
    if (minLength < 15 || maxLength < minLength) {
        throw new Error("La longueur minimale doit être d'au moins 15 caractères et la longueur maximale doit être supérieure ou égale à la longueur minimale.");
    }

    // Générer une longueur aléatoire entre minLength et maxLength
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

    const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numericChars = "0123456789";
    const specialChars = "!@#$%^&*()-_=+[]{}|:\,.<>?/"; // Exclut ; ~ ' et " 
    const allChars = upperCaseChars + lowerCaseChars + numericChars + specialChars;
    let password = "";

    // Assurer qu'il y a au moins un caractère de chaque type
    password += upperCaseChars.charAt(Math.floor(Math.random() * upperCaseChars.length));
    password += lowerCaseChars.charAt(Math.floor(Math.random() * lowerCaseChars.length));
    password += numericChars.charAt(Math.floor(Math.random() * numericChars.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

    // Remplir le reste du mot de passe avec des caractères aléatoires
    for (let i = 4; i < length; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Mélanger le mot de passe pour plus de sécurité
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    return password;
  }

  copyToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed'; // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
    document.body.removeChild(textArea);
  }

}
