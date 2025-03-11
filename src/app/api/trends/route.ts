import { NextResponse } from 'next/server';
import { parseTrendItem } from '@/lib/parseTrendItem';
import { supabase } from '@/lib/supabase';

/**
 *  Rapid API Information
 *  https://rapidapi.com/realtimedata/api/real-time-twitter-data-scraper
 */
const API_URL =
  'https://real-time-twitter-data-scraper.p.rapidapi.com/v1.1/Trends/';

export async function GET() {
  const xRapidApiKey = process.env.X_RAPID_API_KEY;

  if (!xRapidApiKey) {
    return NextResponse.json({ error: 'Missing API Key' }, { status: 401 });
  }

  try {
    const params = new URLSearchParams({
      location_id: '-7608764736147602991', // Required: Location ID
      count: '20', // Optional: Number of trends
    });

    const response = await fetch(`${API_URL}?${params}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': xRapidApiKey,
        'x-rapidapi-host': 'real-time-twitter-data-scraper.p.rapidapi.com',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    // 1. Fetch data from RapidAPI
    const rawData = await response.json();
    const addEntriesInstruction = rawData.timeline.instructions.find(
      (instruction: { addEntries?: { entries?: unknown[] } }) =>
        instruction.addEntries?.entries
    );

    const trendEntries =
      addEntriesInstruction?.addEntries?.entries.filter(
        (entry: { entryId: string }) => entry.entryId.startsWith('trends')
      ) || [];

    const trendsContainer = trendEntries[0];
    const trendItems = trendsContainer?.content?.timelineModule?.items || [];

    // 2. Parse each trend item
    const trends = trendItems.map(parseTrendItem);

    // 3. Insert trends in database
    const { data, error } = await supabase
      .from('trends')
      .insert(trends)
      .select();

    if (error) throw error;

    // 4. Return success
    return NextResponse.json(
      { message: 'Trends updated successfully', insertedCount: data?.length },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
