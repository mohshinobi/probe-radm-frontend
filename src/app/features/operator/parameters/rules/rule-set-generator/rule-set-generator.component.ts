import { ChangeDetectionStrategy, Component, inject, signal, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TimeSelectorComponent } from '@shared/components/time-selector/time-selector.component';
import { RuleSetGeneratorService } from './service/rule-set-generator.service';
import { RuleSelectionStateService } from './service/rule-selection-state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Category } from './rule-set-generator.types';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-rule-set-generator',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TimeSelectorComponent
  ],
  templateUrl: './rule-set-generator.component.html',
  styleUrl: './rule-set-generator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleSetGeneratorComponent implements OnDestroy {

  private _ruleSetGenService = inject(RuleSetGeneratorService);
  private _selectionStateService = inject(RuleSelectionStateService);

  private _countRulesSubject = new Subject<void>();
  private _destroy$ = new Subject<void>();
  private _hasAutoSelected = false;

  rulesSetData = toSignal(this._ruleSetGenService.getAllRuleSet());

  iocMax: number = 999;
  rulesCount = signal(0);
  isGenerating = signal(false);
  isCounting = signal(false);
  validationErrors = signal<string[]>([]);
  isValidSelections = signal(false);

  constructor() {
    this._countRulesSubject.pipe(
      debounceTime(500),
      takeUntil(this._destroy$)
    ).subscribe(() => {
      this.performCountRules();
    });

    effect(() => {
      const categories = this.rulesSetData();
      if (categories && categories.length > 0) {
        if (!this._hasAutoSelected) {
          this.selectAllOptions(categories);
          this._hasAutoSelected = true;
        } else {
          this._selectionStateService.syncVisualState(categories);
        }
      }
    });
  }

  onChipClick(rule: Category, index: number): void {
    this._selectionStateService.toggleChipSelection(this.rulesSetData() ?? [], rule, index);
    this.validateAndUpdateState();
    this._countRulesSubject.next();
  }

  /**
   * validates selections and updates component state
   */
  private validateAndUpdateState(): boolean {
    const categories = this.rulesSetData() ?? [];
    const validationResult = this._selectionStateService.validateSelections(categories);

    this.validationErrors.set(validationResult.errors);
    this.isValidSelections.set(validationResult.isValid);

    return validationResult.isValid;
  }

  /**
   * selects all options from all categories
   */
  private selectAllOptions(categories: Category[]): void {
    const currentSelections = this._selectionStateService.selectedMap();

    categories.forEach(category => {
      const categorySelections = currentSelections[category.key] ?? [];

      category.options.forEach((option, index) => {
        if (!categorySelections.includes(option.value)) {
          this._selectionStateService.toggleChipSelection(categories, category, index);
        }
      });
    });

    // ensure visual state matches selection state
    this._selectionStateService.syncVisualState(categories);

    this.validateAndUpdateState();
    this._countRulesSubject.next();
  }

  debouncedCountRules(): void {
    this._countRulesSubject.next();
  }

  private performCountRules(): void {
    if (!this.validateAndUpdateState()) {
      return;
    }

    this.isCounting.set(true);
    const payload = this._selectionStateService.buildPayload(this.iocMax);

    this._ruleSetGenService.countRules(payload).subscribe({
      next: (res) => {
        this.rulesCount.set(res?.count ?? 0);
        this.isCounting.set(false);
      },
      error: (err) => {
        console.error('countRules error', err);
        this.isCounting.set(false);
      }
    });
  }

  /**
   * generates and downloads rules file
   */
  generateRule(): void {
    if (!this.validateAndUpdateState()) {
      return;
    }

    this.isGenerating.set(true);
    const payload = this._selectionStateService.buildPayload(this.iocMax);

    this._ruleSetGenService.generateRules(payload).subscribe({
      next: () => {
        this.isGenerating.set(false);
      },
      error: (err) => {
        console.error('generateRules error', err);
        this.isGenerating.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
