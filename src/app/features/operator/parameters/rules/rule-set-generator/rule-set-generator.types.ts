export interface Option {
    label: string;
    value: string | number;
    color?: string;
}

export interface Category {
    key: string;
    title: string;
    color?: string;
    options: Option[];
}

export interface RuleSelectionPayload {
    [key: string]: Array<string | number> | number;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
