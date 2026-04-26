'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', username: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.username) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await registerUser(form.email, form.password, form.username);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = (err?.message || err?.error || '').toLowerCase();
      let friendlyError = 'Registration failed. Please try again.';
      
      if (msg.includes('no active subscription') || msg.includes('402')) friendlyError = "Can't create account at the moment. Please try again later.";
      else if (msg.includes('already') || msg.includes('exists')) friendlyError = 'This email has already been used. Please log in instead.';
      else if (msg.includes('password')) friendlyError = 'Please ensure your password is secure and try again.';
      else if (msg.includes('email')) friendlyError = 'Please check your email address properly.';

      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white text-2xl font-bold">Create Account</h1>
          <p className="text-emerald-400 text-sm mt-1 font-medium">
            ✨ 5 days free Pro access — no payment needed
          </p>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-400 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <input
          id="register-username"
          placeholder="Username"
          autoComplete="username"
          className="w-full bg-zinc-800 text-white rounded-lg p-3 mb-3 outline-none focus:ring-2 focus:ring-blue-600 transition"
          onChange={e => setForm({ ...form, username: e.target.value })}
        />
        <input
          id="register-email"
          placeholder="Email"
          type="email"
          autoComplete="email"
          className="w-full bg-zinc-800 text-white rounded-lg p-3 mb-3 outline-none focus:ring-2 focus:ring-blue-600 transition"
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          id="register-password"
          placeholder="Password"
          type="password"
          autoComplete="new-password"
          className="w-full bg-zinc-800 text-white rounded-lg p-3 mb-5 outline-none focus:ring-2 focus:ring-blue-600 transition"
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        <button
          id="register-submit"
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
        >
          {loading ? 'Creating account...' : 'Get Started — 5 Days Free'}
        </button>

        {/* Trial disclaimer */}
        <div className="mt-4 bg-zinc-800/50 rounded-lg p-3 text-xs text-zinc-400 leading-relaxed">
          Your free trial gives you full <span className="text-white font-semibold">Pro plan access</span> for 5 days.
          After that, your account moves to Free (signal viewing only) until you subscribe with USDC.
        </div>

        <p className="text-zinc-500 text-sm text-center mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-400 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
