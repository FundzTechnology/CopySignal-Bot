'use client'; // Error boundaries must be Client Components

import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#050505] text-white font-sans min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-xl m-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Critical Application Error</h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            A fatal error occurred. Our engineering team has been notified.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-xl transition-all"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
