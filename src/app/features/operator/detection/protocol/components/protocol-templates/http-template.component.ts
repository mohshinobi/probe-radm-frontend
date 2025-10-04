import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TrafficMapComponent } from '../traffic-map/traffic-map.component';
import { MapChartInterface } from '@core/interfaces';
import { Signal } from '@angular/core';
import { BarComponent } from '@shared/components/graphs/bar/bar.component';
import { BarChartInterface } from '@core/interfaces/charts/bar-chart.interface';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-http-template',
    imports: [
        CommonModule,
        MatCardModule,
        BarComponent,
        TrafficMapComponent,
        MatIconModule,
        MatTooltipModule
    ],
    template: `
    <section class="http-template-section">
      <div class="column-33">
        <mat-card class="radm-card">
          <mat-card-content>
            <div class="chart-container">
              <h3 class="card-title graph-title">HTTP Answer by Status Code
                <mat-icon
                  matTooltip="istribution of HTTP responses categorized by status codes."
                  [matTooltipPosition]="'above'"
                >help_outline</mat-icon>
              </h3>
              <app-bar [graphOptions]="requestsByStatus()"/>
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
              <h3 class="card-title graph-title">HTTP Requests By Port
                <mat-icon
                matTooltip="Breakdown of HTTP traffic by destination ports, showing which ports receive most HTTP requests."
                [matTooltipPosition]="'above'"
                >help_outline</mat-icon>
                </h3>
              <app-bar [graphOptions]="requestsByPort()"/>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </section>
  `,
    styles: [`
    .http-template-section {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      margin-bottom: 1rem;
    }

    .chart-container {
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
      font-family: Sesame, serif;
    }
  `]
})
export class HttpTemplateComponent {
  @Input({ required: true }) requestsByStatus!: Signal<BarChartInterface>;
  @Input({ required: true }) requestsByPort!: Signal<BarChartInterface>;
  @Input({ required: true }) mapOptions!: Signal<MapChartInterface>;
  @Input({ required: true }) mapType!: Signal<string>;
  @Output() mapTypeChange = new EventEmitter<string | number>();
}
