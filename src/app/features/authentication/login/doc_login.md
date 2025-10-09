# Documentation Technique - Composant Login

## Vue d'ensemble

Le composant `LoginComponent` est la page d'authentification de l'application Jizô-ai. Il fournit une interface de connexion sécurisée avec validation des formulaires, vérification de l'état des services, et gestion de l'authentification LDAP optionnelle.

## Architecture

### Structure du composant

```typescript
@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent
```

### Dépendances et imports

#### Modules Angular
- `FormsModule` - Formulaires template-driven
- `ReactiveFormsModule` - Formulaires réactifs
- `JsonPipe` - Pipe pour déboguer les objets JSON

#### Modules Angular Material
- `MatFormFieldModule` - Champs de formulaire Material
- `MatInputModule` - Champs de saisie
- `MatCardModule` - Cartes d'affichage
- `MatButtonModule` - Boutons Material
- `MatIconModule` - Icônes Material Design
- `MatTooltipModule` - Info-bulles

#### Services injectés
- `AuthService` - Service d'authentification principal
- `Router` - Navigation Angular
- `ConfigService` - Configuration système
- `TrafficService` - Informations de version
- `ToastrService` - Notifications toast

## Fonctionnalités principales

### 1. Gestion des formulaires

#### Formulaire réactif
```typescript
loginForm: any = new FormGroup<{
  username: FormControl,
  password: FormControl
}>({
  username: new FormControl('', Validators.required),
  password: new FormControl('', Validators.required),
});
```

**Caractéristiques :**
- Validation côté client avec `Validators.required`
- Liaison bidirectionnelle avec `[(ngModel)]`
- Contrôles TypeScript typés

#### Propriétés de saisie
```typescript
username: string = '';
password: string = '';
```

### 2. Surveillance de l'état système

#### État de l'authentification
```typescript
authState = this._authService.getAuthState();
```

#### Vérification de l'API
```typescript
ping = toSignal(this._authService.getPingBack());
```

**Affichage conditionnel :**
```html
@if (ping()?.code) {
  <p class="apiUp"><mat-icon>circle</mat-icon>API</p>
} @else {
  <p class="apiDown"><mat-icon>circle</mat-icon>API</p>
}
```

### 3. Intégration LDAP

#### Configuration LDAP
```typescript
readonly ldapConfig = toSignal(this._configurationService.getConfigurationLdap());
readonly pingLDAP = toSignal(this._configurationService.pingLdapServer());
```

#### Surveillance LDAP
- Vérification automatique de la disponibilité
- Affichage conditionnel selon l'activation
- Information utilisateur sur les comptes exemptés

```html
@if (ldapConfig()?.enabled) {
  @if(pingLDAP()?.ldapAvailable) {
    <p class="apiUp"><mat-icon>circle</mat-icon> LDAP is UP *</p>
    <p class="infos">* LDAP is enabled for all users except the account admin</p>
  }
}
```

### 4. Informations de version

```typescript
readonly version = toSignal(this._trafficService.getVersion());
```

Affichage de la version complète dans l'interface :
```html
<span class="version">V {{version().full_version}}</span>
```

## Processus d'authentification

### Méthode de connexion

```typescript
login(): void {
  // Récupération des valeurs du formulaire
  this.username = this.loginForm.value.username;
  this.password = this.loginForm.value.password;

  // Validation côté client
  if(!this.username || !this.password) {
    this.toastr.error('Username and password are required');
    return;
  }

  // Création de l'objet de connexion
  let login: LoginInterface = {
    username: this.username,
    password: this.password,
    token: ''
  }

  // Appel du service d'authentification
  this._authService.login(login);
}
```

### Interface de données

```typescript
interface LoginInterface {
  username: string;
  password: string;
  token: string;
}
```

## Structure de l'interface utilisateur

### Layout à deux colonnes

#### Colonne gauche - Informations système
```html
<div class="column-left">
  <div class="container-api">
    <!-- Logo et version -->
    <h1>Welcome to</h1>
    <div class="logo">
      <img src="assets/images/logo-radm-white.png" alt="logo" />
      <span class="version">V {{version().full_version}}</span>
    </div>
    
    <!-- États des services -->
    <div class="pings">
      <!-- Statut API Jizô -->
      <!-- Statut LDAP -->
    </div>
  </div>
</div>
```

#### Colonne droite - Formulaire de connexion
```html
<div class="column-right">
  <div class="container-form">
    <h5>Login</h5>
    <form (ngSubmit)="login()" [formGroup]="loginForm">
      <div class="inputs">
        <mat-form-field>
          <input type="text" matInput placeholder="Username" 
                 [(ngModel)]="username" formControlName="username" required>
        </mat-form-field>
        <mat-form-field>
          <input type="password" matInput placeholder="Password" 
                 [(ngModel)]="password" formControlName="password" required>
        </mat-form-field>
      </div>
      <button type="submit" mat-button>Login</button>
    </form>
  </div>
</div>
```

## Gestion des états et notifications

### Signaux réactifs

Le composant utilise des signaux Angular pour une réactivité optimale :

```typescript
// États système
authState = this._authService.getAuthState();
ping = toSignal(this._authService.getPingBack());

// Configuration LDAP
readonly ldapConfig = toSignal(this._configurationService.getConfigurationLdap());
readonly pingLDAP = toSignal(this._configurationService.pingLdapServer());

// Version système
readonly version = toSignal(this._trafficService.getVersion());
```

### Notifications utilisateur

```typescript
toastr = inject(ToastrService);

// Exemple d'utilisation
if(!this.username || !this.password) {
  this.toastr.error('Username and password are required');
  return;
}
```


## Validation et sécurité

### Validation côté client
- Champs obligatoires avec `Validators.required`
- Vérification de présence avant soumission
- Messages d'erreur utilisateur

### Sécurité
- Champ mot de passe de type `password`
- Pas de stockage local des identifiants
- Utilisation de services sécurisés pour l'authentification

## Responsive design

### Indicateurs visuels
- Icônes colorées pour les états (UP/DOWN)
- Classes CSS conditionnelles
- Layout adaptatif en colonnes

### Accessibilité
- Labels appropriés pour les champs
- Attributs `required` sur les inputs
- Contrastes visuels pour les états

## Intégration avec les services

### AuthService
- `getAuthState()` - État d'authentification
- `getPingBack()` - Vérification API
- `login(LoginInterface)` - Processus de connexion

### ConfigService
- `getConfigurationLdap()` - Configuration LDAP
- `pingLdapServer()` - Test de connectivité LDAP

### TrafficService
- `getVersion()` - Informations de version

## Gestion des erreurs

### Validation formulaire
```typescript
if(!this.username || !this.password) {
  this.toastr.error('Username and password are required');
  return;
}
```
## Conclusion

Le composant `LoginComponent` fournit une interface d'authentification robuste et moderne, intégrant la surveillance système, la validation de formulaires, et la gestion LDAP. Son architecture basée sur les signaux Angular garantit une réactivité optimale et une maintenance simplifiée.