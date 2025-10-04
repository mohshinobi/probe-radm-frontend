import { HttpParams } from '@angular/common/http';
import { BaseParamsInterface } from '@core/interfaces/base-params.interface';

const isKeyNumber       = ['dest_port', 'src_port', 'alert.severity', '@timestamp', 'timestamp', 'severity', 'deviance', 'confiance', 'flow_id', 'start_date', 'end_date'];
const isOrderingParams  = ['sortedBy', 'orderBy', 'startDate', 'endDate'];

export const buildHttpParams = (index: string, queryParams: any, paramMapping: { [key: string]: string }): HttpParams => 
{
    const { display_col, page = 1, size = 10, ...optionalParams } = queryParams;
    const displayFields = display_col?.join(',');
    let params = new HttpParams()
    .set('index', index)
    .set('page', page.toString())
    .set('size', size.toString())
    .set(paramMapping['display_col'], displayFields || "");

    Object.keys(optionalParams).forEach(key => {
        const value = optionalParams[key];
        if (value && value.trim() !== '') {
            const paramKey = paramMapping[key];
            params = params.set(paramKey, value);
        }
    });

    return params;
}

export const buildHttpParams2 = (index: string, queryParams: BaseParamsInterface): HttpParams => {
    const paramMapping = createParamMapping(queryParams);
    const cleanedParams = cleanParamMapping({...queryParams});

    const { display_col, page = 1, size = 10, ...optionalParams } = cleanedParams;
    const displayFields = display_col?.join(',');

    let params = new HttpParams()
    .set('index', index)
        .set('page', page.toString())
        .set('size', size.toString())
        .set(paramMapping['display_col'], displayFields || "");

    Object.entries(optionalParams).forEach(([key, value]) => {
        if (value) {
            const paramKey = paramMapping[key];
            params = params.set(paramKey, value.toString());
        }
    });
    return params;
};

// Champs qui ne doivent PAS avoir .keyword
const noKeywordFields = ['alert.signature_id']; 

const createParamMapping = (params: BaseParamsInterface): { [key: string]: string } => {
    return Object.keys(params).reduce((acc, key) => {
        const value = params[key as keyof BaseParamsInterface] as string;

        if (key === 'display_col') {
            acc[key] = 'displayedField[]';
        } else if (isOrderingParams.includes(key)) {
            acc[key] = key;
        } else {
            const formattedKey = 
                isKeyNumber.includes(key) || noKeywordFields.includes(key)
                    ? `filter[${key}]`
                    : `filter[${key}.keyword]`;

            acc[key] = (typeof value === 'string' && value.startsWith('!')) 
                ? `notMatch[${key}]`
                : formattedKey;
        }

        return acc;
    }, {} as { [key: string]: string });
};


const cleanParamMapping = (params: BaseParamsInterface): BaseParamsInterface => {
    Object.keys(params).forEach((key) => {
        const value = params[key as keyof BaseParamsInterface];
        
        if (typeof value === 'string') {
            const cleanedValue = value
                .split(',')
                .map((v) => v.startsWith('!') ? v.slice(1) : v)
                .join(',');

            params[key as keyof BaseParamsInterface] = cleanedValue as any;
        }
    });

    return params;
};
