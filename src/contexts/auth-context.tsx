'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { AuthService } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<{ error: any }>;
  tenantId: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初期認証状態を取得
    AuthService.getCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    });

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = AuthService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await AuthService.signIn(email, password);
    if (result.user) {
      setUser(result.user);
    }
    return result;
  };

  const signUp = async (email: string, password: string) => {
    const result = await AuthService.signUp(email, password);
    if (result.user) {
      setUser(result.user);
    }
    return result;
  };

  const signOut = async () => {
    const result = await AuthService.signOut();
    if (!result.error) {
      setUser(null);
    }
    return result;
  };

  const tenantId = AuthService.getTenantId(user);

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    tenantId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}