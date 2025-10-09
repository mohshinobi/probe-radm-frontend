import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { proxyPath } from '@configs/api-url.config';
import { ApiResponse } from '@core/interfaces/api-response.interface';
import { BaseParamsInterface } from '@core/interfaces/base-params.interface';
import { CommonService } from '@core/services';
import { buildHttpParams2 } from '@core/services/buildHttpParams';
import { catchError, map, Observable, of, filter, tap } from 'rxjs';

export interface AssetsQueryParams extends BaseParamsInterface {
  display_col?: string[];
  hostname?: string;
  src_ip?: string;
  status?: string;
  timestamp?: string;
  os?: string;
  Open_port?: string;
  service?: string;
  mac_address?: string;
  community_id?: string;
  sortedBy?: string;
  orderBy?: string;
  page?: number;
  pagePrevious?: number;
  size?: number;
  id?: string;
  direction?: 'next' | 'previous';
  after?: { [key: string]: string } | null;
}

const paramMapping: { [key: string]: string } = {
  display_col: 'displayedField[]',
  Open_port: 'filter[ports.port]',
  os: 'filter[os]',
  src_ip: 'filter[src_ip]',
  timestamp: 'filter[@timestamp]',
  status: 'filter[status]',
  mac_address: 'filter[mac_address]',
  service: 'filter[service]',
  sortedBy: 'sortedBy',
  orderBy: 'orderBy',
  community_id: 'match[community_id]',
  id: 'match[_id]',
};

const _discoveryApi = proxyPath.discovery;

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  private _http = inject(HttpClient);


  getDevices(
    params: {page:number, size: number, sortedBy: string, orderBy: string,
      devName?: "", devType?: "", devVendor?: "", devLastConnection?: "", devStatus?: "", devLastIP?: ""
    }, 
  ): Observable<any> {

    const optionalFields: (keyof typeof params)[] = [
      'devName',
      'devType',
      'devVendor',
      'devLastConnection',
      'devStatus',
      'devLastIP'
    ];
  
    const filters: any[] = [];

    for (const key of optionalFields) {
      const value = params[key];
      if (value && value !== '') {
        filters.push({
          filterColumn: key,
          filterValue: value
        });
      }
    }

    const body = {
      query: `
        query GetDevices($options: PageQueryOptionsInput) {
          devices(options: $options) {
            devices {
              rowid
              devIcon
              devMac
              devName
              devOwner
              devType
              devVendor
              devLastConnection
              devLastIP
              devStatus
              devIsNew
              devPresentLastScan
            }
            count
          }
        }
      `,
      variables: {
        options: {
          page: params.page,
          limit: params.size,
          sort: [{ field: params.sortedBy, order: params.orderBy }],
          filters: filters
        }
      }
    };

    return this._http.post(_discoveryApi+'/graphql', body)
    .pipe(
      map((res: any) => {
        res['page'] = params.page || 1;
        res['total'] = res.data.devices.count || 0;
        res['size'] = params.size || 10;
        res['data'] = res.data.devices.devices || [];
        delete res.devices; 
        return res;
      })
    );
  }

  getDeviceDetails(mac: string): Observable<any> {
    const body = {
      query: `
        query getServerDeviceData($mac: String!) { 
          devices(options: { search: $mac }) { 
            devices { 
            rowid, 
            devMac, 
            devName, 
            devOwner, 
            devType, 
            devVendor, 
            devFavorite, 
            devGroup, 
            devComments, 
            devFirstConnection, 
            devLastConnection, 
            devLastIP, 
            devStaticIP, 
            devScan, 
            devLogEvents, 
            devAlertEvents, 
            devAlertDown, 
            devSkipRepeated, 
            devLastNotification, 
            devPresentLastScan, 
            devIsNew, 
            devLocation, 
            devIsArchived, 
            devParentMAC, 
            devParentPort, 
            devIcon, 
            devGUID, 
            devSite, 
            devSSID, 
            devSyncHubNode,
            devSourcePlugin, 
            devCustomProps, 
            devStatus,                                  
            } 
            count 
          } 
        }
      `,
      variables: {
        mac: mac
      }
    };

    return this._http.post(_discoveryApi+'/graphql', body)
    .pipe(
      map((res: any) => {
        return res.data.devices.devices[0];
      })
    );
   
      
  }

  getItStats(): Observable<any> {
    const body = {
      query: `
        query {
          Total: devices(options: {limit: 1}) { count }
          Connected: devices(options: {limit: 1, status: \"connected\"}) { count }
          Offline: devices(options: {limit: 1, status: \"offline\"}) { count }
          New: devices(options: {limit: 1, status: \"new\"}) { count }
          Down: devices(options: {limit: 1, status: \"down\"}) { count }
        }
      `
    };

    return this._http.post(_discoveryApi+'/graphql', body);
  }

  getDeviceByMac(mac: string): Observable<any> {
    const body = {
      query: `
        query GetDeviceByMac($mac: String!) { 
          devices(options: { search: $mac }) { 
            devices { 
              devFirstConnection
              devGroup
              devIcon
              devIpLong
              devIsNew
              devLastConnection
              devLastIP
              devLocation
              devMac
              devName
              devOwner
              devPresentLastScan
              devSite
              devStatus
              devType
              devVendor
              rowid
            } 
            count 
          } 
        }
      `,
      variables: {
        mac: mac
      }
    };

    return this._http.post(_discoveryApi+'/graphql', body)
    .pipe(
      map((res: any) => {
        return res.data.devices.devices[0];
      })
    );
  };

  getDevicesByTime(): Observable<any> {
    const now = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(now.getDate() - 7); // Date il y a 7 jours

  
    const body = {
      query: `
        query GetDevicesByTime($options: PageQueryOptionsInput) {
          devices(options: $options) {
            devices {
              devIcon devType devMac devName devLastConnection
            }
            count
          }
        }
      `,
      variables: {
        options: {
          sort: [{ field: 'devLastConnection', order: 'desc' }],
        },
      },
    };
  
    return this._http.post(_discoveryApi+'/graphql', body)
     .pipe(
      map((response: any) => {
        const devices = response.data.devices.devices || [];
        // Formatter les dates sans les heures, minutes et secondes
        const datesOnly: string[] = devices.map((device:any) => {
          // Extraire la date sans l'heure
          return device.devLastConnection.split(' ')[0]; // Prend la première partie avant l'espace
        });

        // Garder uniquement les dates - 7 jours
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        // Filtrer les dates qui se situent dans l'intervalle [now - 7 jours, now]
        let filteredDates: string[] = datesOnly.filter((dateString) => {
          const date = new Date(dateString);
          return date >= sevenDaysAgo && date <= now;
        });

        // Grouper les dates et compter les occurrences
        const groupedData: { [key: string]: number } = {};

        filteredDates.forEach(dateString => {
          if (groupedData[dateString]) {
              groupedData[dateString] += 1; // Incrémenter le compteur
          } else {
              groupedData[dateString] = 1; // Initialiser le compteur
          }
        });

        // Convertir l'objet en tableau de [timestamp, count]
        const result = Object.keys(groupedData).map(date => {
          const parseDate = (dateString: string): number => {
            const [year, month, day] = dateString.split('-').map(Number);
            return Date.UTC(year, month - 1, day); // UTC (YYYY, MM-1, DD)
          };

          return [parseDate(date), groupedData[date]]; // Retourner le tableau [timestamp, count]
        });

        result.sort((a, b) => a[0] - b[0]);

        return result; 
      })
    ); 
  }

  getDevicesByDate(): Observable<{ categories: string[], series: { name: string, data: number[] }[] }> {
    const body = {
      query: `
        query GetDevicesByTime($options: PageQueryOptionsInput) {
          devices(options: $options) {
            devices {
              devLastConnection
              devPresentLastScan
            }
            count
          }
        }
      `,
      variables: {
        options: {
          sort: [{ field: 'devLastConnection', order: 'desc' }],
        },
      },
    };
  
    return this._http.post(_discoveryApi+'/graphql', body).pipe(
      map((response: any) => {
        const devices = response.data.devices.devices || [];
  
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
  
        // Générer les 30 derniers jours comme catégories
        const categories: string[] = [];
        const dateMap = new Map<string, { connected: number, offline: number }>();
  
        for (let i = 0; i <= 30; i++) {
          const date = new Date(thirtyDaysAgo);
          date.setDate(date.getDate() + i);
          const dateStr = date.toISOString().split('T')[0]; // yyyy-mm-dd
          categories.push(dateStr);
          dateMap.set(dateStr, { connected: 0, offline: 0 });
        }
  
        // Parcourir les devices et remplir les stats
        devices.forEach((device: any) => {
          const rawDate = device.devLastConnection;
  
          if (!rawDate) return;
  
          // Support des formats comme "2025-03-28 16:11:10+01:00"
          const parsedDate = new Date(rawDate);
          const dateStr = parsedDate.toISOString().split('T')[0]; // yyyy-mm-dd
  
          const isConnected =
            device.devPresentLastScan === 1 ||
            device.devPresentLastScan === "1" ||
            device.devPresentLastScan === true;
  
          if (dateMap.has(dateStr)) {
            const entry = dateMap.get(dateStr)!;
            if (isConnected) {
              entry.connected += 1;
            } else {
              entry.offline += 1;
            }
          }
        });
  
        // Construire les séries à partir des catégories
        const connectedSeries: number[] = [];
        const offlineSeries: number[] = [];
  
        categories.forEach(date => {
          const data = dateMap.get(date)!;
          connectedSeries.push(data.connected);
          offlineSeries.push(data.offline);
        });
  
        return {
          categories,
          series: [
            { name: 'Connected', data: connectedSeries, color: '#2E8B57' },
            { name: 'Offline', data: offlineSeries, color: '#F44949' }
          ]
        };
      })
    );
  }

  getDeviceByDate(mac: string): Observable<{ categories: string[], series: { name: string, data: number[] }[] }> {
    const body = {
      query: `
        query GetDeviceByMac($mac: String!) { 
          devices(options: {search: $mac}) { 
            devices { 
              devLastConnection
              devPresentLastScan
              devMac
            } 
            count 
          } 
        }
      `,
      variables: {
        mac: mac
      },
      options: {
        sort: [{ field: 'devLastConnection', order: 'desc' }],
      }
    };
  
    return this._http.post(_discoveryApi+'/graphql', body).pipe(
      map((response: any) => {
        const devices = response.data.devices.devices || [];

  
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
  
        // Générer les 30 derniers jours comme catégories
        const categories: string[] = [];
        const dateMap = new Map<string, { connected: number, offline: number }>();
  
        for (let i = 0; i <= 30; i++) {
          const date = new Date(thirtyDaysAgo);
          date.setDate(date.getDate() + i);
          const dateStr = date.toISOString().split('T')[0]; // yyyy-mm-dd
          categories.push(dateStr);
          dateMap.set(dateStr, { connected: 0, offline: 0 });
        }
  
        // Parcourir les devices et remplir les stats
        devices.forEach((device: any) => {
          const rawDate = device.devLastConnection;
  
          if (!rawDate) return;
  
          // Support des formats comme "2025-03-28 16:11:10+01:00"
          const parsedDate = new Date(rawDate);
          const dateStr = parsedDate.toISOString().split('T')[0]; // yyyy-mm-dd
  
          const isConnected =
            device.devPresentLastScan === 1 ||
            device.devPresentLastScan === "1" ||
            device.devPresentLastScan === true;
  
          if (dateMap.has(dateStr)) {
            const entry = dateMap.get(dateStr)!;
            if (isConnected) {
              entry.connected += 1;
            } else {
              entry.offline += 1;
            }
          }
        });
  
        // Construire les séries à partir des catégories
        const connectedSeries: number[] = [];
        const offlineSeries: number[] = [];
  
        categories.forEach(date => {
          const data = dateMap.get(date)!;
          connectedSeries.push(data.connected);
          offlineSeries.push(data.offline);
        });
  
        return {
          categories,
          series: [
            { name: 'Connected', data: connectedSeries, color: '#2E8B57' },
            { name: 'Offline', data: offlineSeries, color: '#F44949' }
          ]
        };
      })
    );
  }


  getLastNew(): Observable<any> {
    const body = {
      query: `
        query GetLastNew($options: PageQueryOptionsInput) {
          devices(options: $options) {
            devices {
              devLastConnection
              devPresentLastScan
              devName
              devIcon
              devMac
            }
            count
          }
        }
      `,
      variables: {
        options: {
          page: 1,
          limit : 10,
          sort: [{ field: 'devLastConnection', order: 'desc' }],
          status: 'New'
        },
      },
    };
  
    return this._http.post(_discoveryApi+'/graphql', body).pipe(
      map((res: any) => { 
        return res.data.devices.devices;
      })
    );
  }

  getDeviceHistory(mac: string): Observable<any> {
    const body = {
      query: `
        query GetDeviceHistory($mac: String, $options: PageQueryOptionsInput) {
          devices(options: $options) {
            devName
            devLastIP
            devStatus
            devMAC
            connectionHistory(mac: $mac) {
              timestamp
              ip
              eventType
              location
              interface
              vendor
              site
            }
          }
        }
      `,
      variables: {
        mac: mac,
      }
    };
  
    return this._http.post(_discoveryApi+'/graphql', body);
  }

}