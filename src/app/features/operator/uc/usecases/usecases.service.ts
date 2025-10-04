// random-data-generator.service.ts
import {inject, signal} from '@angular/core';
import {TableCellTypeEnum} from '@core/enums';
import {TableColumnInterface} from '@core/interfaces/table-column.interface';
import {Observable} from "rxjs";
import {proxyPath} from "@configs/api-url.config";
import {HttpClient} from "@angular/common/http";

interface UsecaseStep {
  name: string;
  description?: string;
  scenario?: string;
  weight?: number;
}

interface NewUsecase {
  usecase: {
    timestamp: string;
    name: string;
    tags: string[];
    timespan: number;
    progress: number;
    severity: number;
    description: string;
    ttps: string[];
    steps: UsecaseStep[];
  };
  rules?: Record<string, { Yara?: string[]; suricata?: string[] }>;
}


const _manageApi = proxyPath.management;

export const usecasesNew: NewUsecase[] = [
  {
    usecase: {
      timestamp: "2025-02-01 10:10:12",
      name: "HOSHI_CobaltStrike_Beacon",
      tags: ["Cobalt Strike", "Beacon", "C2"],
      timespan: 2,
      progress: 0,
      severity: 1,
      description: "Detects Cobalt Strike beaconing",
      ttps: ["TA0002", "T1059", "T1071", "T1105"],
      steps: [
        {
          name: "Command and Control",
          scenario:
            "print(' Begin Usecase ');\nif (NbAlertSuri(2025649) >=1 or NbAlertYara('domain') >=1) {\nprint(' Valid (2025649 OR domain) ');EnableStep('Step 1')\n } else {\nprint(' Invalid (2025649 OR domain) ');\n}\nprint(' End Usecase ');",
          weight: 10,
          description: "Detects periodic beaconing patterns",
        },
        {
          name: 'Exfiltration',
          scenario:
            "print(' Begin Usecase ');\nif (NbAlertSuri(2025649) >=1 or NbAlertYara('domain') >=1) {\nprint(' Valid (2025649 OR domain) ');EnableStep('Step 1')\n } else {\nprint(' Invalid (2025649 OR domain) ');\n}\nprint(' End Usecase ');",
          weight: 10,
          description: "Detects bulk data transfer",
        },
        {
          name: 'Exfiltration',
          scenario:
            "print(' Begin Usecase ');\nif (NbAlertSuri(2025649) >=1 or NbAlertYara('domain') >=1) {\nprint(' Valid (2025649 OR domain) ');EnableStep('Step 1')\n } else {\nprint(' Invalid (2025649 OR domain) ');\n}\nprint(' End Usecase ');",
          weight: 10,
          description: "Detects bulk data transfer",
        },
        {
          name: 'Exfiltration',
          scenario:
            "print(' Begin Usecase ');\nif (NbAlertSuri(2025649) >=1 or NbAlertYara('domain') >=1) {\nprint(' Valid (2025649 OR domain) ');EnableStep('Step 1')\n } else {\nprint(' Invalid (2025649 OR domain) ');\n}\nprint(' End Usecase ');",
          weight: 10,
          description: "Detects bulk data transfer",
        },
        {
          name: 'Exfiltration',
          scenario:
            "print(' Begin Usecase ');\nif (NbAlertSuri(2025649) >=1 or NbAlertYara('domain') >=1) {\nprint(' Valid (2025649 OR domain) ');EnableStep('Step 1')\n } else {\nprint(' Invalid (2025649 OR domain) ');\n}\nprint(' End Usecase ');",
          weight: 10,
          description: "Detects bulk data transfer",
        },
      ],
    },
    rules: { 'Command and Control': { Yara: ['domain'], suricata: ['2025649','2025649', '2025649','2025649','2025649', '2025649','2025649','2025649', '2025649','2025649','2025649', '2025649'] }, 'Exfiltration': { Yara: ['hash'], suricata: ['2022546'] } },
  },
];

export class UsecasesService {
  private _http = inject(HttpClient)

  length = signal(0);

  displayedColumns = [
    'usecase.timestamp',
    'usecase.name',
    'usecase.tags',
    'nb_steps',
  ];

  ordersTableColumns: TableColumnInterface[] = [
    {name: 'Seen', dataKey: 'usecase.timestamp', type: TableCellTypeEnum.DATE},
    {name: 'Name', dataKey: 'usecase.name', type: TableCellTypeEnum.TEXT},
    {name: 'Tags', dataKey: 'usecase.tags', type: TableCellTypeEnum.ARRAY},
    {name: 'Nb Steps', dataKey: 'nb_steps', type: TableCellTypeEnum.TEXT},
    {
      name: 'Actions',
      dataKey: 'actions',
      type: TableCellTypeEnum.ACTIONS,
      isSortable: false,
      actions: [
        {
          name: 'details',
          label: 'View details',
          icon: 'remove_red_eye',
          params: ['steps', 'name', 'description', 'TTPs', 'severity', 'tags', 'timespan', 'progress'],
        },
        {
          name: 'delete',
          label: 'Delete',
          icon: 'delete',
        }
      ],
    }
  ];

  public generateRandomObjects(): any[] {
    return usecasesNew.map(i => ({...i, nb_steps: i.usecase.steps ? i.usecase.steps?.length : 0}))
  }

  upload(formData: FormData): Observable<any> {
    return this._http.post(_manageApi+`/uc/upload`, formData);
  }

}
