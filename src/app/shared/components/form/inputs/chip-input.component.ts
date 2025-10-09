import {ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BaseInputComponent } from './base-input.component';
import { BaseInputModule } from './base-input.module';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'radm-text',
    template: `
    <mat-form-field [formGroup]="form" class="field" radmearance="outline">
      <mat-label [attr.for]="field.key">{{ field.label }}</mat-label>
      <mat-chip-grid #reactiveChipGrid aria-label="Enter reactive form keywords" [formControlName]="field.key" >
        @for (keyword of reactiveKeywords(); track keyword) {
          <mat-chip-row (removed)="removeReactiveKeyword(keyword)">
            {{keyword}}
          <button matChipRemove aria-label="'remove reactive form' + keyword">
            <mat-icon>cancel</mat-icon>
          </button>
          </mat-chip-row>
        }
      </mat-chip-grid>
      <input matInput [placeholder]="field.placeholder" 
        [id]="field.key" 
        [type]="field.type"
        [matChipInputFor]="reactiveChipGrid"
        (matChipInputTokenEnd)="addReactiveKeyword($event)"
      />
      @if (field.icon) {
        <mat-icon matSuffix>{{field.icon}}</mat-icon>
      }
      @if(errors) {
        <mat-error>{{errors}}</mat-error>
      }
    </mat-form-field>
  `,
    imports: [
        BaseInputModule,
        MatChipsModule,
        MatIcon
    ],
    styleUrl: 'field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipInputComponent extends BaseInputComponent<string> {

  readonly reactiveKeywords = signal([] as string[]);

  ngOnInit() {
    this.form.valueChanges.subscribe(() => {
      if (this.form.pristine) {
        this.reactiveKeywords.set([]);
      }
    });
  }

  removeReactiveKeyword(keyword: string) {
    this.reactiveKeywords.update(keywords => {
      const index = keywords.indexOf(keyword);
      if (index < 0) {
        return keywords;
      }

      keywords.splice(index, 1);
      return [...keywords];
    });
  }

  addReactiveKeyword(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.reactiveKeywords.update(keywords => [...keywords, value]);
    }

    event.chipInput!.clear();
  }
}