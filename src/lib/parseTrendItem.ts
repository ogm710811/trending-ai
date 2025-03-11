import { TrendItem, TrendRecord } from '@/_types/trend.types';

export function parseTrendItem(item: TrendItem): TrendRecord {
  const entryId = item.entryId || '';
  const trendObj = item?.item?.content?.trend ?? {};
  const trendName = trendObj?.name ?? '';
  const metaDescription = trendObj?.trendMetadata?.metaDescription ?? null;
  const domainContext = trendObj?.trendMetadata?.domainContext ?? null;
  const postCount = parsePostCount(metaDescription);

  return {
    entry_id: entryId,
    trend_name: trendName,
    domain_context: domainContext,
    meta_description: metaDescription,
    post_count: postCount,
    raw_json: item,
  };
}

function parsePostCount(metaDescription: string | null) {
  if (!metaDescription) return null;

  // e.g. "50.1K posts" or "631K posts"
  // 1) Extract the numeric portion, e.g. "50.1" or "631"
  // 2) Detect "K" or "M"
  const regex = /(\d+(\.\d+)?)([KM])?/i;
  const match = metaDescription.match(regex);

  if (!match) {
    // handle purely numeric or other text like "Promoted by Disney+"
    // fallback: remove commas and parse
    const numericOnly = metaDescription.replace(/[^\d]/g, '');
    return numericOnly ? parseInt(numericOnly, 10) : null;
  }

  const [, numStr, , suffix] = match; // e.g. ["50.1K", "50.1", ".1", "K"]
  let value = parseFloat(numStr); // "50.1" -> 50.1, "631" -> 631

  if (suffix) {
    if (suffix.toUpperCase() === 'K') {
      // multiply by 1,000
      value *= 1000;
    } else if (suffix.toUpperCase() === 'M') {
      // multiply by 1,000,000
      value *= 1000000;
    }
  }

  // Round or floor to an integer if you prefer.
  return Math.round(value);
}
