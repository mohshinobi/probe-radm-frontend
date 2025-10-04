import { Injectable, signal } from '@angular/core';
import { Category, ValidationResult } from '../rule-set-generator.types';

@Injectable({
    providedIn: 'root'
})
export class RuleSelectionStateService {

    private readonly CATEGORY_COLORS: Record<number, string> = {
        1: '#9C27B0',
        2: '#8BC34A',
        3: '#03A9F4',
        4: '#f89200',
        5: '#FFC107',
        6: '#9999ff',
        7: '#2196F3'
    };

    selectedMap = signal<Record<string, Array<string | number>>>({});

    /**
     * handles chip selection/deselection
     */
    toggleChipSelection(categories: Category[], category: Category, optionIndex: number): void {
        const categoryIndex = categories.findIndex(c => c.key === category.key);
        const color = this.CATEGORY_COLORS[categoryIndex >= 0 ? (categoryIndex + 1) : 1];

        const option = category.options[optionIndex];
        const currentSelections = this.selectedMap();
        const categorySelections = [...(currentSelections[category.key] ?? [])];

        const valueIndex = categorySelections.indexOf(option.value);

        if (valueIndex >= 0) {
            categorySelections.splice(valueIndex, 1);
            option.color = undefined;
        } else {
            categorySelections.push(option.value);
            option.color = color;
        }

        this.selectedMap.set({
            ...currentSelections,
            [category.key]: categorySelections
        });
    }

    /**
     * validates that all categories have at least one selection
     */
    validateSelections(categories: Category[]): ValidationResult {
        const selectedMap = this.selectedMap();
        const errors: string[] = [];

        for (const category of categories) {
            const selections = selectedMap[category.key] ?? [];
            if (selections.length === 0) {
                errors.push(`Please select at least one option from ${category.title}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * payload for API requests
     */
    buildPayload(iocDays: number = 0): Record<string, any> {
        const payload: Record<string, any> = {};
        const selections = this.selectedMap();

        for (const key of Object.keys(selections)) {
            payload[key] = selections[key];
        }

        payload['ioc_days'] = iocDays;
        return payload;
    }


    clearSelections(): void {
        this.selectedMap.set({});
    }

    /**
     * selects all options from all categories
     */
    selectAllOptions(categories: Category[]): void {
        const currentSelections = this.selectedMap();

        categories.forEach(category => {
            const categorySelections = currentSelections[category.key] ?? [];

            category.options.forEach((option, index) => {
                if (!categorySelections.includes(option.value)) {
                    this.toggleChipSelection(categories, category, index);
                }
            });
        });

        // ensure visual state matches selection state
        this.syncVisualState(categories);
    }

    /**
     * synchronizes visual state (colors) with selection state
     */
    syncVisualState(categories: Category[]): void {
        const currentSelections = this.selectedMap();

        categories.forEach((category, categoryIndex) => {
            const categorySelections = currentSelections[category.key] ?? [];
            const color = this.CATEGORY_COLORS[categoryIndex + 1] || this.CATEGORY_COLORS[1];

            category.options.forEach(option => {
                if (categorySelections.includes(option.value)) {
                    option.color = color;
                } else {
                    option.color = undefined;
                }
            });
        });
    }
}
