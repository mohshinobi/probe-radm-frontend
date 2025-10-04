import {AfterViewInit, Component, inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {MatCard, MatCardContent} from "@angular/material/card";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {MatIconButton} from "@angular/material/button";
import {MatStep, MatStepper, MatStepperIcon} from "@angular/material/stepper";
import {MatIcon} from "@angular/material/icon";
import {AlertsUcService, AlertUc, Step} from "@features/operator/uc/alerts/alerts-uc.service";
import { CommonModule } from '@angular/common';
import {ActivatedRoute} from "@angular/router";
import {DatePipe, JsonPipe} from "@angular/common";

@Component({
  selector: 'app-details',
  imports: [
    CommonModule,
    MatCard,
    MatCardContent,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIconButton,
    MatRow,
    MatRowDef,
    MatStep,
    MatStepper,
    MatStepperIcon,
    MatTable,
    MatIcon,
    JsonPipe,
    DatePipe,
    MatHeaderCellDef
  ],
  providers: [AlertsUcService],
  templateUrl: './details.component.html',
  standalone: true,
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements AfterViewInit, OnDestroy, OnInit{

  private _renderer = inject(Renderer2)
  private _alertsUcService = inject(AlertsUcService)
  private _route = inject(ActivatedRoute);

  alert?: AlertUc;

  ngOnInit(){
    this._route.queryParamMap.subscribe(params => {
      const sid = params.get('ucId') ?? undefined;
      this.alert = this._alertsUcService.getAlert(sid);
    });
  }

  ngAfterViewInit() {
    const parentElement = document.querySelector('.div-content');
    const footerElement = document.querySelector('.footer');
    parentElement ? this._renderer.setStyle(parentElement, 'padding', '14px 0 0 0'): null;
    footerElement ? this._renderer.setStyle(footerElement, 'border-top', '1px solid #454443'): null;

  }

  ngOnDestroy() {
    const parentElement = document.querySelector('.div-content');
    const footerElement = document.querySelector('.footer');
    this._renderer.setStyle(parentElement, 'padding', '14px');
    this._renderer.setStyle(footerElement, 'border-top', '1px solid #454443');
  }

  onRuleAction(type: string, value: string) {
    console.log('Rule action', { type, value });
  }

  displayedRuleColumns = ['id', 'count', 'actions'];

  getTools(steps: Step[]): string[] {
    return Array.from(new Set(steps.map(s => s.tool_name || 'unknown')));
  }

  filterByTool(steps: Step[], tool: string): Step[] {
    return steps.filter(s => (s.tool_name || 'unknown') === tool);
  }

  idHeader(tool: string): string {
    const t = (tool || '').toLowerCase();
    if ( t.includes('suricata')) return 'SID';
    if (t.includes('usecase')) return 'Usecase';
    return 'Identifier';
  }
}
