'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { FooterBranding } from '@/components/FooterBranding';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none opacity-50" />

      <div className="flex-1 flex items-center justify-center w-full z-10">
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 w-full max-w-md shadow-2xl relative">

          {sent ? (
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h1 className="text-foreground text-2xl font-bold tracking-tight">Check Your Email</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                If an account exists for <strong className="text-foreground">{email}</strong>, we've sent a password reset link.
                The link expires in <strong className="text-foreground">1 hour</strong> and can only be used once.
              </p>
              <p className="text-muted-foreground text-xs">
                Didn't receive it? Check your spam folder or try again.
              </p>
              <a href="/login" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium mt-4">
                <ArrowLeft className="h-4 w-4" /> Back to Sign In
              </a>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-foreground text-3xl font-bold tracking-tight">Reset Password</h1>
                <p className="text-muted-foreground text-sm mt-2">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-4 mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    placeholder="Email address"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-background border border-border text-foreground rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/25 mt-6"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <p className="text-muted-foreground text-sm text-center mt-6">
                <a href="/login" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back to Sign In
                </a>
              </p>
            </>
          )}
        </div>
      </div>

      <FooterBranding />
    </div>
  );
}
