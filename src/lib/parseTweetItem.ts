import { TweetRecord, TweetsApiResponse } from '@/_types/tweets.type';

export function parseTweetItem(
  dataFetched: TweetsApiResponse,
  trendId: number
): TweetRecord[] {
  const tweets = dataFetched.results || []; // Ensure it's an array
  console.log('trendId :::', trendId);
  return tweets.map((t) => ({
    text: t.text,
    retweet_count: t.retweet_count,
    reply_count: t.reply_count,
    like_count: t.favorite_count,
    quote_count: t.quote_count,
    tweet_id: t.tweet_id,
    user_id: t.user.user_id,
    creation_date: t.creation_date,
    views: t.views,
    trend_id: trendId,
  }));
}
