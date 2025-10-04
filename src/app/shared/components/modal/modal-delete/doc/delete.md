# Documentation Technique — Suppression des alertes

## 1. Présentation

La suppression des alertes côté front repose sur:
- Un service `DeleteModalService` pour gérer la modal et la logique de suppression
- Un composant de modal `ModalDeleteComponent`
- L’intégration dans n’importe quel tableau, avec gestion de la delete (`_id`), multi-delete (`[_id]`), suppression par champ (`src_ip`, `signature_id`), ou par plage de dates

---

## 2. Fonctionnement global

- L’utilisateur peut:
  - Supprimer une alerte unique via `_id`
  - Supprimer toutes les alertes avec une même signature (`signature_id`)
  - Supprimer toutes les alertes avec un même `src_ip`
  - Supprimer plusieurs alertes via sélection multiple (checkbox)
  - Supprimer par plage de dates (`@timestamp`)
- Un seul service et une seule modal suffisent pour toutes les tables du projet.

---

## 3. Implémentation étape par étape

### a. Côté composant de liste (exemple: `AlertsListComponent`)

#### i. Colonnes et configuration du tableau

- **Ajoute une colonne checkbox** pour la sélection multiple et une action **delete**
  ```typescript
  get ordersTableColumns(): TableColumnInterface[] {
    return [
      { name: '', dataKey: '_id', type: TableCellTypeEnum.CHECKBOX2 },
      {
        name: 'Actions',
        dataKey: 'actions',
        type: TableCellTypeEnum.ACTIONS,
        isSortable: false,
        actions: [
          {
            name: 'delete',
            label: 'Alert delete',
            icon: 'delete',
            params: ['_id', 'alert.signature_id', 'src_ip'],
          },
        ],
      },
    ];
  }

- **Ajoute `_id` à displayedColumns**
  ```typescript
    displayedColumns = [
    '_id',
    ];

- **Ajout d'une varible pour contenir les `_id` sélectionnées**
  ```typescript
    checkedIds: string[] = [];

- **Ajout de la gestion des checkbox**
  ```typescript
  // Dans le switch d'actions :
    case 'checkbox':
    this._commonService.onToggleCheckbox(data, this.checkedIds);
    break;

- **Ajout du bouton de suppression dans le template**
  ```angular17html
  <button slot="delete-button"
        (click)="openDeleteModal()"
        mat-button
        class="button-action">
  <mat-icon>delete</mat-icon> Delete
  </button>

- **Ajout de l'appel de la modal delete lors du clique sur le bouton action delete**
  ```typescript
  // Dans le switch d'actions :
  case 'delete':
  this.openDeleteModal(data);
  break;

- **Appel de la modal et logique suppression**
  ```typescript
  openDeleteModal(rowData?: any): void {
    this._deleteModalService.openAndDelete({
      rowData,
      checkedIds: this.checkedIds,
      deleteService: this._alertsService,
      refreshFn: () => {
        // rechargement du tableau, remise à zéro de checkedIds
        this.alertsQueryParams.update(() => ({ ...this.alertsQueryParams() }));
      }
    });
  }

### b. Le service DeleteModalService
Centralise toute la logique (modal, checks, payload, toast, reset sélection) 

### c. La modal générique

Affiche dynamiquement les options selon le contexte (ligne vs sélection multiple vs par date)

Émet le payload selon les choix

## 4. Exemple de payload envoyé au backend

### a. Suppression d'une alerte unique
  ```json
  {
    "should": [
      { "field": "_id", "values": ["f3abef12e..."] }
    ]
  }
  ```

### b. Suppression d'une alerte + par signature:
  ```json
  {
    "should": [
      { "field": "_id", "values": ["f3abef12e..."] },
      { "field": "alert.signature_id", "values": [1023] }
    ]
  }
  ```

### c. Suppression multiple (checkbox):
  ```json
  {
    "should": [
      { "field": "_id", "values": ["f3abef12e...", "2abfe241...", "0aebcde3..."] }
    ]
  }
  ```

### d. Suppression par date:
  ```json
  {
    "should": [
      {
        "field": "@timestamp",
        "range": {
          "gte": "2024-06-03T00:00",
          "lte": "2024-06-04T23:59"
        }
      }
    ]
  }
  ```
