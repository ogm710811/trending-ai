import Trending from './components/Trending';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Real-Time Trending Topics</h1>
      <Trending />
    </main>
  );
}
