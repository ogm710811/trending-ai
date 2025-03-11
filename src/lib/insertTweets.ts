import { NextResponse } from 'next/server';
import { TweetRecord } from '@/_types/tweets.type';
import { supabase } from '@/lib/supabase';

/**
 * Inserts an array of tweets into the database.
 *
 * @param flatTweetArray - Array of parsed tweets to be inserted into the database.
 * @returns A JSON response with a success message and the count of inserted tweets, or throws an error.
 */
export const insertTweets = async (flatTweetArray: TweetRecord[]) => {
  // console.log('**** insertTweets *****', flatTweetArray);

  // const { data, error } = await supabase
  //   .from('tweets')
  //   .insert(flatTweetArray)
  //   .select();

  const duplicates = flatTweetArray.filter(
    (tweet, index, self) =>
      self.findIndex((t) => t.tweet_id === tweet.tweet_id) !== index
  );

  if (duplicates.length > 0) {
    console.log('Duplicate tweet_ids:', duplicates);
  }

  // Remove duplicate tweet_ids from the array
  const uniqueTweetArray = Array.from(
    new Map(flatTweetArray.map((tweet) => [tweet.tweet_id, tweet])).values()
  );

  const { data, error } = await supabase
    .from('tweets')
    .upsert(uniqueTweetArray, { onConflict: 'tweet_id' })
    .select();

  if (error) {
    throw new Error(
      `Database error ${error.message}` ||
        'An error occurred while inserting tweets'
    );
  }

  return NextResponse.json(
    {
      message: 'Tweets inserted successfully',
      insertedCount: data?.length,
    },
    { status: 200 }
  );
};
