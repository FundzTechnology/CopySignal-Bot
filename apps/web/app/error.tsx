'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error('Global Error Boundary Caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white font-sans">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-xl">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
          We experienced an unexpected error while trying to load this page. Our engineering team has been notified.
        </p>
        <button
          onClick={() => reset()}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
