'use client';
import { useState, useEffect } from "react";
import { db } from "@/lib/cocobase";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from Cocobase local storage token
    db.auth.getCurrentUser()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await db.auth.login({ email, password });
      setUser(result.user || null);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, data?: any) => {
    setLoading(true);
    try {
      const result = await db.auth.register({ email, password, data });
      setUser(result.user || null);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    db.auth.logout();
    setUser(null);
  };

  return { user, loading, login, register, logout };
}
