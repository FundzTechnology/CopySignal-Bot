'use client';
import { useState } from 'react';
import { db } from '@/lib/cocobase';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { FooterBranding } from '@/components/FooterBranding';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fire-and-forget login event logging
  const logLoginEvent = (userId: string | null, email: string, status: 'success' | 'failed') => {
    fetch('/api/auth/login-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email, status }),
    }).catch(() => {}); // non-critical — don't block the user
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await db.auth.login({ email: form.email, password: form.password });
      logLoginEvent(result?.user?.id || null, form.email, 'success');
      router.push('/dashboard');
    } catch (err: any) {
      logLoginEvent(null, form.email, 'failed');
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
      
      <div className="flex-1 flex items-center justify-center w-full z-10">
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 w-full max-w-md shadow-2xl relative">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-foreground text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Sign in to manage your automated trades
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-4 mb-6 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Email / Password */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="login-email"
                placeholder="Email address"
                type="email"
                autoComplete="email"
                className="w-full bg-background border border-border text-foreground rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                onChange={e => setForm({ ...form, email: e.target.value })}
                onKeyDown={handleKeyDown}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="login-password"
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="w-full bg-background border border-border text-foreground rounded-xl py-3.5 pl-11 pr-12 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 mt-8 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="text-center mt-6">
            <a href="/reset-password" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              Forgot your password?
            </a>
          </div>

          <p className="text-muted-foreground text-sm text-center mt-4">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-primary hover:underline font-medium">
              Create account — 5 days free
            </a>
          </p>
        </div>
      </div>
      
      <FooterBranding />
    </div>
  );
}
