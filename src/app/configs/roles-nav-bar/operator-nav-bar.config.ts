import { MenuInterface } from "@core/interfaces/menu.interface";
import { appUrl } from "../app-url.config";

export const operatorNavItems: MenuInterface[] = [
    {
      label: 'Main Dashboard', icon: 'dashboard', link: appUrl.operator.overview
    },
    {
      label: 'Network Monitoring', icon: 'device_hub',
      children: [
        { label: 'Activity Maps', icon: 'notifications', link: appUrl.operator.topology.activity},
        { label: 'Discovery', icon: 'notifications', link: appUrl.operator.topology.asset},
        { label: 'Deviances', icon: 'notifications', link: appUrl.operator.ai.deviances},
      ]
    },
    {
      label: 'Detection', icon: 'security',
      children: [
        { label: 'Overview', icon: 'notifications', link: appUrl.operator.detection.overview},
        { label: 'By Protocol', icon: 'notifications', link: appUrl.operator.detection.protocol.basePath},
        { label: 'By Source', icon: 'notifications', link: appUrl.operator.detection.source},
        { label: 'By Category', icon: 'notifications', link: appUrl.operator.detection.category},
        { label: 'By Application', icon: 'notifications', link: appUrl.operator.detection.application},
        { label: 'By AI', icon: 'notifications', link: appUrl.operator.ai.detection},
        { label: 'By Rules', icon: 'notifications', link: appUrl.operator.detection.rule},
        { label: 'Anomalies', icon: 'anomalies', link: appUrl.operator.detection.anomalies.basePath},
        { label: 'Alerts List', icon: 'anomalies', link: appUrl.operator.detection.alertsList},
      ]
    },
    {
      label: 'Hunting', icon: 'search', link: appUrl.operator.forensics
    },
    {
      label: 'OT', icon: 'settings',
      children: [
        { label: 'Topology', icon: 'notifications', link: appUrl.operator.ot.topology },
        { label: 'Assets', icon: 'notifications', link: appUrl.operator.ot.assets},
        { label: 'Conversation', icon: 'notifications', link: appUrl.operator.ot.conversation},
        { label: 'Alerts', icon: 'notifications', link: appUrl.operator.ot.alerts},
      ]
    },
    {
      label: 'UC', icon: 'list',
      children: [
        { label: 'Usecases', icon: 'notifications', link: appUrl.operator.uc.usecases },
        { label: 'Alerts', icon: 'notifications', link: appUrl.operator.uc.alerts },
      ]
    }
];
