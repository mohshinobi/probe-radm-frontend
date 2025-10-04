# Interface – Configuration

## Objectif

Permet à l'opérateur et à l'administrateur de configurer la sonde.
Pour l'instant, les configurations disponibles sont :

- **Configuration Flow**
    - Adresse groups
    - Port groups
- **Configration Syslog**
    - Alert 
    - System
- **Configuration Classtype**
- **Configuration LDAP**

---

## Données alimentant la page

Les données proviennent de l'API de configuration fournie par l'équipe Core et déployée sur le port 8081, qui interroge le conteneur `JZIO_SYSTEM`. L'Api en question est en mode REST et exploitable via un swagger accessible avec la route /docs.

---

## Spécifications techniques


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
 "/config": {
      "target": "https://<IP DE LA SONDE>:8081",
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
                        ProxyPass /config https://<IP DE LA SONDE>:8081
                        ProxyPassReverse /config https://<IP DE LA SONDE>:8081

                </IfModule>

        </IfModule>
  ```
---

## Utilisateurs cibles

- Opérateurs
- Administrateurs

---

