'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', username: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const msg = (typeof err === 'string' ? err : JSON.stringify(err)).toLowerCase();
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
        <div className="relative mb-5">
          <input
            id="register-password"
            placeholder="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className="w-full bg-zinc-800 text-white rounded-lg p-3 pr-11 outline-none focus:ring-2 focus:ring-blue-600 transition"
            onChange={e => setForm({ ...form, password: e.target.value })}
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
