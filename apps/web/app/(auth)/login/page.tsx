'use client';
import { useState } from 'react';
import { db } from '@/lib/cocobase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        <input
          id="login-password"
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          className="w-full bg-zinc-800 text-white rounded-lg p-3 mb-5 outline-none focus:ring-2 focus:ring-blue-600 transition"
          onChange={e => setForm({ ...form, password: e.target.value })}
          onKeyDown={handleKeyDown}
        />

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
