'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@/lib/cocobase';
import { useRouter } from 'next/navigation';

// ─── Constants ────────────────────────────────────────────────────────────────
const SESSION_KEY = 'copysignal_session';          // localStorage key
const INACTIVITY_LIMIT = 15 * 60 * 1000;          // 15 minutes in ms
const ACTIVITY_EVENTS = [
  'mousemove', 'mousedown', 'keydown',
  'touchstart', 'scroll', 'click',
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function saveSession(user: any) {
  if (!user) return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      user,
      savedAt: Date.now(),
    }));
  } catch (_) { /* private/incognito mode may block storage */ }
}

function loadSession(): any | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { user } = JSON.parse(raw);
    return user ?? null;
  } catch (_) {
    return null;
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('sub_warning_dismissed');
  } catch (_) {}
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Track last activity time
  const lastActivityRef = useRef<number>(Date.now());
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoggedInRef = useRef(false);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async (redirectToLogin = true) => {
    clearInactivityTimer();
    try { db.auth.logout(); } catch (_) {}
    clearSession();
    isLoggedInRef.current = false;
    setUser(null);
    if (redirectToLogin) router.push('/login');
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Inactivity timer ───────────────────────────────────────────────────────
  const clearInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  const resetInactivityTimer = useCallback(() => {
    if (!isLoggedInRef.current) return;
    lastActivityRef.current = Date.now();
    clearInactivityTimer();
    inactivityTimerRef.current = setTimeout(() => {
      console.info('[useAuth] Inactivity timeout — logging out.');
      logout(true);
    }, INACTIVITY_LIMIT);
  }, [logout]);

  // ── Register activity listeners once user is logged in ─────────────────────
  useEffect(() => {
    if (!user) return;

    isLoggedInRef.current = true;
    resetInactivityTimer(); // start the clock on login

    const handleActivity = () => resetInactivityTimer();
    ACTIVITY_EVENTS.forEach(ev =>
      window.addEventListener(ev, handleActivity, { passive: true })
    );

    return () => {
      ACTIVITY_EVENTS.forEach(ev =>
        window.removeEventListener(ev, handleActivity)
      );
      clearInactivityTimer();
    };
  }, [user, resetInactivityTimer]);

  // ── Rehydrate session on mount ─────────────────────────────────────────────
  useEffect(() => {
    const restored = loadSession();

    if (restored) {
      // Trust the cached session and render immediately
      setUser(restored);
      setLoading(false);

      // Then validate it is still alive in the background
      db.auth.getCurrentUser()
        .then(liveUser => {
          if (liveUser) {
            setUser(liveUser);
            saveSession(liveUser);
          } else {
            // Token expired server-side
            clearSession();
            setUser(null);
            router.push('/login');
          }
        })
        .catch(() => {
          // Network error — keep cached session alive, user stays logged in
        });
    } else {
      // No cache — do a fresh getCurrentUser call
      db.auth.getCurrentUser()
        .then(u => {
          if (u) {
            setUser(u);
            saveSession(u);
          } else {
            setUser(null);
          }
        })
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await db.auth.login({ email, password });
      const loggedInUser = result.user || null;
      setUser(loggedInUser);
      saveSession(loggedInUser);
      return result;
    } finally {
      setLoading(false);
    }
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const register = async (email: string, password: string, data?: any) => {
    setLoading(true);
    try {
      const result = await db.auth.register({ email, password, data });
      const registeredUser = result.user || null;
      setUser(registeredUser);
      saveSession(registeredUser);
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, login, register, logout };
}
