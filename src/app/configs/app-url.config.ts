export const appUrl = {
    auth: {
        login: 'auth/login',
        config: 'auth/config'
    },
    administrator:{
        basePath: "/administrator",
        overview: "/administrator/overview",
        parameters: {
          healthcheck: "/administrator/parameters/healthcheck",
          logs: "/administrator/parameters/logs"
        },
        users: "/administrator/users",
        config: "/administrator/config"

    },
    operator : {
        basePath: "/operator",
        overview: "/operator/overview",
        config: "/operator/config",
        forensics: "/operator/forensics",
        dashboards: {
            basePath: "/operator/dashboards",
            operational: {
                basePath: "/operator/dashboards/operational",
                overview: "/operator/dashboards/operational/overview",
                protocols: {
                    basePath: "/operator/dashboards/operational/protocols",
                    dns:"/operator/dashboards/operational/protocols/dns",
                    ssh: "/operator/dashboards/operational/protocols/ssh",
                    http: "/operator/dashboards/operational/protocols/http",
                    tls: "/operator/dashboards/operational/protocols/tls",
                    anomaly: "/operator/dashboards/operational/protocols/anomaly",
                    fileInfo: "/operator/dashboards/operational/protocols/file-info"
                }
            },
            alerts:{
                basePath: "/operator/dashboards/alerts",
                overview: "/operator/dashboards/alerts/overview",
                category: "/operator/dashboards/alerts/category",
                protocol: "/operator/dashboards/alerts/protocol",
                source: "/operator/dashboards/alerts/source",
                smb: "/operator/dashboards/alerts/smb"
            },
            healthStatus: "/operator/dashboards/health-status"
        },
        topology: {
          basePath:"/operator/topology",
          activity: "/operator/topology/activity",
          asset: "/operator/topology/asset",
          traffic: "/operator/topology/traffic",
          details: "/operator/topology/asset/details",
        },
        detection: {
          basePath:"/operator/detection",
          overview: "/operator/detection/overview",
          protocol: {
            basePath: "/operator/detection/protocol",
            overview:"/operator/detection/protocol/overview",
            dns:"/operator/detection/protocol/dns",
            ssh: "/operator/detection/protocol/ssh",
            http: "/operator/detection/protocol/http",
            tls: "/operator/detection/protocol/tls",
            fileInfo: "/operator/detection/protocol/file-info",
            rdp: "/operator/detection/protocol/rdp",
            smb: "/operator/detection/protocol/smb",
            krb5: "/operator/detection/protocol/krb5",
          },
          source: "/operator/detection/source",
          category: "/operator/detection/category",
          application: "/operator/detection/application",
          ai: "/operator/detection/ai",
          rule: "/operator/detection/rule",
          anomalies: {
            basePath: "/operator/detection/anomalies"
          },
          alertsList: "/operator/detection/alerts-list"
        },
        alerts: {
            basePath:"/operator/alerts",
            flows: "/operator/alerts/flows",
            files: "/operator/alerts/files",
            detail:"/operator/alerts/detail"
        },
        ai: {
            basePath:"/operator/ai",
            dashboard: "/operator/ai/dashboard",
            detection: "/operator/ai/detection",
            deviances: "/operator/ai/deviances"
        },
        ot: {
          basePath:"/operator/ot",
          topology: "/operator/ot/topology",
          assets: "/operator/ot/assets",
          conversation: "/operator/ot/conversation",
          alerts: "/operator/ot/alerts"
        },
        uc: {
          basePath: "/operator/uc",
          usecases: "/operator/uc/usecases",
          alerts: "/operator/uc/alerts"
        },
        parameters: {
          healthcheck: "/operator/parameters/healthcheck",
          metrics: "/operator/parameters/metrics",
          logs: "/operator/parameters/logs",
          configuration: "/operator/parameters/configuration",
          rules: "/operator/parameters/rules",
          usecase: "/operator/parameters/usecase",
          ot: "/operator/parameters/ot",
          traffic : "/operator/parameters/traffic",
          traffic_licence : "/operator/parameters/traffic_licence",
        }
    },
    auditor: {
        basePath: "/auditor",
        overview: "/auditor/overview",
    }
}
