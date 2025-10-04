import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { PieChartInterface } from '@core/interfaces';
import { Signal } from '@angular/core';
import { PieComponent } from '@shared/components/graphs/pie/pie.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-file-info-template',
    imports: [
        CommonModule,
        MatCardModule,
        PieComponent,
        MatIconModule,
        MatTooltipModule
    ],
    template: `
    <section class="file-info-section">
        <div class="column-33">
            <mat-card class="radm-card">
                <mat-card-content>
                    <div class="chart-container">
                        <h3 class="graph-title card-title">Requests by HTTP Method
                          <mat-icon
                              matTooltip="Breakdown of HTTP requests by method type"
                              [matTooltipPosition]="'above'"
                            >help_outline</mat-icon>
                        </h3>
                        <app-pie [graphOptions]="requestsByHttpMethode()"/>
                    </div>
                </mat-card-content>
            </mat-card>
        </div>
        <div class="column-33">
            <mat-card class="radm-card">
                <mat-card-content>
                    <div class="chart-container">
                        <h3 class="graph-title card-title">Requests by HTTP User Agent
                          <mat-icon
                              matTooltip="Distribution of HTTP traffic categorized by client browser and device information"
                              [matTooltipPosition]="'above'"
                            >help_outline</mat-icon>
                        </h3>
                        <app-pie [graphOptions]="requestsByHttpUserAgent()"/>
                    </div>
                </mat-card-content>
            </mat-card>
        </div>
        <div class="column-33">
            <mat-card class="radm-card">
                <mat-card-content>
                    <div class="chart-container">
                        <h3 class="graph-title card-title">Requests by HTTP Content Type
                           <mat-icon
                              matTooltip="HTTP requests grouped by content type/MIME type of the requested resources"
                              [matTooltipPosition]="'above'"
                            >help_outline</mat-icon>
                        </h3>
                        <app-pie [graphOptions]="requestsByHttpContentType()"/>
                    </div>
                </mat-card-content>
            </mat-card>
        </div>
    </section>
  `,
    styles: [`
    .file-info-section {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      margin-bottom: 1rem;
    }
    .radm-card {
      height: 100%;
      background-color: #1F1F1F;
      border-radius: 16px;
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
      font-family: Sesame, serif;
    }
  `]
})
export class FileInfoTemplateComponent {
  @Input({ required: true }) requestsByHttpMethode!: Signal<PieChartInterface>;
  @Input({ required: true }) requestsByHttpUserAgent!: Signal<PieChartInterface>;
  @Input({ required: true }) requestsByHttpContentType!: Signal<PieChartInterface>;
}
