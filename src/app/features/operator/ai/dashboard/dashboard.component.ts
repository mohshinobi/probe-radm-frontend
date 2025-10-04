import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ToLowerCasePipe } from '@shared/pipes/to-lower-case.pipe';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { NumbersPipe } from '@shared/pipes/numbers.pipe';
import { RoundPipe } from '@shared/pipes/round.pipe';

const riskLevels = {
  '1': 'Low Risk',
  '2': 'Medium Risk',
  '3': 'High Risk',
  '4': 'Critical Risk'
};

interface IaStatsInterface { 
  stats_type: string,
  average_fps: number,
  current_fps: number,
  max_fps: number,
  started_at: string,
  progress: number,
  processed: number,
  dropped: number,
  error: number,
  status: string
}

interface ActorDirection{ 
  [key: string]: any;
  timestamp: string,
  src_acteurs: number,
  dest_acteurs: number 
}

@Component({
    selector: 'app-dashboard',
    imports: [
        MatCardModule,
        CommonModule,
        MatIconModule,
        NgCircleProgressModule
    ],
    providers: [
        (NgCircleProgressModule.forRoot({})).providers!,
        ToLowerCasePipe,
        NumbersPipe,
        RoundPipe
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

 
}