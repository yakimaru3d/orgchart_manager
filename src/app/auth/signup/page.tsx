'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mail, Lock, User, Building, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { UserProfileService } from '@/lib/services/user-profile-service';

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
}

export default function SignUpPage() {
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: '',
    department: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signUp, tenantId } = useAuth();
  const router = useRouter();

  const departments = [
    'Engineering',
    'Product',
    'Design',
    'Marketing',
    'Sales',
    'HR',
    'Finance',
    'Operations',
    'Legal',
    'Customer Success'
  ];

  const roles = [
    'employee',
    'manager',
    'hr',
    'admin'
  ];

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      return '必須項目をすべて入力してください';
    }

    if (formData.password.length < 6) {
      return 'パスワードは6文字以上で入力してください';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'パスワードが一致しません';
    }

    if (!formData.email.includes('@')) {
      return '有効なメールアドレスを入力してください';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // バリデーション
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const { user, error } = await signUp(formData.email, formData.password);
      
      if (error) {
        setError(error.message || 'サインアップに失敗しました');
        return;
      }

      if (user) {
        setSuccess('アカウントが作成されました。プロフィールを設定しています...');
        
        try {
          // ユーザーの追加情報（名前、役職、部門）をprofileテーブルに保存
          await UserProfileService.createProfileForNewUser(
            user,
            {
              firstName: formData.firstName,
              lastName: formData.lastName,
              role: formData.role as 'employee' | 'manager' | 'hr' | 'admin',
              department: formData.department,
            },
            tenantId
          );

          setSuccess('アカウントとプロフィールが正常に作成されました！');
          
          // サインアップ成功後、少し待ってからサインインページにリダイレクト
          setTimeout(() => {
            router.push('/auth/signin?message=signup-success');
          }, 2000);
        } catch (profileError: any) {
          console.error('❌ Profile creation error:', profileError);
          
          // プロフィール作成エラーの詳細を表示
          if (profileError.message) {
            setError(`プロフィール作成エラー: ${profileError.message}`);
          } else {
            setError('アカウントは作成されましたが、プロフィールの設定でエラーが発生しました。後でプロフィールページで更新できます。');
          }
          
          // エラーの場合はすぐにサインインページにリダイレクトしない
          // ユーザーがエラーメッセージを読めるようにする
        }
      }
    } catch (err: any) {
      setError(err.message || 'サインアップに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-center">アカウント作成</CardTitle>
          <CardDescription className="text-center">
            組織図管理システムのアカウントを作成
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert>
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            {/* 名前 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">名前</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="太郎"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">苗字</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="山田"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
            
            {/* メールアドレス */}
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* パスワード */}
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="6文字以上"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
            </div>

            {/* パスワード確認 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワード確認</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="パスワードを再入力"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 部門選択 */}
            <div className="space-y-2">
              <Label htmlFor="department">部門</Label>
              <Select 
                value={formData.department} 
                onValueChange={(value) => handleInputChange('department', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="部門を選択" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 役職選択 */}
            <div className="space-y-2">
              <Label htmlFor="role">役職</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => handleInputChange('role', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="役職を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">一般従業員</SelectItem>
                  <SelectItem value="manager">マネージャー</SelectItem>
                  <SelectItem value="hr">HR担当</SelectItem>
                  <SelectItem value="admin">システム管理者</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  アカウント作成中...
                </>
              ) : (
                'アカウント作成'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              既にアカウントをお持ちですか？{' '}
              <Link 
                href="/auth/signin" 
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                サインイン
              </Link>
            </p>
          </div>

          {/* 利用規約とプライバシーポリシー */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              アカウント作成により、
              <a href="#" className="text-blue-600 hover:underline">利用規約</a>
              および
              <a href="#" className="text-blue-600 hover:underline">プライバシーポリシー</a>
              に同意したものとみなされます。
            </p>
          </div>

          {/* 開発者向け情報 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 border rounded p-3 bg-blue-50 text-left">
              <p className="font-semibold mb-2 text-sm text-blue-900">開発者向け情報:</p>
              <div className="space-y-1 text-xs text-blue-700">
                <p>• メール確認は開発環境では無効化されています</p>
                <p>• 作成されたアカウントは即座に利用可能です</p>
                <p>• パスワードは6文字以上で設定してください</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}