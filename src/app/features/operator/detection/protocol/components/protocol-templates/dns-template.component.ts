import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { PieChartInterface, MapChartInterface } from '@core/interfaces';
import { Signal } from '@angular/core';
import { TrafficMapComponent } from '../traffic-map/traffic-map.component';
import { PieComponent } from '@shared/components/graphs/pie/pie.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-dns-template',
    imports: [
        CommonModule,
        MatCardModule,
        PieComponent,
        TrafficMapComponent,
        MatIconModule,
        MatTooltipModule
    ],
    template: `
    <section>
      <div class="column-33">
        <mat-card class="radm-card">
          <mat-card-content>
            <div>
              <h3 class="graph-title card-title">DNS Requests By Type
                <mat-icon
                  matTooltip="Donut chart illustrating the distribution of DNS request types. It differentiates between queries (yellow, representing requests) and answers (green, representing responses)."
                  [matTooltipPosition]="'above'"
                >help_outline</mat-icon></h3>
            </div>
            <div>
              <app-pie [graphOptions]="requestsByType()"/>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="column-33">
        <app-traffic-map
          [mapOptions]="mapOptions"
          [helpMessage]="'World map visualization showing the geographic distribution of DNS traffic'"
          [mapType]="mapType"
          (mapTypeChange)="mapTypeChange.emit($event)"
        ></app-traffic-map>
      </div>

      <div class="column-33">
        <mat-card class="radm-card">
          <mat-card-content>
            <div>
              <h3 class="graph-title card-title">DNS Requests By Port <mat-icon
                  matTooltip="Donut chart displaying DNS requests categorized by port number."
                  [matTooltipPosition]="'above'"
                >help_outline</mat-icon></h3>
            </div>
            <div>
              <app-pie [graphOptions]="requestsByPort()"/>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </section>
  `,
    styles: [`
    section {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        margin-top: 1rem;
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

    :host ::ng-deep .radm-card {
      background-color: #1F1F1F;
      border-radius: 16px;
    }
  `]
})
export class DnsTemplateComponent {
  @Input({ required: true }) requestsByType!: Signal<PieChartInterface>;
  @Input({ required: true }) requestsByPort!: Signal<PieChartInterface>;
  @Input({ required: true }) mapOptions!: Signal<MapChartInterface>;
  @Input({ required: true }) mapType!: Signal<string>;
  @Output() mapTypeChange = new EventEmitter<string | number>();

  protected readonly mapSrcDestType = [
    { value: 'src', label: 'Source' },
    { value: 'dest', label: 'Destination' }
  ];
}
