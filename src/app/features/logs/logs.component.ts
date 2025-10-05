import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LogsService, LogType } from './logs.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LogViewerComponent } from '@shared/components/log-viewer/log-viewer.component';
import { ToastrService } from "ngx-toastr";
import { catchError, forkJoin, Observable, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatCell, MatCellDef, MatColumnDef, MatRow, MatRowDef, MatTable } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TokenService } from '@core/services/token.service';
import { PageHeaderComponent } from "@layout/header/page-header.component";

@Component({
    selector: 'app-logs',
    imports: [
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatRow,
    MatRowDef,
    MatTable,
    CommonModule,
    MatTooltipModule,
    PageHeaderComponent
],
    templateUrl: './logs.component.html',
    styleUrl: './logs.component.scss'
})
export class LogsComponent {
  private _logService = inject(LogsService);
  private _toastr = inject(ToastrService);
  logs: any[] = [];

  private readonly _tokenService = inject(TokenService);

  private readonly LOG_TYPES: LogType[] = [
    'system',
    'suricata',
    'users'
  ];

  loading = true;
  systemLogs = toSignal(this._logService.getLogs('system'), { initialValue: [] });
  flowLogs = toSignal(this._logService.getLogs('suricata'), { initialValue: [] });
  usersLogs   = toSignal(this._logService.getLogs('users'), {initialValue: []});

  formatLog(log: string): string {
    return log.replace(/_log/gi, '').toUpperCase();
  }

  constructor(private dialog: MatDialog) {
    const roles = this._tokenService.getUser()?.roles || [];
    if (roles.includes("ROLE_OPERATOR")) {
      this.loadAllLogs();
    }
  }

  private getDisplayLabel(type: LogType): string {
    const labelMap: Record<LogType, string> = {
      system: 'System',
      suricata: 'Flows',
      users: 'Users',
    };
    return labelMap[type];
  }
  private transformFileNames(fileNames: string[], type: LogType): string[] {
    // Remplacer "suricata_logs" par "flows_logs" uniquement si le type est "suricata"
    if (type === 'suricata') {
      return fileNames.map((fileName) =>
        fileName.replace(/suricata_log/g, 'flows_logs')
      );
    }
    return fileNames;
  }

  loadAllLogs(): void {
    this.loading = true;

    // Créer un objet avec tous les appels HTTP
    const logRequests = this.LOG_TYPES.reduce((acc, type) => {
      acc[type] = this._logService.getLogs(type).pipe(
        catchError((error) => {
          console.error(`Erreur lors du chargement des logs ${type}:`, error);
          return of(null);
        })
      );
      return acc;
    }, {} as Record<LogType, Observable<string[] | null>>);

    // Utiliser forkJoin pour attendre que tous les appels soient terminés
    forkJoin(logRequests).subscribe({
      next: (results) => {
        this.logs = [];
        // Parcourir les résultats dans l'ordre défini par LOG_TYPES
        this.LOG_TYPES.forEach((type) => {
          const fileNames = results[type];
          if (fileNames && fileNames.length) {
            const transformedFileNames = this.transformFileNames(
              fileNames,
              type
            );
            const items = this.formatLogItems(transformedFileNames, type);
            // remplacer "suricata" par "flows"
            const displayLabel = this.getDisplayLabel(type);
            this.logs.push({
              label: displayLabel,
              items: items,
            });
          }
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des logs:', err);
        this.loading = false;
      },
    });
  }

  private formatLogItems(fileNames: string[], type: LogType) {
    return fileNames.map((fileName) => ({
      label: fileName,
      path: fileName,
      type: type,
      content: '',
    }));
  }

  getFileContent(type: LogType, fileName: string): void {

    const originalFileName = this.revertFileName(fileName, type);
    const fileNameWithoutExtension = this.removeFileExtension(originalFileName);

    this._logService.getFileContent(type, fileNameWithoutExtension).subscribe({
      next: (content: string) => {
        if (content === 'Error: Log not found') {
          // Affiche un toast si le fichier n'est pas disponible
          this._toastr.success('Log no disponible.', 'Fermer');
        } else {
          // Ouvrir le dialogue avec le contenu formaté
          const formattedContent = `${fileNameWithoutExtension} \n ${content}`;

          this.openDialog(formattedContent);
        }
      },
      error: (err) => {
        this._toastr.error('Impossible to load file.', 'Erreur');
        console.error(
          `Error loading file "${fileNameWithoutExtension}" :`,
          err
        );
      },
    });
  }

  downloadFile(type: LogType, fileName: string): void {
    const originalFileName = this.revertFileName(fileName, type);
    const fileNameWithoutExtension = this.removeFileExtension(originalFileName);

    this._logService.download(type, fileNameWithoutExtension).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this._toastr.error('Impossible to download file', 'Error');
        console.error('Error downloading file :', err);
      },
    });
  }

  private openDialog(content: string): void {
    this.dialog.open(LogViewerComponent, {
      data: content,
    });
  }

  private removeFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) return fileName;
    return fileName.substring(0, lastDotIndex);
  }

  private revertFileName(fileName: string, type: LogType): string {
    // Revert "flows_logs" to "suricata_logs" if the type is "suricata"
    if (type === 'suricata') {
      return fileName.replace(/flows_logs/g, 'suricata_log');
    }
    return fileName;
  }

}