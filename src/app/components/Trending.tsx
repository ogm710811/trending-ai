'use client';

import { useEffect, useState } from 'react';

export default function Trending() {
  const [trends, setTrends] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrends() {
      // try {
      //   const response = await fetch('/api/trending-topics');
      //   if (!response.ok) throw new Error('Failed to fetch trending topics');
      //
      //   const data = await response.json();
      //
      //   const addEntriesInstruction = data.timeline.instructions.find(
      //     (instruction) => instruction.addEntries?.entries
      //   );
      //   console.log('addEntriesInstruction', addEntriesInstruction?.entries);
      //
      //   const trendEntries =
      //     addEntriesInstruction?.addEntries?.entries.filter((entry) =>
      //       entry.entryId.startsWith('trends')
      //     ) || [];
      //   console.log('trendEntries', trendEntries);
      //
      //   const trendsContainer = trendEntries[0];
      //   const trendItems =
      //     trendsContainer?.content?.timelineModule?.items || [];
      //
      //   console.log('trendItems', trendItems);
      //
      //   setTrends(trendItems || []);
      // } catch (err) {
      //   setError((err as Error).message);
      // }
    }
    fetchTrends();

    // Adjusted polling frequency: Once every 6 hours (6 * 60 * 60 * 1000 ms)
    const interval = setInterval(fetchTrends, 6 * 60 * 60 * 1000); // 6 hours

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Trending Topics</h2>
      {error && <p className="text-red-500">{error}</p>}
      {/*<ul>*/}
      {/*  {trends.map((trend) => (*/}
      {/*    <li key={trend.entryId}>*/}
      {/*      <strong>{trend.item.content.trend.name}</strong>*/}
      {/*      <br />*/}
      {/*      <small>*/}
      {/*        {trend.item.content.trend.trendMetadata?.metaDescription}*/}
      {/*      </small>*/}
      {/*      <br />*/}
      {/*      <small>*/}
      {/*        {trend.item.content.trend.trendMetadata?.domainContext}*/}
      {/*      </small>*/}
      {/*    </li>*/}
      {/*  ))}*/}
      {/*</ul>*/}
    </div>
  );
}
