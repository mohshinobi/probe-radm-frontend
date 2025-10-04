export interface PieAndColumnChartPoint {
  name: string;
  y: number;
}

export interface BubbleChartPoint {
  name: string;
  value: number;
}

export interface AreaSplinePoint {
  name: number;
  type: string;
  data: [number, number][];
}

export interface HistoFormatted {
  data: [number, number][];
  total: number;
}

export function formatPieAndColumn(buckets: any[]): PieAndColumnChartPoint[] {
  return buckets.map(bucket => ({
    name: bucket.key ?? null,
    y: bucket.doc_count ?? null
  }));
}

export function formatBubble(buckets: any[]): BubbleChartPoint[] {
  return buckets.map(bucket => ({
    name: bucket.key ?? null,
    value: bucket.doc_count ?? null
  }));
}

export type SankeyFormattedRow = [string, string, number, string[]];

export function formatSankey(data: any[]): SankeyFormattedRow[] {
  const sankeyData: SankeyFormattedRow[] = [];

  for (const bucket1 of data) {
    const source = bucket1.key;

    for (const bucket2 of bucket1['aggs-1']?.buckets ?? []) {
      const target = bucket2.key;
      const targetCount = bucket2.doc_count;

      const protocols: string[] = [];
      const aggs2Buckets = bucket2['aggs-2']?.buckets ?? [];

      for (const proto of aggs2Buckets) {
        protocols.push(proto.key);
      }

      sankeyData.push([source, target, targetCount, protocols]);
    }
  }

  return sankeyData;
}

export function formatAreaSpline(result: any[]): AreaSplinePoint[] {
  return result.map(aggs => {
    const buckets = aggs['aggs-relation']?.buckets ?? [];

    const data: [number, number][] = buckets.map((item: any) => [
      item.key ?? 0,
      item.doc_count ?? 0
    ]);

    return {
      name: aggs.key ?? 'unknown',
      type: 'area',
      data
    };
  });
}

export function formatHistoField(result: any[]): HistoFormatted {
  const data: [number, number][] = [];
  let total = 0;

  for (const item of result) {
    const key = item.key ?? 0;
    const value = item.count?.value ?? 0;

    data.push([key, value]);
    total += value;
  }

  return { data, total };
}

export function formatHistoByTime(result: any[], field: string): HistoFormatted {
  if (!result || !Array.isArray(result)) {
    return { data: [], total: 0 };
  }
  const data: [number, number][] = [];
  let total = 0;

  for (const item of result) {
    const key = item.key;
    const value = item.doc_at_interval.hits?.hits[0]?._source?.[field] ?? 0;
    data.push([key, value]);
    total += value;
  }

  return { data, total };
}
