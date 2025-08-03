'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { UserProfileService } from '@/lib/services/user-profile-service';

interface DebugInfo {
  auth?: {
    user: {
      id: string;
      email: string;
      created_at: string;
    } | null;
    tenantId: string;
  };
  supabase?: {
    connection: 'success' | 'error';
    error?: string;
    tenants: number;
  };
  profile?: {
    exists: boolean;
    data?: {
      id: string;
      firstName: string;
      lastName: string;
      role: string;
      department: string;
    } | null;
    error?: string;
  };
  directQuery?: {
    success: boolean;
    error?: string;
    data?: {
      id: string;
      first_name: string;
      last_name: string;
    } | null;
  };
  rls?: {
    canRead: boolean;
    error?: string;
  };
  createError?: string;
  error?: string;
}

export default function DebugPage() {
  const { user, tenantId } = useAuth();
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const info: DebugInfo = {};

    try {
      // 1. 認証情報チェック
      info.auth = {
        user: user ? {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        } : null,
        tenantId,
      };

      // 2. Supabase接続チェック
      const { data: tenants, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .limit(5);
      
      info.supabase = {
        connection: tenantError ? 'error' : 'success',
        error: tenantError?.message,
        tenants: tenants?.length || 0,
      };

      // 3. ユーザープロファイルチェック
      if (user) {
        try {
          const profile = await UserProfileService.getCurrentUserProfile();
          info.profile = {
            exists: !!profile,
            data: profile ? {
              id: profile.id,
              firstName: profile.firstName,
              lastName: profile.lastName,
              role: profile.role,
              department: profile.department,
            } : null,
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          info.profile = {
            exists: false,
            error: errorMessage,
          };
        }

        // 4. 直接クエリテスト
        try {
          const { data: directProfile, error: directError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          info.directQuery = {
            success: !directError,
            error: directError?.message,
            data: directProfile ? {
              id: directProfile.id,
              first_name: directProfile.first_name,
              last_name: directProfile.last_name,
            } : null,
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          info.directQuery = {
            success: false,
            error: errorMessage,
          };
        }
      }

      // 5. RLS ポリシーチェック
      try {
        const { data: allProfiles, error: rlsError } = await supabase
          .from('user_profiles')
          .select('count(*)')
          .limit(1);

        info.rls = {
          canRead: !rlsError,
          error: rlsError?.message,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        info.rls = {
          canRead: false,
          error: errorMessage,
        };
      }

      setDebugInfo(info);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDebugInfo({
        error: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const profile = await UserProfileService.createUserProfile({
        userId: user.id,
        tenantId,
        firstName: 'Test',
        lastName: 'User',
        role: 'employee',
        department: 'Engineering',
        employeeId: `TEST${Date.now().toString().slice(-6)}`,
      });

      await runDiagnostics();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDebugInfo(prev => ({
        ...prev,
        createError: errorMessage,
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      runDiagnostics();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertDescription>
            デバッグページを使用するにはログインが必要です。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">デバッグ情報</h1>
          <p className="text-gray-600 mt-2">システムの状態とプロファイル情報を確認</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>システム診断</CardTitle>
              <CardDescription>現在のシステム状態を確認</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={runDiagnostics} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? '診断中...' : '診断を実行'}
                </Button>

                <Button 
                  onClick={createTestProfile} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  テストプロファイルを作成
                </Button>
              </div>
            </CardContent>
          </Card>

          {Object.keys(debugInfo).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>診断結果</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>よくある問題と解決方法</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold">プロファイルが見つからない</h4>
                  <p className="text-gray-600">
                    1. マイグレーション `003_fix_user_profiles_rls.sql` を実行<br/>
                    2. 「テストプロファイルを作成」ボタンをクリック
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">RLS (Row Level Security) エラー</h4>
                  <p className="text-gray-600">
                    Supabaseでユーザーの認証状態とRLSポリシーを確認してください
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Supabase接続エラー</h4>
                  <p className="text-gray-600">
                    .env.localファイルのSupabase URLとキーを確認してください
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}