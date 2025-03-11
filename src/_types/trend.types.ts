export interface TrendItem {
  entryId?: string;
  item?: {
    content?: {
      trend?: {
        name?: string;
        trendMetadata?: {
          metaDescription?: string;
          domainContext?: string;
        };
      };
    };
  };
}

export interface TrendRecord {
  entry_id?: string;
  trend_name?: string;
  domain_context?: string | null;
  meta_description?: string | null;
  post_count?: number | null;
  raw_json?: unknown;
}
