'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Mail, Phone, Building, Edit3, Save, X } from 'lucide-react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useAuth } from '@/contexts/auth-context';

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading, error, updateProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    phoneNumber: '',
    bio: '',
  });

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

  React.useEffect(() => {
    if (profile) {
      setEditData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        department: profile.department || '',
        phoneNumber: profile.phoneNumber || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleEdit = () => {
    setIsEditing(true);
    setUpdateError('');
    setUpdateSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setEditData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        department: profile.department || '',
        phoneNumber: profile.phoneNumber || '',
        bio: profile.bio || '',
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      setUpdateError('');
      setUpdateSuccess('');

      await updateProfile(editData);
      
      setUpdateSuccess('プロフィールが正常に更新されました');
      setIsEditing(false);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'プロフィールの更新に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (field: keyof typeof editData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>プロフィールを読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>
            プロフィールが見つかりません。サポートにお問い合わせください。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">プロフィール</h1>
          <p className="text-gray-600 mt-2">アカウント情報と個人設定を管理</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile.profileImage} />
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {profile.firstName} {profile.lastName}
                  </CardTitle>
                  <CardDescription>
                    {profile.role === 'admin' && 'システム管理者'}
                    {profile.role === 'hr' && 'HR担当'}
                    {profile.role === 'manager' && 'マネージャー'}
                    {profile.role === 'employee' && '従業員'}
                    {profile.department && ` • ${profile.department}`}
                  </CardDescription>
                </div>
              </div>
              
              {!isEditing && (
                <Button onClick={handleEdit} variant="outline">
                  <Edit3 className="h-4 w-4 mr-2" />
                  編集
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {updateError && (
              <Alert variant="destructive">
                <AlertDescription>{updateError}</AlertDescription>
              </Alert>
            )}
            
            {updateSuccess && (
              <Alert>
                <AlertDescription className="text-green-700">{updateSuccess}</AlertDescription>
              </Alert>
            )}

            {/* 基本情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">基本情報</h3>
              
              {/* メールアドレス（読み取り専用） */}
              <div className="space-y-2">
                <Label>メールアドレス</Label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{user?.email}</span>
                  <span className="text-xs text-gray-500">(変更不可)</span>
                </div>
              </div>

              {/* 名前 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">名前</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={editData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={isUpdating}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">{profile.firstName}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">苗字</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={editData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={isUpdating}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">{profile.lastName}</div>
                  )}
                </div>
              </div>

              {/* 部門 */}
              <div className="space-y-2">
                <Label htmlFor="department">部門</Label>
                {isEditing ? (
                  <Select 
                    value={editData.department} 
                    onValueChange={(value) => handleInputChange('department', value)}
                    disabled={isUpdating}
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
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{profile.department || '未設定'}</span>
                  </div>
                )}
              </div>

              {/* 電話番号 */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">電話番号</Label>
                {isEditing ? (
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phoneNumber"
                      value={editData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="pl-10"
                      placeholder="090-1234-5678"
                      disabled={isUpdating}
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{profile.phoneNumber || '未設定'}</span>
                  </div>
                )}
              </div>

              {/* 自己紹介 */}
              <div className="space-y-2">
                <Label htmlFor="bio">自己紹介</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={editData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="自己紹介や経歴を入力してください"
                    rows={4}
                    disabled={isUpdating}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md min-h-[100px]">
                    {profile.bio || '自己紹介が設定されていません'}
                  </div>
                )}
              </div>
            </div>

            {/* アカウント情報 */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-medium">アカウント情報</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-500">従業員ID</Label>
                  <p className="font-mono">{profile.employeeId || '未設定'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">役職</Label>
                  <p>
                    {profile.role === 'admin' && 'システム管理者'}
                    {profile.role === 'hr' && 'HR担当'}
                    {profile.role === 'manager' && 'マネージャー'}
                    {profile.role === 'employee' && '従業員'}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">登録日</Label>
                  <p>{profile.createdAt.toLocaleDateString('ja-JP')}</p>
                </div>
                <div>
                  <Label className="text-gray-500">最終更新</Label>
                  <p>{profile.updatedAt.toLocaleDateString('ja-JP')}</p>
                </div>
              </div>
            </div>

            {/* 編集モードのアクションボタン */}
            {isEditing && (
              <div className="flex space-x-2 pt-6 border-t">
                <Button 
                  onClick={handleSave} 
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      保存
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  <X className="mr-2 h-4 w-4" />
                  キャンセル
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}