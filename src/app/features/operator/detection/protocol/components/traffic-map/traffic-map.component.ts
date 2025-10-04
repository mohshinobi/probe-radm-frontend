import { Component, EventEmitter, Input, Output, Signal } from "@angular/core";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MapChartInterface } from "@core/interfaces";
import { WorldMapComponent } from "@shared/components/graphs/world-map/world-map.component";

@Component({
    selector: 'app-traffic-map',
    imports: [MatCardModule, WorldMapComponent, MatButtonToggleModule, MatIconModule, MatTooltipModule],
    template: `
    <mat-card class="radm-card">
      <mat-card-content>
        <div style="display: flex">
          <div class="column-80">
            <h3 class="card-title graph-title">Traffic
              <mat-icon
            matTooltip="{{ helpMessage}}"
            style="cursor: pointer; margin-left: 8px;">
             help_outline
            </mat-icon>
            </h3>
          </div>
          <div style="margin-top: 1%">
            <mat-button-toggle-group class="custom-toggle-group" (change)="mapTypeChange.emit($event.value)" hideSingleSelectionIndicator="true">
              @for (option of mapTypes; track $index) {
                <mat-button-toggle
                  class="custom-toggle"
                  [value]="option.value"
                  [checked]="option.value === mapType()"
                  >
                  {{ option.label }}
                </mat-button-toggle>
              }
            </mat-button-toggle-group>
          </div>
        </div>
        <app-world-map [graphOptions]="mapOptions()"/>
      </mat-card-content>
    </mat-card>
  `,
    styleUrl: './traffic-map.component.scss'
})
export class TrafficMapComponent {
  @Input() mapOptions!: Signal<MapChartInterface>;
  @Input() mapType!: Signal<string>;
  @Output() mapTypeChange = new EventEmitter<string | number>();
  @Input() helpMessage!: string;


  readonly mapTypes = [
    { value: 'src', label: 'Source'},
    { value: 'dest', label: 'Destination'},
  ];
}
