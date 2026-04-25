import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
          Never miss a <span className="text-blue-500">signal</span> again.
        </h1>
        <p className="text-xl text-zinc-400 mb-10">
          Auto-execute trades from any Telegram signal channel directly on your Bybit or Binance account in under 1 second.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            href="/register" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition text-lg"
          >
            Get Started
          </Link>
          <Link 
            href="/login" 
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-8 rounded-lg transition text-lg border border-zinc-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
