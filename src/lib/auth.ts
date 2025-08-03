import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  tenantId: string;
}

export class AuthService {
  // ユーザーのサインアップ
  static async signUp(email: string, password: string): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  // ユーザーのサインイン
  static async signIn(email: string, password: string): Promise<{ user: User | null; error: any }> {
    try {
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        throw error;
      }
      
      return { user: data.user, error: null };
    } catch (error) {
      console.error('❌ Sign in exception:', error);
      return { user: null, error };
    }
  }

  // サインアウト
  static async signOut(): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  }

  // 現在のユーザーを取得
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // 認証状態の監視
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }

  // ユーザーのテナントIDを取得（MVPでは固定値を使用）
  static getTenantId(user: User | null): string {
    // MVPでは実際にデータベースに登録されているテナントIDを使用
    // 本格実装ではユーザーメタデータやテナント管理テーブルから取得
    return 'a1b2c3d4-e5f6-4789-9012-123456789abc';
  }
}