import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { insertTweets } from '@/lib/insertTweets';
import { parseTweetItem } from '@/lib/parseTweetItem';

/**
 *  X API Information
 *  const API_URL =
 *   'https://api.twitter.com/2/tweets/search/recent?query=AMERICA+IS+BACK&tweet.fields=public_metrics';
 *
 *  const BEARER_TOKEN = process.env.NEXT_PUBLIC_X_BEARER_TOKEN;
 */

/**
 *  Rapid API Information
 *  https://rapidapi.com/omarmhaimdat/api/twitter154
 */
const API_URL = 'https://twitter154.p.rapidapi.com/search/search';

export async function GET(): Promise<NextResponse> {
  const xRapidApiKey = process.env.X_RAPID_API_KEY;

  if (!xRapidApiKey) {
    return NextResponse.json({ error: 'Missing API Key' }, { status: 401 });
  }

  try {
    // 1. Query top trends from DB
    /**
     * Trend selection Approach 1 - Top Three
     * fetches tweets for the top three trends based on the highest post counts.
     */
    // const { data: topTrends, error: trendsError } = await supabase
    //   .from('trends')
    //   .select('id, trend_name, post_count')
    //   .not('post_count', 'is', null)
    //   .order('post_count', { ascending: false })
    //   .limit(3);

    /**
     * Trend selection Approach 2 - Random Sampling from High-Ranking Trends
     * randomly pick one from each rank: 4-7 and 8-12.
     */
    // Fetch the rank 4-7 trends
    // const { data: range4to7Trends, error: range4to7Error } = await supabase
    //   .from('trends')
    //   .select('id, trend_name, post_count')
    //   .not('post_count', 'is', null)
    //   .order('post_count', { ascending: false }) // Order by post count (descending)
    //   .range(3, 6); // Fetch the 4th to 7th rank trends (0-based index)
    //
    // if (range4to7Error)
    //   throw new Error(
    //     `Database error ${range4to7Error.message}` ||
    //       'An error occurred while fetching trends data'
    //   );

    // Fetch the rank 8-12 trends
    // const { data: range8to12Trends, error: range8to12Error } = await supabase
    //   .from('trends')
    //   .select('id, trend_name, post_count')
    //   .not('post_count', 'is', null)
    //   .order('post_count', { ascending: false }) // Order by post count (descending)
    //   .range(7, 11); // Fetch the 8th to 12th rank trends (0-based index)
    //
    // if (range8to12Error)
    //   throw new Error(
    //     `Database Error: ${range8to12Error.message}` ||
    //       'An error occurred fetching rank 8-12 trends'
    //   );

    // Randomly select one trend from each range (using JavaScript)
    // const selectedRange4to7Trend =
    //   range4to7Trends &&
    //   range4to7Trends[Math.floor(Math.random() * range4to7Trends.length)];
    //
    // const selectedRange8to12Trend =
    //   range8to12Trends &&
    //   range8to12Trends[Math.floor(Math.random() * range8to12Trends.length)];

    // Combine the results into a single array
    // const selectedTrends = [
    //   selectedRange4to7Trend,
    //   selectedRange8to12Trend,
    // ].filter(Boolean); // Remove null/undefined in case ranges are empty

    // If empty, return an appropriate error
    // if (selectedTrends.length === 0) {
    //   throw new Error('No trends found in the specified ranges');
    // }

    /**
     * Trend selection Approach 3 - **Engagement Velocity-Based Selection**
     * how fast a trend is growing based on the tweets associated with each trend.
     * This involves calculating the rate of change (growth velocity) for parameters
     * like `retweet_count`, `reply_count`, `like_count`, and `views` since
     * the `creation_date` of the tweets. You can then take the average or
     * a weighted score of these values for each trend and pick the
     * top 3 trending IDs based on their engagement velocity.
     */

    const { data: topTrends, error: velocityError } = await supabase.rpc(
      'get_top_trends_by_velocity',
      {}
    );

    console.log('**** topTrends ****', topTrends);

    if (velocityError) {
      throw new Error(
        `Database error ${velocityError.message}` ||
          'An error occurred while fetching top trends by engagement velocity'
      );
    }

    // 2. For each trend, fetch tweets
    const tweets = topTrends
      ? await Promise.all(
          topTrends.map(async (trend: { trend_name: string; id: number }) => {
            const params = new URLSearchParams({
              query: encodeURIComponent(trend.trend_name),
              section: 'top',
              min_retweets: '1',
              min_likes: '1',
              limit: process.env.TWEET_FETCH_LIMIT || '5',
              start_date: '2022-01-01',
              language: 'en',
            });

            const response = await fetch(`${API_URL}?${params}`, {
              method: 'GET',
              headers: {
                'x-rapidapi-key': xRapidApiKey,
                'x-rapidapi-host': 'twitter154.p.rapidapi.com',
              },
            });

            if (!response.ok) {
              throw new Error(
                `API Error: ${response.status} - ${response.statusText}`
              );
            }

            const dataFetched = await response.json();

            // 3. Insert new continuation token in query_sessions table
            const continuationToken = dataFetched.continuation_token || null;

            if (continuationToken) {
              const { error } = await supabase.from('query_sessions').insert({
                trend_id: trend.id,
                continuation_token: continuationToken,
              });

              if (error)
                throw new Error(
                  `Database error ${error.message}` ||
                    'An error occurred while inserting continuation tokens'
                );
            }

            // 4. Parse each tweets and return array of tweets array
            return parseTweetItem(dataFetched, trend.id);
            // return dataFetched;
          })
        )
      : [];

    /**
     * Why `.flat()` is needed outside `Promise.all`:
     * Since `Promise.all` resolves to an array of arrays,
     * to combine all tweets into a flat, single-level array,
     * you need to call `.flat()`
     */
    const flatTweetArray = tweets.flat();

    return insertTweets(flatTweetArray);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
