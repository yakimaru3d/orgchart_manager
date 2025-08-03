'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft,
  Edit,
  Mail, 
  Phone, 
  Building, 
  Calendar,
  IdCard,
  Briefcase,
  Users,
  DollarSign,
  Clock,
  Award,
  MessageSquare
} from 'lucide-react';
import { useEmployees } from '@/hooks/use-employees';
import { Employee } from '@/types/employee';
import DashboardLayout from '@/components/layout/dashboard-layout';

export default function EmployeeDetailPage() {
  const params = useParams();
  const employeeId = params.id as string;
  const { getEmployeeById, employees } = useEmployees();
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [manager, setManager] = useState<Employee | null>(null);
  const [directReports, setDirectReports] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEmployeeData = async () => {
      try {
        setIsLoading(true);
        const emp = await getEmployeeById(employeeId);
        
        if (!emp) {
          setError('従業員が見つかりません');
          return;
        }

        setEmployee(emp);

        // 上司情報を取得
        if (emp.managerId) {
          const managerData = employees.find(e => e.id === emp.managerId);
          setManager(managerData || null);
        }

        // 部下情報を取得
        const reports = employees.filter(e => e.managerId === emp.id && e.isActive);
        setDirectReports(reports);

      } catch (err: any) {
        setError(err.message || '従業員データの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    if (employeeId && employees.length > 0) {
      loadEmployeeData();
    }
  }, [employeeId, employees, getEmployeeById]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getEmploymentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'full-time': '正社員',
      'part-time': 'パートタイム',
      'contract': '契約社員',
      'intern': 'インターン',
      'freelance': 'フリーランス',
    };
    return types[type] || type;
  };

  const formatSalary = (salary?: number) => {
    if (!salary) return '非公開';
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(salary);
  };

  const calculateTenure = (joinDate: Date) => {
    const now = new Date();
    const years = now.getFullYear() - joinDate.getFullYear();
    const months = now.getMonth() - joinDate.getMonth();
    const totalMonths = years * 12 + months;
    
    if (totalMonths < 12) {
      return `${totalMonths}ヶ月`;
    } else {
      const wholeYears = Math.floor(totalMonths / 12);
      const remainingMonths = totalMonths % 12;
      if (remainingMonths === 0) {
        return `${wholeYears}年`;
      } else {
        return `${wholeYears}年${remainingMonths}ヶ月`;
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">従業員データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error || '従業員が見つかりません'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/employees">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  従業員一覧に戻る
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">従業員詳細</h1>
            </div>
            <Link href={`/employees/${employee.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                編集
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メイン情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* プロフィール概要 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={employee.profileImage} />
                    <AvatarFallback className="text-xl">
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </h2>
                      <Badge variant={employee.isActive ? "default" : "secondary"}>
                        {employee.isActive ? "在職中" : "退職済み"}
                      </Badge>
                    </div>
                    
                    <p className="text-lg text-gray-600 mb-4">{employee.position}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{employee.department}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <IdCard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">ID: {employee.employeeId}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a 
                          href={`mailto:${employee.email}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {employee.email}
                        </a>
                      </div>
                      
                      {employee.phoneNumber && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a 
                            href={`tel:${employee.phoneNumber}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {employee.phoneNumber}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 職務詳細 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  職務詳細
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">雇用形態</p>
                    <p className="text-sm text-gray-900">{getEmploymentTypeLabel(employee.employmentType)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">入社日</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">
                        {employee.joinDate.toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">勤続年数</p>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">
                        {calculateTenure(employee.joinDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {employee.salary && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">給与</p>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">{formatSalary(employee.salary)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 自己紹介 */}
            {employee.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    自己紹介
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{employee.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* スキル */}
            {employee.skills && employee.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    スキル
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {employee.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 組織関係 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  組織関係
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 上司 */}
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">上司</p>
                  {manager ? (
                    <Link href={`/employees/${manager.id}`}>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={manager.profileImage} />
                          <AvatarFallback>
                            {getInitials(manager.firstName, manager.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {manager.firstName} {manager.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{manager.position}</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <p className="text-sm text-gray-500">上司なし</p>
                  )}
                </div>

                {/* 部下 */}
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    部下 ({directReports.length}人)
                  </p>
                  {directReports.length > 0 ? (
                    <div className="space-y-2">
                      {directReports.map((report) => (
                        <Link key={report.id} href={`/employees/${report.id}`}>
                          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={report.profileImage} />
                              <AvatarFallback className="text-xs">
                                {getInitials(report.firstName, report.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {report.firstName} {report.lastName}
                              </p>
                              <p className="text-xs text-gray-600">{report.position}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">部下なし</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* クイックアクション */}
            <Card>
              <CardHeader>
                <CardTitle>クイックアクション</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/employees/${employee.id}/edit`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    情報を編集
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  メールを送信
                </Button>
                
                {employee.phoneNumber && (
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    電話をかける
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}