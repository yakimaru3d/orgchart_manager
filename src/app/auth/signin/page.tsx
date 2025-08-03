'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function SignInPage() {
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  // URL パラメータから成功メッセージを取得
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    
    if (message === 'signup-success') {
      setSuccessMessage('アカウントが正常に作成されました。ログインしてください。');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { user, error } = await signIn(email, password);
      
      if (error) {
        setError(error.message || 'サインインに失敗しました');
        return;
      }

      if (user) {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'サインインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">サインイン</CardTitle>
          <CardDescription className="text-center">
            組織図管理システムにアクセス
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {successMessage && (
              <Alert>
                <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  サインイン中...
                </>
              ) : (
                'サインイン'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <div className="border rounded p-3 bg-gray-50 text-left">
              <p className="font-semibold mb-2 text-sm">デモアカウント:</p>
              <div className="space-y-2 text-xs text-gray-600">
                <div>
                  <p className="font-medium">システム管理者:</p>
                  <p>Email: admin@company.com</p>
                  <p>Password: password</p>
                </div>
                <div>
                  <p className="font-medium">HR管理者:</p>
                  <p>Email: hr@company.com</p>
                  <p>Password: password</p>
                </div>
                <div>
                  <p className="font-medium">部門マネージャー:</p>
                  <p>Email: manager@company.com</p>
                  <p>Password: password</p>
                </div>
                <div>
                  <p className="font-medium">一般ユーザー:</p>
                  <p>Email: employee@company.com</p>
                  <p>Password: password</p>
                </div>
                <p className="text-gray-500 mt-2">
                  ※まず上記のSQLスクリプトでユーザーを作成してください
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでない方は{' '}
              <Link 
                href="/auth/signup" 
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                新規登録
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}