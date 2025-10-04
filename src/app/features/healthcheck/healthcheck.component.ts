import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AreaChartInterface, GaugeChartInterface, PieChartInterface } from '@core/interfaces';
import { BytesConvertPipe } from '@shared/pipes/bytes-convert.pipe';
import { UptimeToDatePipePipe } from '@shared/pipes/uptime-to-date-pipe.pipe';
import { HealthService } from '@core/services/health.service';
import { CommonService } from '@core/services';
import { Point, Series } from 'highcharts';
import {TimeSelectorComponent} from "@shared/components/time-selector/time-selector.component";
import { HardwareService } from '@core/services/hardware.service';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatTooltip} from "@angular/material/tooltip";

@Component({
    selector: 'app-healthcheck',
    imports: [
        MatButtonToggleModule,
        MatCardModule,
        MatIconModule,
        CommonModule,
        BytesConvertPipe,
        UptimeToDatePipePipe,
        TimeSelectorComponent,
        MatExpansionModule,
        MatTooltip
    ],
    providers: [
        DatePipe,
        BytesConvertPipe,
        UptimeToDatePipePipe
    ],
    templateUrl: './healthcheck.component.html',
    styleUrl: './healthcheck.component.scss'
})
export class HealthcheckComponent {

  private _healthService = inject(HealthService);
  private _commonService = inject(CommonService);
  private _hardwareService = inject(HardwareService);

  stats: any = toSignal(this._healthService.getStats());
  readonly uptime = computed(() => this.stats()?.stats.uptime ?? 'N/A');
  readonly lastReload = computed(() => this.stats()?.stats?.detect?.engines?.[0]?.last_reload ?? 'N/A');
  readonly kernelDrops = computed(() => this.stats()?.stats?.capture?.kernel_drops ?? 'N/A');
  readonly decoderPkts = computed(() => this.stats()?.stats?.decoder.pkts?? 'N/A');
  readonly tcpInvalidChecksum = computed(() => this.stats()?.stats?.tcp?.invalid_checksum ?? 'N/A');
  readonly tcpMemuse = computed(() => this.stats()?.stats?.tcp?.memuse?? 'N/A');
  readonly memcapPressure = computed(() => this.stats()?.stats?.memcap_pressure ?? 'N/A');
  readonly detectEnginesRulesLoaded = computed(() => this.stats()?.stats?.detect?.engines?.[0]?.rules_loaded ?? 'N/A');
  readonly detectEnginesRulesFailed = computed(() => this.stats()?.stats?.detect?.engines?.[0]?.rules_failed ?? 'N/A');
  readonly detectEnginesRulesSkipped = computed(() => this.stats()?.stats?.detect?.engines?.[0]?.rules_skipped ?? 'N/A');
  readonly detectAlert = computed(() => this.stats()?.stats?.detect?.alert ?? 'N/A');
  readonly detectAlertsSuppressed = computed(() => this.stats()?.stats?.detect?.alerts_suppressed ?? 'N/A');
  readonly tlsErrors = computed(() => this.stats()?.stats?.app_layer?.error?.tls?.parser ?? 'N/A');
  readonly httpErrors = computed(() => this.stats()?.stats?.app_layer?.error?.http?.parser ?? 'N/A');
  readonly rdpErrors = computed(() => this.stats()?.stats?.app_layer?.error?.rdp?.parser ?? 'N/A');
  readonly sshErrors = computed(() => this.stats()?.stats?.app_layer?.error?.ssh?.parser ?? 'N/A');
  readonly tcpSyn = computed(() => this.stats()?.stats?.tcp?.syn ?? 'N/A');
  readonly tcpSynack = computed(() => this.stats()?.stats?.tcp?.synack ?? 'N/A');
  readonly tcpRst = computed(() => this.stats()?.stats?.tcp?.rst ?? 'N/A');
  readonly tcpOverlap = computed(() => this.stats()?.stats?.tcp?.overlap ?? 'N/A');
  title = 'Healthcheck';


  // Area Charts
  uptimeArea = toSignal(this._healthService.getLineData(24, 'stats.uptime'));
  kernelDropsArea = toSignal(this._healthService.getLineData(24, 'stats.capture.kernel_drops'));

  ramUsage = toSignal(this._hardwareService.getRamUsage(), { initialValue: [] });
  diskUsage = toSignal(this._hardwareService.getDiskUsage(), { initialValue: [] });
  cpuUsage = toSignal(this._hardwareService.getCpuUsage(), { initialValue: [] });


  readonly alertsAreaGraphOptions = computed<AreaChartInterface[]>(() => (
    [
      {
        title: 'System Stability in the Last 24 Hours',
        yAxisLabel: 'Uptime',
        data: this.uptimeArea(),
        lineColor: this._commonService.areaChartColor,
        height: 302,
        backgroundColor: '#1F1F1F',
        labelColor: '#C5C4BE',
        yLabelColor: '#C5C4BE',
        xLabelColor: '#C5C4BE',
        gridLineColor: '#C5C4BE',
        gridLineDashStyle: 'Dot',
        legendLabelColor: '#C5C4BE'
      },
      {
        title: 'Packet Loss Rate in the last 24 Hours',
        yAxisLabel: 'Packets',
        data: this.kernelDropsArea(),
        lineColor: this._commonService.areaChartColor,
        height: 302,
        backgroundColor: '#1F1F1F',
        labelColor: '#C5C4BE',
        yLabelColor: '#C5C4BE',
        xLabelColor: '#C5C4BE',
        gridLineColor: '#C5C4BE',
        gridLineDashStyle: 'Dot',
        legendLabelColor: '#C5C4BE'
      }
    ]
  ));

  // Pie Charts
  readonly alertsPieGraphOptions = computed<PieChartInterface[]>(() => {

    let totalProtocols = this.stats().stats.ftp.memuse + this.stats().stats.http.memuse + this.stats().stats.tcp.memuse;
    let totalEngines = this.stats().stats.detect.engines[0].rules_loaded + this.stats().stats.detect.engines[0].rules_failed + this.stats().stats.detect.engines[0].rules_skipped;
    let errors = this.stats().stats.app_layer.error.tls.parser + this.stats().stats.app_layer.error.http.parser + this.stats().stats.app_layer.error.rdp.parser + this.stats().stats.app_layer.error.ssh.parser;
    return [
      {
        title: 'Memory Usage by protocol',
        label: '',
        data: [
          { name: 'Memory used for FTP', y: this.stats().stats.ftp.memuse },
          { name: 'Memory used for HTTP', y: this.stats().stats.http.memuse },
          { name: 'Memory used for TCP', y: this.stats().stats.tcp.memuse }
        ],
        colors: this._commonService.chartsColors,
        height: '297px',
        backgroundColor: '#1F1F1F',
        innerSize: '85%',
        subtitle: {
          useHTML: true,
          text: totalProtocols.toString(),
          floating: true,
          verticalAlign: 'middle',
          x: -120,
          y: 20,
          style: {
            color: 'white',
            fontSize: '28px'
          }
        },
        legendOption: {
          enabled: true,
          align: 'right',
          verticalAlign: 'middle',
          layout: 'vertical',
          itemStyle: {
            color: 'white'
          },
          itemMarginBottom: 20,
          padding: 10,
          labelFormatter: function (this: Point | Series): string {
            if ('y' in this && 'name' in this) {
              return `${this.name}: ${this.y}`;
            }
            return '';
          }
        },
        dataLabelsOption: { enabled: false }
      },
      {
        title: 'Rules by engine',
        label: '',
        data: [
          { name: 'Rules Loaded', y: this.stats().stats.detect.engines[0].rules_loaded },
          { name: 'Rules Failed', y: this.stats().stats.detect.engines[0].rules_failed },
          { name: 'Rules Skipped', y: this.stats().stats.detect.engines[0].rules_skipped }
        ],
        colors: this._commonService.chartsColors,
        backgroundColor: '#1F1F1F',
        innerSize: '85%',
        subtitle: {
          useHTML: true,
          text: totalEngines.toString(),
          floating: true,
          verticalAlign: 'middle',
          x: -90,
          y: 20,
          style: {
            color: 'white',
            fontSize: '28px'
          }
        },
        legendOption: {
          enabled: true,
          align: 'right',
          verticalAlign: 'middle',
          layout: 'vertical',
          itemStyle: {
            color: 'white'
          },
          itemMarginBottom: 20,
          padding: 10,
          labelFormatter: function (this: Point | Series): string {
            if ('y' in this && 'name' in this) {
              return `${this.name}: ${this.y}`;
            }
            return '';
          }
        },
        dataLabelsOption: { enabled: false }
      },

      {
        title: 'Errors by protocol',
        label: '',
        data: [
          { name: 'TLS Errors', y: this.stats().stats.app_layer.error.tls.parser },
          { name: 'HTTP Errors', y: this.stats().stats.app_layer.error.http.parser },
          { name: 'RDP Errors', y: this.stats().stats.app_layer.error.rdp.parser },
          { name: 'SSH Errors', y: this.stats().stats.app_layer.error.ssh.parser }
        ],
        colors: this._commonService.chartsColors,
        backgroundColor: '#1F1F1F',
        innerSize: '85%',
        subtitle: {
          useHTML: true,
          text: errors.toString(),
          floating: true,
          verticalAlign: 'middle',
          x: -75,
          y: 20,
          style: {
            color: 'white',
            fontSize: '28px'
          }
        },
        legendOption: {
          enabled: true,
          align: 'right',
          verticalAlign: 'middle',
          layout: 'vertical',
          itemStyle: {
            color: 'white'
          },
          itemMarginBottom: 20,
          padding: 10,
          labelFormatter: function (this: Point | Series): string {
            if ('y' in this && 'name' in this) {
              return `${this.name}: ${this.y}`;
            }
            return '';
          }
        },
        dataLabelsOption: { enabled: false }
      }
    ];
  });

  //Mertics

  cpuAvgUsage = computed(() => {
    const cpuData = this.cpuUsage();
    if (!cpuData.length || !cpuData[0]?.cpu_usage) return 0;
    const usageValues = Object.values(cpuData[0].cpu_usage) as number[];
    return Math.round(usageValues.reduce((sum: number, val: number) => sum + val, 0) / usageValues.length);
  });

  cpuMaxUsage = computed(() => {
    const cpuData = this.cpuUsage();
    if (!cpuData.length || !cpuData[0]?.cpu_usage) return 0;
    const usageValues = Object.values(cpuData[0].cpu_usage) as number[];
    return Math.round(Math.max(...usageValues));
  });

  cpuCount = computed(() => {
    const cpuData = this.cpuUsage();
    if (!cpuData.length || !cpuData[0]?.cpu_usage) return 0;
    return Object.keys(cpuData[0].cpu_usage).length;
  });

  ramUsagePercent = computed(() => {
    const ramData = this.ramUsage();
    if (!ramData.length) return 0;

    return Math.round(ramData[0]?.ram_usage?.percent || 0);
  });
  ramTotal = computed(() => {
    const ramData = this.ramUsage();
    if (!ramData.length) return 0;

    return parseFloat((ramData[0]?.ram_usage?.total / 1024 / 1024 / 1024).toFixed(1)) || 0;
  });

  ramUsed = computed(() => {
    const ramData = this.ramUsage();
    if (!ramData.length) return 0;

    // Conversion en GB et arrondi à un décimal
    return parseFloat((ramData[0]?.ram_usage?.used / 1024 / 1024 / 1024).toFixed(1)) || 0;
  });

  ramFree = computed(() => {
    return parseFloat((this.ramTotal() - this.ramUsed()).toFixed(1));
  });

  cpuUsageData = computed(() => {
    const cpuData = this.cpuUsage();
    if (!cpuData.length || !cpuData[0]?.cpu_usage) return [];

    return Object.entries(cpuData[0].cpu_usage).map(([key, value]) => ({
      id: key,
      usage: Math.round(value as number)
    }));
  });

  // Configuration pour la jauge de mémoire
  readonly memoryGaugeOptions = computed<GaugeChartInterface>(() => {
    const ramUsage = this.ramUsagePercent();

    return {
      title: 'Mémoire',
      label: '%',
      data: ramUsage,
      total: 100,
      color: ramUsage <= 40 ? '#4CAF50' : ramUsage <= 80 ? '#FFC107' : '#F44336',
      showTitle: false,
      left: 0,
      backgroundColor: '#1F1F1F',
      innerSize: '80%',
    };
  });

   readonly alertsBySeverityGaugesOptions = computed<GaugeChartInterface[]>(
    () => {
      const cpuUsage = this.cpuUsage()[0]?.cpu_usage ?? 0;
      const ramUsage = this.ramUsage()[0]?.ram_usage?.percent ?? 0;
      const diskUsage = this.diskUsage()[0]?.disk_usage?.percent ?? 0;

      //IF VALUE >= 40% color red else green
      const cpuGauges = Object.keys(cpuUsage).map((key, index) => {
        return {
          title: `CPU ${index + 1} available`,
          label: '%',
          data: Math.round(100 - (cpuUsage[key] as number)),
          total: 100,
          color: Math.round(100 - (cpuUsage[key] as number)) <= 40 ? '#F44949' : '#008000',
          left: -30,
          showTitle: false,
        };
      });

      const additionalGauges = [
        {
          title: 'MEMORY available',
          label: '%',
          data: Math.round(100 - ramUsage),
          total: 100,
          color: Math.round(100 - ramUsage) <= 40 ? '#F44949' : '#008000',
          showTitle: false,
          left: -30,
        },
        {
          title: 'Disk available',
          label: '%',
          data: Math.round(100 - diskUsage),
          total: 100,
          color: Math.round(100 - diskUsage) <= 40 ? '#F44949' : '#008000',
          showTitle: false,
          left: -30,
        },
      ];

      return [...cpuGauges, ...additionalGauges];
    }
   );
  panelIndex = 0;
  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  getCpuGroups(): number[] {
  const totalCpus = this.cpuCount();
  const groups: number[] = [];
  for (let i = 0; i < totalCpus; i += 12) {
    groups.push(i);
  }
  return groups;
  }

  cpuGroups(): number[] {
  const totalCpus = this.cpuCount();
  return Array.from({ length: Math.ceil(totalCpus / 12) }, (_, i) => i * 12);
}


  diskUsagePercent = computed(() => {
  const diskData = this.diskUsage();
  if (!diskData.length) return 0;

  return Math.round(diskData[0]?.disk_usage?.percent || 0);
});

diskTotal = computed(() => {
  const diskData = this.diskUsage();
  if (!diskData.length) return 0;

  return parseFloat((diskData[0]?.disk_usage?.total / 1024 / 1024 / 1024).toFixed(1)) || 0;
});

diskUsed = computed(() => {
  const diskData = this.diskUsage();
  if (!diskData.length) return 0;

  return parseFloat((diskData[0]?.disk_usage?.used / 1024 / 1024 / 1024).toFixed(1)) || 0;
});

diskFree = computed(() => {
  return parseFloat((this.diskTotal() - this.diskUsed()).toFixed(1));
});

// Add disk gauge configuration
readonly diskGaugeOptions = computed<GaugeChartInterface>(() => {
  const diskUsage = this.diskUsagePercent();

  return {
    title: 'Disque',
    label: '%',
    data: diskUsage,
    total: 100,
    color: diskUsage <= 40 ? '#4CAF50' : diskUsage <= 80 ? '#FFC107' : '#F44336',
    showTitle: false,
    left: 0,
    backgroundColor: '#1F1F1F',
    innerSize: '80%',
  };
});

}
