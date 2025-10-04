import { Component, EventEmitter, Input, Output, Signal } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatTabsModule } from "@angular/material/tabs";
import { PieComponent } from "@shared/components/graphs/pie/pie.component";
import { TrafficMapComponent } from "../traffic-map/traffic-map.component";
import { MapChartInterface, PieChartInterface } from "@core/interfaces";

@Component({
    selector: 'app-ssh-template',
    imports: [
        MatCardModule,
        MatTabsModule,
        PieComponent,
        TrafficMapComponent
    ],
    template: `
    <section>
      <div class="column-60">
        <mat-tab-group style="background-color: #1F1F1F; border-radius: 16px">
          <mat-tab label="SSH Request - Client">
            <div style="display: flex;">
              <mat-card class="column-50" style="background-color: #1F1F1F">
                <mat-card-content>
                  <app-pie [graphOptions]="clientVersions()"></app-pie>
                </mat-card-content>
              </mat-card>
              <mat-card class="column-50" style="background-color: #1F1F1F">
                <mat-card-content>
                  <app-pie [graphOptions]="clientSoftware()"></app-pie>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
          <mat-tab label="SSH Request - Server">
            <div style="display: flex;">
              <mat-card class="column-50" style="background-color: #1F1F1F">
                <mat-card-content>
                  <app-pie [graphOptions]="serverVersions()"></app-pie>
                </mat-card-content>
              </mat-card>
              <mat-card class="column-50" style="background-color: #1F1F1F">
                <mat-card-content>
                  <app-pie [graphOptions]="serverSoftware()"></app-pie>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
      <div class="column-39">
        <app-traffic-map 
          [mapOptions]="mapOptions"
          [helpMessage]="'World map visualization showing the geographic distribution of SSH traffic'"
          [mapType]="mapType"
          (mapTypeChange)="mapTypeChange.emit($event)"
        ></app-traffic-map>
      </div>
    </section>
  `,
    styles: [
        `
    section {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        margin-top: 1rem;
    }
    `
    ]
})
export class SshTemplateComponent {
  @Input() clientVersions!: Signal<PieChartInterface>;
  @Input() clientSoftware!: Signal<PieChartInterface>;
  @Input() serverVersions!: Signal<PieChartInterface>;
  @Input() serverSoftware!: Signal<PieChartInterface>;
  @Input() mapOptions!: Signal<MapChartInterface>;
  @Input() mapType!: Signal<string>;
  @Output() mapTypeChange = new EventEmitter<string | number>();
} 