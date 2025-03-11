import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseTweetItem } from '@/lib/parseTweetItem';
import { insertTweets } from '@/lib/insertTweets';
import { TweetRecord } from '@/_types/tweets.type';

const API_URL = 'https://twitter154.p.rapidapi.com/search/search/continuation';

export async function GET(): Promise<NextResponse> {
  const xRapidApiKey = process.env.X_RAPID_API_KEY;

  if (!xRapidApiKey) {
    return NextResponse.json({ error: 'Missing API Key' }, { status: 401 });
  }

  try {
    // 1. Get the latest query session per trend (fetch continuation_token)
    const { data: activeSessions, error: sessionError } = await supabase
      .from('query_sessions')
      .select('id, trend_id, continuation_token, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (sessionError)
      throw new Error(`Database error: ${sessionError.message}`);

    if (!activeSessions || activeSessions.length === 0) {
      return NextResponse.json(
        { message: 'No continuation tokens available' },
        { status: 200 }
      );
    }

    // 2. Retrieve associated trend names
    const trendIds = activeSessions.map((session) => session.trend_id);
    const { data: trends, error: trendError } = await supabase
      .from('trends')
      .select('id, trend_name')
      .in('id', trendIds);

    if (trendError) throw new Error(`Database error: ${trendError.message}`);

    // Map trend names to their corresponding trend_id for quick lookup
    const trendMap = new Map(trends.map((t) => [t.id, t.trend_name]));

    // 2. For each trend, fetch tweets
    const tweets = activeSessions
      ? await Promise.all(
          activeSessions.map(async (session) => {
            // Get trend name
            const trendName = trendMap.get(session.trend_id);

            if (!trendName) {
              console.warn(
                `Trend ID ${session.trend_id} has no associated trend name.`
              );
              return null; // Skip this iteration if trend name is missing
            }

            const params = new URLSearchParams({
              query: encodeURIComponent(trendName),
              section: 'top',
              min_retweets: '20',
              limit: process.env.TWEET_FETCH_LIMIT || '5',
              continuation_token: session.continuation_token,
              min_likes: '20',
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
            const newContinuationToken = dataFetched.continuation_token || null;

            if (newContinuationToken) {
              const { error } = await supabase.from('query_sessions').insert({
                trend_id: session.trend_id,
                continuation_token: newContinuationToken,
              });

              if (error)
                throw new Error(
                  `Database error ${error.message}` ||
                    'An error occurred while inserting new continuation tokens'
                );
            }

            // 4. Parse each tweets and return array of tweets array
            return parseTweetItem(dataFetched, session.trend_id);
          })
        )
      : [];

    const flatTweetArray = tweets
      .flat()
      .filter((tweet): tweet is TweetRecord => tweet !== null);
    return insertTweets(flatTweetArray);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
