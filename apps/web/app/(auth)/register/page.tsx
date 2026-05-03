'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/auth';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { FooterBranding } from '@/components/FooterBranding';

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
      router.push('/onboarding');
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRegister();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background ambient glow - green for register */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-success/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
      
      <div className="flex-1 flex items-center justify-center w-full z-10 my-8">
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 w-full max-w-md shadow-2xl relative overflow-hidden">
          {/* Left accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-success rounded-l-2xl" />

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-foreground text-3xl font-bold tracking-tight">Create Account</h1>
            <p className="text-success text-sm mt-2 font-medium bg-success/10 py-1.5 px-3 rounded-full inline-block border border-success/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
              ✨ 5 days free Pro access — no payment needed
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

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <User className="h-5 w-5" />
              </div>
              <input
                id="register-username"
                placeholder="Username"
                autoComplete="username"
                className="w-full bg-background border border-border text-foreground rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-success/50 focus:border-success transition-all shadow-sm"
                onChange={e => setForm({ ...form, username: e.target.value })}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="register-email"
                placeholder="Email address"
                type="email"
                autoComplete="email"
                className="w-full bg-background border border-border text-foreground rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-success/50 focus:border-success transition-all shadow-sm"
                onChange={e => setForm({ ...form, email: e.target.value })}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="register-password"
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="w-full bg-background border border-border text-foreground rounded-xl py-3.5 pl-11 pr-12 outline-none focus:ring-2 focus:ring-success/50 focus:border-success transition-all shadow-sm"
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
            id="register-submit"
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-success hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed text-success-foreground font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-success/25 mt-8 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating account...</span>
              </>
            ) : (
              'Get Started — 5 Days Free'
            )}
          </button>

          {/* Trial disclaimer */}
          <div className="mt-6 bg-background/50 border border-border rounded-xl p-4 text-xs text-muted-foreground leading-relaxed text-center">
            Your free trial gives you full <span className="text-foreground font-semibold">Pro plan access</span> for 5 days.
            After that, your account moves to Free (signal viewing only) until you subscribe.
          </div>

          <p className="text-muted-foreground text-sm text-center mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-success hover:underline font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
      
      <FooterBranding />
    </div>
  );
}
