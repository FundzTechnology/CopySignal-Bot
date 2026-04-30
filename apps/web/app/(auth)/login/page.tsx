'use client';
import { useState } from 'react';
import { db } from '@/lib/cocobase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await db.auth.login({ email: form.email, password: form.password });
      router.push('/dashboard');
    } catch (err: any) {
      const msg = (typeof err === 'string' ? err : JSON.stringify(err)).toLowerCase();
      let friendlyError = "Can't sign in at the moment. Please try again.";
      
      if (msg.includes('invalid') || msg.includes('wrong') || msg.includes('not found') || msg.includes('credential')) {
        friendlyError = 'Wrong email or password. Please check your details properly.';
      }

      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white text-2xl font-bold">Welcome Back</h1>
          <p className="text-zinc-500 text-sm mt-1">
            New here?{' '}
            <a href="/register" className="text-blue-400 hover:underline font-medium">
              Create account — 5 days free Pro access
            </a>
          </p>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-400 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        {/* Email / Password */}
        <input
          id="login-email"
          placeholder="Email"
          type="email"
          autoComplete="email"
          className="w-full bg-zinc-800 text-white rounded-lg p-3 mb-3 outline-none focus:ring-2 focus:ring-blue-600 transition"
          onChange={e => setForm({ ...form, email: e.target.value })}
          onKeyDown={handleKeyDown}
        />
        <div className="relative mb-5">
          <input
            id="login-password"
            placeholder="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className="w-full bg-zinc-800 text-white rounded-lg p-3 pr-11 outline-none focus:ring-2 focus:ring-blue-600 transition"
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        <button
          id="login-submit"
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-zinc-500 text-sm text-center mt-5">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-blue-400 hover:underline">
            Sign up — 5 days free
          </a>
        </p>
      </div>
    </div>
  );
}
