# Interface – Topologie des Assets (Discovery)

## Objectif

Permet à l'opérateur de visualiser en temps réel l’ensemble des **assets détectés** sur le réseau ainsi que leurs **connexions**, à partir des données extraites de NetAlert X. L’interface fournit une **vue topologique interactive** facilitant l’analyse du réseau et l’identification de comportements anormaux.

---

## Données alimentant la page

Les données proviennent de la **feature Discovery**, qui interroge le conteneur `JZIO_DISCOVERY` (NetAlert X) via API GraphQL.

- **Assets** :
  - Icon
  - Hostname
  - Type
  - Adresse MAC
  - Vendor
  - Première connection (`firstConnection`)
  - Dernière connexion (`lastConnection`)
  - Status (Online/Offline/New)
  - Last IP
  - OS
  - Dernière activité (`lastSeen`)
  - Groupe
  - Présence lors du dernier scan (`presentLastScan`)
  - Proprietaire (`owner`)

---

## API Graphql

### Requette

```bash
curl 'http://localhost:20212/graphql'   -X POST   -H 'Authorization: Bearer <TOKEN>'   -H 'Content-Type: application/json'   --data '{
    "query": "query GetDevices($options: PageQueryOptionsInput) { devices(options: $options) { devices { rowid devMac devName devOwner devType devVendor devLastConnection devStatus } count } }",
    "variables": {
      "options": {
        "page": 1,
        "limit": 10,
        "sort": [{ "field": "devName", "order": "asc" }],
        "search": "",
        "status": "connected"
      }
    }
  }'
```

### Service de requettage (Angular)
```bash
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

    return this._http.post('graph/graphql', body)
    .pipe(
      map((res: any) => {
        res['page'] = params.page || 1;
        res['total'] = res.devices.count || 0;
        res['size'] = params.size || 10;
        res['data'] = res.devices.devices || [];
        delete res.devices; 
        return res;
      })
    );
  }
  ```

### Gestion des CORS

**En Dev** : dans le proxy.json

```json
 "/graph": {
      "target": "http://<IP DE LA SONDE>:20212",
      "secure": false,
      "pathRewrite": { "^/graph": "" },
      "changeOrigin": true,
      "logLevel": "debug"
    }
```

**En Prod** : dans la configuration d'apache2

```bash
   <IfModule mod_proxy.c>
                <IfModule mod_proxy_http.c>
                        ...
                        ProxyPass /graph <IP DE LA SONDE>:20212
                        ProxyPassReverse /graph <IP DE LA SONDE>:20212

                </IfModule>

        </IfModule>
  ```
---

## Utilisateurs cibles

- Opérateurs

---

