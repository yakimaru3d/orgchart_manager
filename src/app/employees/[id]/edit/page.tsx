'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft,
  Loader2, 
  Mail, 
  Phone, 
  User, 
  Building, 
  Calendar,
  IdCard,
  Briefcase,
  Users,
  Save
} from 'lucide-react';
import { useEmployees } from '@/hooks/use-employees';
import { useDepartments } from '@/hooks/use-departments';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { UpdateEmployeeData } from '@/lib/services/employee-service';

interface EmployeeFormData {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
  department: string;
  managerId: string;
  joinDate: string;
  salary: string;
  employmentType: string;
  profileImage: string;
  bio: string;
  skills: string[];
  isActive: boolean;
}

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  
  const { employees, updateEmployee, getEmployeeById } = useEmployees();
  const { departments } = useDepartments();
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    position: '',
    department: '',
    managerId: '',
    joinDate: '',
    salary: '',
    employmentType: 'full-time',
    profileImage: '',
    bio: '',
    skills: [],
    isActive: true,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(true);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [employee, setEmployee] = useState<any>(null);

  // 可能な上司リスト（現在の従業員以外から選択）
  const potentialManagers = employees.filter(emp => emp.isActive && emp.id !== employeeId);

  const employmentTypes = [
    { value: 'full-time', label: '正社員' },
    { value: 'part-time', label: 'パートタイム' },
    { value: 'contract', label: '契約社員' },
    { value: 'intern', label: 'インターン' },
    { value: 'freelance', label: 'フリーランス' },
  ];

  // 従業員データの読み込み
  useEffect(() => {
    const loadEmployee = async () => {
      try {
        setIsLoadingEmployee(true);
        const emp = await getEmployeeById(employeeId);
        
        if (!emp) {
          setError('従業員が見つかりません');
          return;
        }

        setEmployee(emp);
        setFormData({
          employeeId: emp.employeeId,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phoneNumber: emp.phoneNumber || '',
          position: emp.position,
          department: emp.department,
          managerId: emp.managerId || '',
          joinDate: emp.joinDate.toISOString().split('T')[0],
          salary: emp.salary?.toString() || '',
          employmentType: emp.employmentType,
          profileImage: emp.profileImage || '',
          bio: emp.bio || '',
          skills: emp.skills || [],
          isActive: emp.isActive,
        });
      } catch (err: any) {
        setError(err.message || '従業員データの読み込みに失敗しました');
      } finally {
        setIsLoadingEmployee(false);
      }
    };

    if (employeeId && employees.length > 0) {
      loadEmployee();
    }
  }, [employeeId, employees, getEmployeeById]);

  const handleInputChange = (field: keyof EmployeeFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return '名前は必須です';
    if (!formData.lastName.trim()) return '苗字は必須です';
    if (!formData.email.trim()) return 'メールアドレスは必須です';
    if (!formData.email.includes('@')) return '有効なメールアドレスを入力してください';
    if (!formData.position.trim()) return '職位は必須です';
    if (!formData.department) return '部門を選択してください';
    if (!formData.joinDate) return '入社日は必須です';
    if (!formData.employmentType) return '雇用形態を選択してください';
    
    // 従業員IDの重複チェック（自分以外の従業員との重複をチェック）
    if (formData.employeeId && employees.some(emp => emp.employeeId === formData.employeeId && emp.id !== employeeId)) {
      return '従業員IDが既に使用されています';
    }
    
    // メールアドレスの重複チェック（自分以外の従業員との重複をチェック）
    if (employees.some(emp => emp.email === formData.email && emp.id !== employeeId)) {
      return 'このメールアドレスは既に登録されています';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const updateData: UpdateEmployeeData = {
        employeeId: formData.employeeId || undefined,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        position: formData.position.trim(),
        department: formData.department,
        managerId: formData.managerId && formData.managerId !== 'none' ? formData.managerId : undefined,
        joinDate: new Date(formData.joinDate),
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        employmentType: formData.employmentType as UpdateEmployeeData['employmentType'],
        profileImage: formData.profileImage.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        skills: formData.skills.length > 0 ? formData.skills : undefined,
        isActive: formData.isActive,
      };

      await updateEmployee(employeeId, updateData);
      router.push('/employees');
    } catch (err: any) {
      setError(err.message || '従業員の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingEmployee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">従業員データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>従業員が見つかりません</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/employees">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                従業員一覧に戻る
              </Button>
            </Link>
            <Link href={`/employees/${employeeId}`}>
              <Button variant="outline" size="sm">
                詳細表示
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">従業員編集</h1>
          <p className="text-gray-600 mt-2">
            {employee.firstName} {employee.lastName} の情報を編集
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                基本情報
              </CardTitle>
              <CardDescription>
                従業員の基本的な個人情報を編集してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">従業員ID</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">名前 *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">苗字 *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">電話番号</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 職務情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                職務情報
              </CardTitle>
              <CardDescription>
                職位、部門、上司などの職務に関する情報を編集してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">職位 *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">部門 *</Label>
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
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="managerId">上司</Label>
                  <Select 
                    value={formData.managerId} 
                    onValueChange={(value) => handleInputChange('managerId', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-gray-400" />
                        <SelectValue placeholder="上司を選択（任意）" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">上司なし</SelectItem>
                      {potentialManagers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.firstName} {manager.lastName} ({manager.position})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employmentType">雇用形態 *</Label>
                  <Select 
                    value={formData.employmentType} 
                    onValueChange={(value) => handleInputChange('employmentType', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="雇用形態を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="joinDate">入社日 *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => handleInputChange('joinDate', e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salary">給与（任意）</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 追加情報 */}
          <Card>
            <CardHeader>
              <CardTitle>追加情報</CardTitle>
              <CardDescription>
                プロフィール画像、自己紹介、スキルなどの追加情報
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profileImage">プロフィール画像URL</Label>
                <Input
                  id="profileImage"
                  type="url"
                  value={formData.profileImage}
                  onChange={(e) => handleInputChange('profileImage', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">自己紹介</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">スキル</Label>
                <div className="flex space-x-2">
                  <Input
                    id="skills"
                    placeholder="スキルを入力してEnterキーを押す"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                  <Button 
                    type="button" 
                    onClick={addSkill}
                    disabled={!skillInput.trim() || isLoading}
                    variant="outline"
                  >
                    追加
                  </Button>
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                          disabled={isLoading}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', !!checked)}
                  disabled={isLoading}
                />
                <Label htmlFor="isActive">アクティブ（在職中）</Label>
              </div>
            </CardContent>
          </Card>

          {/* アクションボタン */}
          <div className="flex justify-end space-x-4">
            <Link href="/employees">
              <Button variant="outline" disabled={isLoading}>
                キャンセル
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  更新中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  変更を保存
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}