interface User {
  user_id: string;
}

export interface TweetItem {
  text: string;
  retweet_count: number;
  reply_count: number;
  favorite_count: number;
  quote_count: number;
  tweet_id: string;
  user: User;
  creation_date: string;
  views: number;
}

export interface TweetsApiResponse {
  results: TweetItem[];
  continuation_token?: string | null;
}

export interface TweetRecord {
  text: string;
  retweet_count: number;
  reply_count: number;
  like_count: number | null;
  quote_count: number;
  tweet_id: string;
  user_id: string;
  creation_date: string;
  views: number;
  trend_id: number;
}
