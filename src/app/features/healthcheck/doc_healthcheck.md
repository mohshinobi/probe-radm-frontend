# Documentation Technique - Composant HealthCheck

## Vue d'ensemble

Le composant `HealthcheckComponent` est un dashboard de surveillance système développé en Angular qui fournit une interface complète pour monitorer la santé et les performances d'un système de notre Sonde. Il affiche des métriques en temps réel sur l'état du moteur de flux, les performances système, et les règles de sécurité.

## Architecture

### Structure du composant

```typescript
@Component({
  selector: 'app-healthcheck',
  standalone: true,
  templateUrl: './healthcheck.component.html',
  styleUrl: './healthcheck.component.scss'
})
export class HealthcheckComponent
```

### Dépendances et imports

#### Modules Angular Material
- `MatButtonToggleModule` - Boutons de bascule
- `MatCardModule` - Cartes d'affichage
- `MatIconModule` - Icônes Material Design
- `MatExpansionModule` - Panneaux d'expansion
- `MatTooltip` - Info-bulles

#### Services injectés
- `HealthService` - Service de récupération des statistiques de santé
- `CommonService` - Service utilitaire commun
- `HardwareService` - Service de monitoring matériel

#### Composants personnalisés
- `AreaComponent` - Graphiques en aires
- `PieComponent` - Graphiques en secteurs
- `SolidgaugeComponent` - Jauges circulaires
- `TimeSelectorComponent` - Sélecteur de période

## Fonctionnalités principales

### 1. Surveillance du moteur de flux

Le composant surveille les métriques suivantes du moteur de flux :

- **Uptime** : Temps de fonctionnement continu
- **Last Reload** : Dernière rechargement des règles
- **Packet Loss Rate** : Taux de perte de paquets
- **Processing Throughput** : Débit de traitement
- **Invalid Checksums** : Sommes de contrôle invalides
- **Memory Usage** : Utilisation mémoire
- **Memory Pressure** : Pression mémoire

### 2. Monitoring système

#### Métriques CPU
```typescript
cpuAvgUsage = computed(() => {
  const cpuData = this.cpuUsage();
  if (!cpuData.length || !cpuData[0]?.cpu_usage) return 0;
  const usageValues = Object.values(cpuData[0].cpu_usage) as number[];
  return Math.round(usageValues.reduce((sum: number, val: number) => sum + val, 0) / usageValues.length);
});
```

- **CPU Average** : Utilisation moyenne de tous les cœurs
- **CPU Max** : Utilisation maximale parmi tous les cœurs
- **CPU Count** : Nombre total de cœurs CPU

#### Métriques mémoire
- **RAM Usage Percent** : Pourcentage d'utilisation de la RAM
- **RAM Total** : Mémoire totale en GB
- **RAM Used** : Mémoire utilisée en GB
- **RAM Free** : Mémoire libre calculée

#### Métriques disque
- **Disk Usage Percent** : Pourcentage d'utilisation du disque
- **Disk Total** : Espace disque total en GB
- **Disk Used** : Espace disque utilisé en GB
- **Disk Free** : Espace disque libre calculé

### 3. Surveillance des règles de sécurité

Le composant affiche des métriques détaillées sur :

- **Loaded Rules** : Règles chargées avec succès
- **Failed Rules** : Règles ayant échoué au chargement
- **Skipped Rules** : Règles intentionnellement ignorées
- **Detected Alerts** : Alertes de sécurité détectées
- **Suppressed Alerts** : Alertes supprimées

### 4. Erreurs par protocole

Surveillance des erreurs pour différents protocoles :
- **TLS Errors** : Erreurs de sécurité de transport
- **HTTP Errors** : Erreurs de protocole web
- **RDP Errors** : Erreurs de bureau à distance
- **SSH Errors** : Erreurs de connexion sécurisée

### 5. Métriques TCP

- **TCP SYN** : Paquets d'initialisation de connexion
- **TCP SYN-ACK** : Paquets d'acquittement
- **TCP RST** : Paquets de réinitialisation
- **TCP Overlap** : Paquets avec segments chevauchants

## Visualisations de données

### Graphiques en aires
```typescript
readonly alertsAreaGraphOptions = computed<AreaChartInterface[]>(() => ([
  {
    title: 'System Stability in the Last 24 Hours',
    yAxisLabel: 'Uptime',
    data: this.uptimeArea(),
    lineColor: this._commonService.areaChartColor,
    height: 302,
    backgroundColor: '#1F1F1F'
  }
]));
```

### Graphiques en secteurs
Trois graphiques circulaires pour :
1. **Utilisation mémoire par protocole** (FTP, HTTP, TCP)
2. **Règles par moteur** (Chargées, Échouées, Ignorées)
3. **Erreurs par protocole** (TLS, HTTP, RDP, SSH)

### Jauges de performance
```typescript
readonly alertsBySeverityGaugesOptions = computed<GaugeChartInterface[]>(() => {
  const cpuUsage = this.cpuUsage()[0]?.cpu_usage ?? 0;
  const ramUsage = this.ramUsage()[0]?.ram_usage?.percent ?? 0;
  const diskUsage = this.diskUsage()[0]?.disk_usage?.percent ?? 0;
  
  // Génération des jauges pour chaque CPU + RAM + Disque
});
```

## Système de seuils et alertes

### Codes couleur
- **Vert (#008000)** : Performances normales (< 40%)
- **Jaune (#FFC107)** : Avertissement (40-80%)
- **Rouge (#F44336)** : Critique (> 80%)

### Application des seuils
```typescript
[ngClass]="{
  'safe': value < 40,
  'warning': value >= 40 && value < 80,
  'danger': value >= 80
}"
```

## Structure de l'interface utilisateur

### En-tête
- Titre avec sélecteur de période
- Statut du moteur de flux avec uptime et dernière rechargement

### Section principale
1. **Cartes de métriques** : Affichage des KPI principaux
2. **Graphiques de tendance** : Évolution sur 24h
3. **Détails CPU** : Panneaux d'expansion pour chaque groupe de 12 CPUs
4. **Surveillance des règles** : Grille de métriques de sécurité

### Groupement des CPUs
```typescript
getCpuGroups(): number[] {
  const totalCpus = this.cpuCount();
  const groups: number[] = [];
  for (let i = 0; i < totalCpus; i += 12) {
    groups.push(i);
  }
  return groups;
}
```

## Gestion des données

### Signaux reactifs
Le composant utilise les signaux Angular pour une réactivité optimale :
```typescript
stats: any = toSignal(this._healthService.getStats());
ramUsage = toSignal(this._hardwareService.getRamUsage(), { initialValue: [] });
```

### Computed properties
Les valeurs calculées sont mises à jour automatiquement :
```typescript
readonly uptime = computed(() => this.stats()?.stats.uptime ?? 'N/A');
```

## Pipes personnalisés

- `BytesConvertPipe` : Conversion d'octets en unités lisibles
- `UptimeToDatePipe` : Conversion d'uptime en format date

## Responsiveness et accessibilité

### Tooltips informatifs
Chaque métrique dispose d'une info-bulle explicative :
```html
<mat-icon
  matTooltip="Percentage of network packets that failed to reach destination"
  matTooltipPosition="above" 
  matTooltipDelay="500">
  help_outline
</mat-icon>
```

### Design adaptatif
- Grilles CSS flexibles
- Cartes responsive
- Couleurs contrastées pour l'accessibilité

## Configuration et personnalisation

### Thème sombre
Le composant utilise un thème sombre avec :
- Arrière-plan principal : `#1F1F1F`
- Texte : `#C5C4BE`
- Couleurs d'accentuation selon les seuils

### Paramètres configurables
- Période de données (24h par défaut)
- Seuils d'alerte personnalisables
- Couleurs de graphiques via `CommonService`

## Optimisations performances

### Lazy loading
- Composants chargés à la demande
- Données mises en cache via les signaux

### Computed values
- Calculs optimisés avec `computed()`
- Mises à jour granulaires


## Conclusion

Ce composant fournit une solution complète de monitoring système avec une interface utilisateur moderne et intuitive. Il combine surveillance en temps réel, visualisations avancées, et système d'alertes pour assurer un suivi optimal des performances et de la sécurité.