import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { TrafficMapComponent } from '../traffic-map/traffic-map.component';
import { PieChartInterface, MapChartInterface } from '@core/interfaces';
import { Signal } from '@angular/core';
import { PieComponent } from '@shared/components/graphs/pie/pie.component';
import { BarComponent } from '@shared/components/graphs/bar/bar.component';
import { BarChartInterface } from '@core/interfaces/charts/bar-chart.interface';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-tls-template',
    imports: [
        CommonModule,
        MatCardModule,
        MatTabsModule,
        PieComponent,
        TrafficMapComponent,
        BarComponent,
        MatIconModule,
        MatTooltipModule
    ],
    template: `
    <section class="tls-template-section">
      <div class="column-33">
        <mat-card class="radm-card">
          <mat-card-content>
            <div class="chart-container">
              <h3 class="graph-title card-title">Request By Source
                <mat-icon
                  matTooltip="Distribution of network requests grouped by originating IP addresses, showing top sources"
                  [matTooltipPosition]="'above'"
                >help_outline</mat-icon>
              </h3>
              <app-pie [graphOptions]="requestsBySource()"/>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      <div class="column-33">
            <app-traffic-map
              [mapOptions]="mapOptions"
              [helpMessage]="'Geographic visualization of network traffic origins and destinations across global regions'"
              [mapType]="mapType"
              (mapTypeChange)="mapTypeChange.emit($event)"
            ></app-traffic-map>
      </div>
      <div class="column-33">
        <mat-card class="radm-card">
          <mat-card-content>
            <div class="chart-container">
              <h3 class="graph-title card-title">Requests By Port
                <mat-icon
                  matTooltip="Breakdown of network traffic by destination port numbers, highlighting most active services."
                  [matTooltipPosition]="'above'"
                >help_outline</mat-icon>
              </h3>
              <app-pie [graphOptions]="requestsByPort()"/>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </section>

    <section class="tls-template-section">
        <div class="column-49">
        <mat-card class="radm-card">
            <mat-card-content>
                <h3 class="graph-title card-title">TLS Versions Information
                  <mat-icon
                  matTooltip="Distribution of TLS protocol versions observed in encrypted network communications"
                  [matTooltipPosition]="'above'"
                >help_outline</mat-icon>
                </h3>
                <app-bar [graphOptions]="requestsByVersion()"/>
            </mat-card-content>
        </mat-card>
        </div>
        <div class="column-50">
        <mat-card class="radm-card">
            <mat-card-content>
                <h3 class="graph-title card-title">TLS Cipher Suite Information
                  <mat-icon
                  matTooltip="Statistics on encryption cipher suites used in TLS connections across your network"
                  [matTooltipPosition]="'above'"
                >help_outline</mat-icon>
                </h3>
                <app-bar [graphOptions]="requestsByCipherInfo()"/>
            </mat-card-content>
        </mat-card>
        </div>
    </section>
  `,
    styles: [`
    .tls-template-section {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      margin-bottom: 1rem;
    }
    .chart-container {
      height: 350px;
      display: flex;
      flex-direction: column;
    }
    .graph-title {
      font-size: 22px;
      color: white;
      padding: 10px 0 0 1%;
    }

    .card-title{
      color: white;
      font-size: 22px;
      font-family: BebasNeue, serif;
    }
  `]
})
export class TlsTemplateComponent {
  @Input({ required: true }) requestsBySource!: Signal<PieChartInterface>;
  @Input({ required: true }) requestsByPort!: Signal<PieChartInterface>;
  @Input({ required: true }) requestsByVersion!: Signal<BarChartInterface>;
  @Input({ required: true }) requestsByCipherInfo!: Signal<BarChartInterface>;
  @Input({ required: true }) mapOptions!: Signal<MapChartInterface>;
  @Input({ required: true }) mapType!: Signal<string>;
  @Output() mapTypeChange = new EventEmitter<string | number>();
}
