import { CommonModule } from '@angular/common';
import {AfterViewInit, Component, inject, OnDestroy, Renderer2} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from "@angular/material/card";
import { CircleProgressOptions, NgCircleProgressModule } from 'ng-circle-progress';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule} from "@angular/material/icon";


type RuleMap = Record<string, string[]>;
type RuleTypeBlock = { type: string; values: string[] };

interface StepVM {
  name: string;
  description?: string;
  scenario?: string;
  weight?: number;
  ruleTypes: RuleTypeBlock[];
}

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatStepperModule,
    CommonModule,
    MatCardModule,
    NgCircleProgressModule,
    MatTableModule,
    MatIconModule
],
providers: [CircleProgressOptions],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})

export class DetailsComponent{

  private _renderer = inject(Renderer2)
  private _router = inject(ActivatedRoute)

  displayedRuleColumns = ['value', 'actions'];

  private toRuleTypes(map?: RuleMap): RuleTypeBlock[] {
    if (!map) return [];
    return Object.entries(map).map(([type, values]) => ({
      type,
      values: Array.isArray(values) ? values : []
    }));
  }

  onRuleAction(type: string, value: string) {
    console.log('Rule action', { type, value });
  }

  isTA(v: string): boolean {
    return (v ?? '').trim().toUpperCase().startsWith('TA');
  }

  description: string = '';
  severity: number = 0;
  progress: number = 0;
  timespan: number = 0;
  name: string = '';
  stepData: any[] = [];
  TTPs: any[] = [];
  tags: any[] = [];

  ngOnInit() {
    this._router.queryParams.subscribe(params => {

      this.name = params['name'] || '';
      this.TTPs = JSON.parse(params['TTPs'] || '[]');
      this.tags = JSON.parse(params['tags'] || '[]');
      this.severity = +params['severity'] || 0;
      this.timespan = +params['timespan'] || 0;
      this.progress = +params['progress'] || 0;
      this.description = params['description'] || '';

      const steps = JSON.parse(params['steps'] || '[]');
      const rulesPerStep = JSON.parse(params['rules'] || '{}') as Record<string, RuleMap>;

      this.stepData = steps.map((s: any) => ({
        name: s.name,
        description: s.description,
        scenario: s.scenario,
        weight: s.weight,
        ruleTypes: this.toRuleTypes(rulesPerStep?.[s.name])
      }));

    });
  }
}
