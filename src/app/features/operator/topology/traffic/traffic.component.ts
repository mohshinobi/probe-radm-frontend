import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { AreaChartInterface, AreaSplineChartInterface, PieChartInterface, PortMappings } from '@core/interfaces';
import { BarChartInterface } from '@core/interfaces/charts/bar-chart.interface';
import { CommonService } from '@core/services';
import { AreaComponent } from "@shared/components/graphs/area/area.component";
import { AreasplineComponent } from '@shared/components/graphs/areaspline/areaspline.component';
import { PieComponent } from '@shared/components/graphs/pie/pie.component';
import { of } from 'rxjs';
import { BarComponent } from "@shared/components/graphs/bar/bar.component";
import {TimeSelectorComponent} from "@shared/components/time-selector/time-selector.component";

@Component({
    selector: 'app-traffic',
    imports: [
        MatCardModule,
        AreaComponent,
        PieComponent,
        MatTabsModule,
        AreasplineComponent,
        BarComponent,
        TimeSelectorComponent,
    ],
    templateUrl: './traffic.component.html',
    styleUrl: './traffic.component.scss'
})
export class TrafficComponent {
  private _commonService = inject(CommonService);
  currentTime = signal(24);
  title = 'Network / Traffic & Assets'

  //Option du bloc time filter
  timeFilterOptions = [
    { value: 1, label: 'Last hour' },
    { value: 12, label: 'Last 12H' },
    { value: 24, label: 'Last 24H' },
    { value: 'Custom', label: 'Custom' }
  ];

  portMappings: PortMappings = {
    80: 'http',
    8080: 'http',
    443: 'https',
    25: 'smtp',
    587: 'smtp',
    143: 'imap',
    993: 'imap',
    110: 'pop3',
    21: 'ftp',
    22: 'ssh',
    53: 'dns',
  };

  alertLast1 = toSignal(
    of([
      [Date.parse('2024-08-02T17:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:01:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:02:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:03:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:04:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:05:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:06:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:07:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:08:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:09:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:10:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:11:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:12:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:13:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:14:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:15:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:16:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:17:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:18:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:19:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:20:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:21:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:22:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:23:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:24:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:25:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:26:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:27:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:28:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:29:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:30:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:31:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:32:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:33:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:34:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:35:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:36:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:37:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:38:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:39:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:40:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:41:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:42:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:43:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:44:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:45:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:46:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:47:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:48:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:49:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:50:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:51:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:52:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:53:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:54:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:55:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:56:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:57:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:58:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:59:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T18:00:00.000Z'), Math.floor(Math.random() * 100)],
    ])
  );
  alertLast12 = toSignal(
    of([
      [Date.parse('2024-08-02T06:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T07:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T08:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T09:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T10:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T11:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T12:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T13:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T14:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T15:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T16:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T18:00:00.000Z'), Math.floor(Math.random() * 100)],
    ])
  );
  alertLast24 = toSignal(
    of([
      [Date.parse('2024-08-01T18:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-01T19:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-01T20:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-01T21:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-01T22:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-01T23:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T00:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T01:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T02:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T03:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T04:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T05:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T06:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T07:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T08:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T09:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T10:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T11:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T12:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T13:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T14:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T15:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T16:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T18:00:00.000Z'), Math.floor(Math.random() * 100)],
    ])
  );

  out1 = toSignal(
    of([
      [Date.parse('2024-08-02T17:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:01:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:02:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:03:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:04:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:05:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:06:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:07:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:08:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:09:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:10:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:11:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:12:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:13:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:14:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:15:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:16:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:17:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:18:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:19:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:20:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:21:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:22:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:23:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:24:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:25:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:26:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:27:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:28:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:29:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:30:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:31:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:32:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:33:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:34:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:35:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:36:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:37:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:38:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:39:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:40:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:41:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:42:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:43:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:44:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:45:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:46:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:47:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:48:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:49:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:50:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:51:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:52:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:53:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:54:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:55:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:56:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:57:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:58:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T17:59:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T18:00:00.000Z'), Math.floor(Math.random() * 100)],
    ])
  );
  out12 = toSignal(
    of([
      [Date.parse('2024-08-02T06:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T07:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T08:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T09:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T10:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T11:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T12:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T13:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T14:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T15:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T16:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T18:00:00.000Z'), Math.floor(Math.random() * 100)],
    ])
  );
  out24 = toSignal(
    of([
      [Date.parse('2024-08-01T18:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-01T19:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-01T20:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-01T21:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-01T22:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-01T23:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T00:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T01:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T02:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T03:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T04:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T05:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T06:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T07:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T08:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T09:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T10:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T11:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T12:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T13:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T14:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T15:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T16:00:00.000Z'), Math.floor(Math.random() * 100)],
      [Date.parse('2024-08-02T18:00:00.000Z'), Math.floor(Math.random() * 100)],
    ])
  );

  readonly incommingAreaGraphOptions = computed<AreaChartInterface[]>(() => [
    {
      title: `Incoming Traffic From the Last ${this.currentTime()}`,
      yAxisLabel: 'Traffic',
      data: this.alertLast1(),
      lineColor: this._commonService.sourceColor,
      backgroundColor: '#1F1F1F',
      color: '#27293d',
    },
    {
      title: `Incoming Traffic From the Last ${this.currentTime()}`,
      yAxisLabel: 'Alerts',
      data: this.alertLast12(),
      lineColor: this._commonService.sourceColor,
      backgroundColor: '#1F1F1F',
      color: '#27293d',
    },
    {
      title: `Incoming Traffic From the Last ${this.currentTime()}`,
      yAxisLabel: 'Alerts',
      data: this.alertLast24(),
      lineColor: this._commonService.sourceColor,
      backgroundColor: '#1F1F1F',
      color: '#27293d',
    },
  ]);

  // Pie Charts
  alertsByProtocol = toSignal(
    of([
      { name: 'HTTP', y: Math.floor(Math.random() * 100) },
      { name: 'FTP', y: Math.floor(Math.random() * 100) },
      { name: 'SSH', y: Math.floor(Math.random() * 100) },
      { name: 'SMTP', y: Math.floor(Math.random() * 100) },
      { name: 'DNS', y: Math.floor(Math.random() * 100) },
    ])
  );
  outByProtocol = toSignal(
    of([
      { name: 'HTTP', y: Math.floor(Math.random() * 100) },
      { name: 'FTP', y: Math.floor(Math.random() * 100) },
      { name: 'SSH', y: Math.floor(Math.random() * 100) },
      { name: 'SMTP', y: Math.floor(Math.random() * 100) },
      { name: 'DNS', y: Math.floor(Math.random() * 100) },
    ])
  );

  bandWidthByService = toSignal(
    of([
      { name: 'File Sharing', y: Math.floor(Math.random() * 100) },
      { name: 'Print Services', y: Math.floor(Math.random() * 100) },
      { name: 'Email Services', y: Math.floor(Math.random() * 100) },
      { name: 'Database Services', y: Math.floor(Math.random() * 100) },
      { name: 'Authentication Services', y: Math.floor(Math.random() * 100) },
      { name: 'DNS Services', y: Math.floor(Math.random() * 100) },
      { name: 'DHCP Services', y: Math.floor(Math.random() * 100) },
      { name: 'VPN Services', y: Math.floor(Math.random() * 100) },
      { name: 'Proxy Services', y: Math.floor(Math.random() * 100) },
      { name: 'Storage Services', y: Math.floor(Math.random() * 100) },
    ])
  );

  bandWidthByType = toSignal(
    of([
      { name: 'Skype', y: Math.floor(Math.random() * 100) },
      { name: 'Dropbox', y: Math.floor(Math.random() * 100) },
      { name: 'Zoom', y: Math.floor(Math.random() * 100) },
      { name: 'Slack', y: Math.floor(Math.random() * 100) },
      { name: 'Google Drive', y: Math.floor(Math.random() * 100) },
    ])
  );

  readonly incommingPieGraphOptions = computed<PieChartInterface>(() => ({
    title: 'Incoming Traffic By Protocols',
    label: 'Requests',
    data: this.alertsByProtocol(),
    innerSize: '85%',
    backgroundColor: '#1F1F1F',
    colors: this._commonService.chartsColors,
  }));

  readonly outgoingAreaGraphOptions = computed<AreaChartInterface[]>(() => [
    {
      title: `Outgoing Traffic From the Last ${this.currentTime()}`,
      yAxisLabel: 'Traffic',
      data: this.out1(),
      lineColor: this._commonService.destinationColor,
      backgroundColor: '#1F1F1F',
      color: '#27293d',
    },
    {
      title: `Outgoing Traffic From the Last ${this.currentTime()}`,
      yAxisLabel: 'Alerts',
      data: this.out12(),
      lineColor: this._commonService.destinationColor,
      backgroundColor: '#1F1F1F',
      color: '#27293d',
    },
    {
      title: `Outgoing Traffic From the Last ${this.currentTime()}`,
      yAxisLabel: 'Alerts',
      data: this.out24(),
      lineColor: this._commonService.destinationColor,
      backgroundColor: '#1F1F1F',
      color: '#27293d',
    },
  ]);

  readonly outgoingPieGraphOptions = computed<PieChartInterface>(() => ({
    title: 'Outgoing Traffic By Protocols',
    label: 'Requests',
    data: this.outByProtocol(),
    innerSize: '85%',
    backgroundColor: '#1F1F1F',
    colors: this._commonService.chartsColors,
  }));

  readonly barChartOptions = computed<BarChartInterface>(() => {
    return {
      title: 'Bandwidth Use By Service',
      color: '#8569FE',
      height: '300px',
      borderRadius: '20%',
      backgroundColor: '#1F1F1F',
      labelColor: '#C5C4BE',
      yLabelColor: '#C5C4BE',
      xLabelColor: '#C5C4BE',
      gridLineColor: '#C5C4BE',
      gridLineDashStyle: 'Dot',
      legendLabelColor: '#C5C4BE',
      tickColor: '#C5C4BE',
      lineColor: '#C5C4BE',
      data: this.bandWidthByService(),
    };
  });

  readonly bandWidthPieGraphOptions = computed<PieChartInterface>(() => ({
    title: 'Bandwidth by Type',
    label: 'Requests',
    data: this.bandWidthByType(),
    backgroundColor: '#1F1F1F',
    innerSize: '85%',
    colors: this._commonService.chartsColors,
  }));

  alertsAreaData = toSignal(
    of([
      {
        name: 'Incomming Traffic',
        type: 'area',
        data: [
          [
            Date.parse('2024-02-08T00:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T01:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T02:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T03:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T04:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T05:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T06:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T07:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T08:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T09:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T10:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T11:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T12:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T13:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T14:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T15:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T16:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T17:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T18:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T19:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T20:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T21:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T22:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T23:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
        ],
      },
      {
        name: 'Outgoing Traffic',
        type: 'area',
        data: [
          [
            Date.parse('2024-02-08T00:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T01:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T02:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T03:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T04:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T05:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T06:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T07:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T08:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T09:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T10:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T11:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T12:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T13:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T14:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T15:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T16:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T17:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T18:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T19:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T20:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T21:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T22:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T23:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
        ],
      },
    ])
  );
  packetLossAreaData = toSignal(
    of([
      {
        name: 'Incomming Traffic',
        type: 'area',
        data: [
          [
            Date.parse('2024-02-08T00:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T01:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T02:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T03:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T04:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T05:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T06:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T07:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T08:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T09:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T10:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T11:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T12:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T13:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T14:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T15:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T16:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T17:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T18:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T19:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T20:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T21:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T22:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T23:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
        ],
      },
      {
        name: 'Outgoing Traffic',
        type: 'area',
        data: [
          [
            Date.parse('2024-02-08T00:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T01:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T02:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T03:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T04:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T05:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T06:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T07:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T08:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T09:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T10:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T11:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T12:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T13:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T14:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T15:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T16:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T17:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T18:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T19:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T20:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T21:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T22:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T23:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
        ],
      },
    ])
  );
  responseTimeAreaData = toSignal(
    of([
      {
        name: 'Incomming Traffic',
        type: 'area',
        data: [
          [
            Date.parse('2024-02-08T00:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T01:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T02:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T03:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T04:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T05:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T06:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T07:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T08:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T09:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T10:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T11:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T12:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T13:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T14:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T15:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T16:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T17:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T18:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T19:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T20:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T21:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T22:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T23:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
        ],
      },
      {
        name: 'Outgoing Traffic',
        type: 'area',
        data: [
          [
            Date.parse('2024-02-08T00:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T01:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T02:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T03:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T04:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T05:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T06:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T07:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T08:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T09:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T10:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T11:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T12:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T13:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T14:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T15:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T16:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T17:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T18:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T19:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T20:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T21:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T22:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
          [
            Date.parse('2024-02-08T23:00:00.000Z'),
            Math.floor(Math.random() * 100),
          ],
        ],
      },
    ])
  );

  readonly alertsAreaSpline = computed<AreaSplineChartInterface>(() => ({
    title: '',
    label: 'Latency',
    data: this.alertsAreaData(),
    backgroundColor: '#1F1F1F',
    colors: [
      this._commonService.sourceColor,
      this._commonService.destinationColor,
    ],
  }));

  readonly packetLossAreaSpline = computed<AreaSplineChartInterface>(() => ({
    title: '',
    label: 'Packet',
    data: this.packetLossAreaData(),
    backgroundColor: '#1F1F1F',
    colors: [
      this._commonService.sourceColor,
      this._commonService.destinationColor,
    ],
  }));

  readonly responseTimeAreaSpline = computed<AreaSplineChartInterface>(() => ({
    title: '',
    label: 'Time Response',
    data: this.responseTimeAreaData(),
    backgroundColor: '#1F1F1F',
    colors: [
      this._commonService.sourceColor,
      this._commonService.destinationColor,
    ],
  }));

  onTimeChange(value: number | string) {
    if (typeof value === "number") {
      this.currentTime.set(value);
    }
  }
}
