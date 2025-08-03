'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Building, 
  Mail, 
  Phone,
  Filter,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useEmployees } from '@/hooks/use-employees';
import { useDepartments } from '@/hooks/use-departments';
import { Employee } from '@/types/employee';
import DashboardLayout from '@/components/layout/dashboard-layout';

interface EmployeeFilters {
  search: string;
  department: string;
  status: string;
}

export default function EmployeesPage() {
  const { employees, loading, error, deleteEmployee } = useEmployees();
  const { departments } = useDepartments();
  
  const [filters, setFilters] = useState<EmployeeFilters>({
    search: '',
    department: '',
    status: 'all',
  });
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    employee: Employee | null;
    isDeleting: boolean;
    error: string | null;
  }>({
    open: false,
    employee: null,
    isDeleting: false,
    error: null,
  });

  // フィルタリングされた従業員リスト
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      // 検索フィルター
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        employee.firstName.toLowerCase().includes(searchLower) ||
        employee.lastName.toLowerCase().includes(searchLower) ||
        employee.email.toLowerCase().includes(searchLower) ||
        employee.position.toLowerCase().includes(searchLower) ||
        employee.employeeId.toLowerCase().includes(searchLower);

      // 部門フィルター
      const matchesDepartment = !filters.department || filters.department === 'all' || 
        employee.department === filters.department;

      // ステータスフィルター
      const matchesStatus = filters.status === 'all' ||
        (filters.status === 'active' && employee.isActive) ||
        (filters.status === 'inactive' && !employee.isActive);

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, filters]);

  // 統計情報
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.isActive).length;
    const inactive = total - active;
    const departments = [...new Set(employees.map(e => e.department))].length;

    return { total, active, inactive, departments };
  }, [employees]);

  const handleFilterChange = useCallback((key: keyof EmployeeFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleDeleteClick = useCallback((employee: Employee) => {
    setDeleteDialog({ open: true, employee, isDeleting: false, error: null });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDialog.employee) return;

    setDeleteDialog(prev => ({ ...prev, isDeleting: true, error: null }));
    
    try {
      await deleteEmployee(deleteDialog.employee.id);
      setDeleteDialog({ open: false, employee: null, isDeleting: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '削除に失敗しました';
      setDeleteDialog(prev => ({ ...prev, isDeleting: false, error: errorMessage }));
    }
  }, [deleteDialog.employee, deleteEmployee]);

  const getInitials = useCallback((firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">従業員データを読み込み中...</p>
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">従業員管理</h1>
              <p className="text-gray-600 mt-2">従業員の情報を管理・編集</p>
            </div>
            <Link href="/employees/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新規登録
              </Button>
            </Link>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総従業員数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">在職中</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">退職済み</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">部門数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.departments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* フィルター */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              フィルター・検索
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">検索</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="名前、メール、従業員ID等"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">部門</Label>
                <Select 
                  value={filters.department} 
                  onValueChange={(value) => handleFilterChange('department', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="すべての部門" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべての部門</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">ステータス</Label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="active">在職中</SelectItem>
                    <SelectItem value="inactive">退職済み</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 従業員リスト */}
        <Card>
          <CardHeader>
            <CardTitle>従業員一覧</CardTitle>
            <CardDescription>
              {filteredEmployees.length} 件中 {filteredEmployees.length} 件を表示
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">条件に一致する従業員が見つかりません</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={employee.profileImage} />
                        <AvatarFallback>
                          {getInitials(employee.firstName, employee.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </h3>
                          <Badge variant={employee.isActive ? "default" : "secondary"}>
                            {employee.isActive ? "在職中" : "退職済み"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{employee.position}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{employee.department}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{employee.email}</span>
                          </div>
                          {employee.phoneNumber && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{employee.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          従業員ID: {employee.employeeId} • 入社日: {employee.joinDate.toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/employees/${employee.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            詳細表示
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/employees/${employee.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            編集
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(employee)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 削除確認ダイアログ */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, employee: null, isDeleting: false, error: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>従業員の削除</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteDialog.employee && (
                  <>
                    {deleteDialog.employee.firstName} {deleteDialog.employee.lastName} さんを削除しますか？
                    <br />
                    この操作は取り消すことができません。
                  </>
                )}
              </AlertDialogDescription>
              {deleteDialog.error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{deleteDialog.error}</AlertDescription>
                </Alert>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteDialog.isDeleting}>キャンセル</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm} 
                disabled={deleteDialog.isDeleting}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {deleteDialog.isDeleting ? '削除中...' : '削除'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}