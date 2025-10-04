export interface BaseParamsInterface {
    timestamp?: string;
    display_col?: string[];
    notMatch?: { [key: string]: string }[];
    filter?: { [key: string]: string }[];
    sortedBy?: string;
    orderBy?: string;
    page?: number;
    size?: number;
    direction?: string;
}