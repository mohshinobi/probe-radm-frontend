import {TableColumnInterface} from "@core/interfaces";
import {TableCellTypeEnum} from "@core/enums";

export interface Step {
  step_name: string;
  key: string;
  tool_name: string;
  alert_count: number;
  oldest_timestamp: string;
  sid?: string;
  usecase_name?: string;
}

export interface AlertUc {
  timestamp: string;
  starting_date: string;
  ends_at: string;
  usecase_alert_ID: string;
  usecase_name: string;
  timespan: number;
  steps_alerts: Record<string, Step[]>;
  steps: string[];
  progress: number;
  is_ignored: number;
}

export const alertsUc: any[] = [
  {
    "@timestamp": "2025-04-18T07:33:10.285000Z",
    "starting_date": "2025-04-18T07:33:09.636000+00:00",
    "ends_at": "2025-04-18T09:33:09.636000+00:00",
    "usecase_alert_ID": "UC_Test_25_1",
    "usecase_name": "UC_1",
    "timespan": 2,
    "steps_alerts": {
      "Step 1": {
        "alert.signature_id(2009582)": {
          "tool_name": "suricata",
          "sid": "2009582",
          "alert_count": 872,
          "oldest_timestamp": "2025-04-18T07:33:09.636Z"
        },
        "alert.signature_id(2009512)": {
          "tool_name": "usecase",
          "usecase_name": "UC_Test_25",
          "alert_count": 872,
          "oldest_timestamp": "2025-04-18T07:33:09.636Z"
        }
      },
      "Step 2": {
        "alert.signature_id(2009582)": {
          "tool_name": "suricata",
          "sid": "2009582",
          "alert_count": 872,
          "oldest_timestamp": "2025-04-18T07:33:09.636Z"
        },
        "alert.signature_id(2009512)": {
          "tool_name": "usecase",
          "usecase_name": "UC_Test_25",
          "alert_count": 872,
          "oldest_timestamp": "2025-04-18T07:33:09.636Z"
        }
      }
    },
    "progress": 100.0,
    "is_ignored": 0
  },
  {
    "@timestamp": "2025-04-18T07:33:10.285000Z",
    "starting_date": "2025-04-18T07:33:09.636000+00:00",
    "ends_at": "2025-04-18T09:33:09.636000+00:00",
    "usecase_alert_ID": "UC_Test_25_2",
    "usecase_name": "UC_2",
    "timespan": 2,
    "steps_alerts": {
      "Step 1": {
        "alert.signature_id(2009582)": {
          "tool_name": "suricata",
          "sid": "2009582",
          "alert_count": 872,
          "oldest_timestamp": "2025-04-18T07:33:09.636Z"
        },
        "alert.signature_id(2009512)": {
          "tool_name": "usecase",
          "usecase_name": "UC_Test_25",
          "alert_count": 872,
          "oldest_timestamp": "2025-04-18T07:33:09.636Z"
        }
      },
      "Step 2": {
        "alert.signature_id(2009582)": {
          "tool_name": "suricata",
          "sid": "2009582",
          "alert_count": 872,
          "oldest_timestamp": "2025-04-18T07:33:09.636Z"
        },
        "alert.signature_id(2009512)": {
          "tool_name": "usecase",
          "usecase_name": "UC_Test_25",
          "alert_count": 872,
          "oldest_timestamp": "2025-04-18T07:33:09.636Z"
        }
      }
    },
    "progress": 30.0,
    "is_ignored": 0
  },
  {
    "@timestamp": "2025-04-18T07:33:10.285000Z",
    "starting_date": "2025-04-18T07:33:09.636000+00:00",
    "ends_at": "2025-04-18T09:33:09.636000+00:00",
    "usecase_alert_ID": "UC_Test_25_3",
    "usecase_name": "UC_Test_25",
    "timespan": 2,
    "steps_alerts": {
      "Step 1": {
        "alert.signature_id(2009582)": {
          "tool_name": "suricata",
          "id": 2009582,
          "alert_count": 872,
          "oldest_timestamp": "2025-04-18T07:33:09.636Z"
        }
      }
    },
    "is_ignored": 0,
    "progress": 70.0
  }
]

export class AlertsUcService {

  displayedColumns = [
    'starting_date',
    'ends_at',
    'usecase_name',
    'progress',
    'steps',
  ];

  ordersTableColumns: TableColumnInterface[] = [
    {name: 'First Seen', dataKey: 'starting_date', type: TableCellTypeEnum.DATE},
    {name: 'Last seen', dataKey: 'ends_at', type: TableCellTypeEnum.DATE},
    {name: 'Name', dataKey: 'usecase_name', type: TableCellTypeEnum.TEXT},
    {name: 'Progress', dataKey: 'progress', type: TableCellTypeEnum.PROGRESS},
    {name: 'Steps', dataKey: 'steps', type: TableCellTypeEnum.ARRAY},
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

  getAlert(ucId?: string): AlertUc | undefined {
    const all = this.getAllAlerts();
    if (!ucId) return all[0];
    return all.find(a => a.usecase_alert_ID === ucId);
  }

  getAllAlerts(): AlertUc[] {
    return alertsUc.map(raw => this.normalize(raw));
  }

  private normalize(raw: any): AlertUc {
    const steps_alerts = this.normalizeSteps(raw['steps_alerts']);
    const steps = Object.keys(steps_alerts);

    return {
      timestamp: raw['@timestamp'] || '',
      starting_date: raw['starting_date'] || '',
      ends_at: raw['ends_at'] || '',
      usecase_alert_ID: raw['usecase_alert_ID'] || '',
      usecase_name: raw['usecase_name'] || '',
      timespan: raw['timespan'] || 0,
      steps_alerts,
      steps,
      progress: raw['progress'] || 0,
      is_ignored: raw['is_ignored'] || 0,
    };
  }

  private normalizeSteps(rawSteps: any): Record<string, Step[]> {
    if (!rawSteps) return {};

    const out: Record<string, Step[]> = {};

    for (const [step_name, alertsObj] of Object.entries(rawSteps)) {
      out[step_name] = Object.entries(alertsObj as any).map(([key, a]: [string, any]) => ({
        step_name,
        key,
        tool_name: a?.tool_name || '',
        alert_count: a?.alert_count || 0,
        oldest_timestamp: a?.oldest_timestamp || '',
        sid: a?.sid || a?.id,
        usecase_name: a?.usecase_name,
      }));
    }
    return out;
  }
}
