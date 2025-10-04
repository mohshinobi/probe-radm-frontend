import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PieChartInterface, AreaChartInterface, MapChartInterface, AreaSplineChartInterface } from '@core/interfaces';
import { Signal } from '@angular/core';
import { PieComponent } from '@shared/components/graphs/pie/pie.component';
import { TrafficMapComponent } from '../traffic-map/traffic-map.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-rdp-template',
    imports: [
        MatCardModule,
        PieComponent,
        TrafficMapComponent,
        MatIconModule,
        MatTooltipModule
    ],
    template: `
    <section>
        <div class="column-49">
            <mat-card class="radm-card">
                <mat-card-content>
                    <div class="chart-container">
                        <h3 class="graph-title card-title">Request By Source
                          <mat-icon
                              matTooltip="Network requests categorized by country of origin, showing geographic source distribution"
                              [matTooltipPosition]="'above'"
                            >help_outline</mat-icon>
                        </h3>
                        <app-pie [graphOptions]="requestsByGeoIp()"/>
                    </div>
                </mat-card-content>
            </mat-card>
        </div>
        <div class="column-50">
            <app-traffic-map
                [mapOptions]="mapOptions"
                [helpMessage]="'Geographic visualization of network traffic origins and destinations across global regions'"
                [mapType]="mapType"
                (mapTypeChange)="mapTypeChange.emit($event)"
            />
        </div>
    </section>
    <!-- <section>
      <div class="column-49">
        <mat-card class="radm-card">
          <mat-card-content>
            <app-areaspline
              [graphOptions]="requestsByStatus()"
            />
          </mat-card-content>
        </mat-card>
      </div>
      <div class="column-50">
        <mat-card class="radm-card">
          <mat-card-content>
            <app-area
              [graphOptions]="requestsBySourceIp()"
            />
          </mat-card-content>
        </mat-card>
      </div>
    </section> -->
  `,
    styles: [`
    section {
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
      font-family: BebasNeue, serif;
    }
  `]
})
export class RdpTemplateComponent {
  @Input({ required: true }) requestsByGeoIp!: Signal<PieChartInterface>;
  @Input({ required: true }) requestsByStatus!: Signal<AreaSplineChartInterface>;
  @Input({ required: true }) requestsBySourceIp!: Signal<AreaChartInterface>;
  @Input({ required: true }) mapOptions!: Signal<MapChartInterface>;
  @Input({ required: true }) mapType!: Signal<string>;
  @Output() mapTypeChange = new EventEmitter<string | number>();
}
