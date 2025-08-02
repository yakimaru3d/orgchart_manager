'use client';

import { VersionComparison, EmployeeChange, DepartmentChange, ChangeImpact } from '@/types/version';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  Users, 
  Building, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit
} from 'lucide-react';

interface VersionComparisonProps {
  comparison: VersionComparison;
  onClose: () => void;
}

export default function VersionComparison({ comparison, onClose }: VersionComparisonProps) {
  const { fromVersion, toVersion, changes } = comparison;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'ADDED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REMOVED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'MODIFIED':
      case 'MOVED':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'RESTRUCTURED':
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      default:
        return <Edit className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'ADDED':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'REMOVED':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'MODIFIED':
      case 'MOVED':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'RESTRUCTURED':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getImpactBadgeVariant = (level: ChangeImpact['level']) => {
    switch (level) {
      case 'LOW': return 'secondary';
      case 'MEDIUM': return 'default';
      case 'HIGH': return 'destructive';
      case 'CRITICAL': return 'destructive';
      default: return 'secondary';
    }
  };

  const getImpactText = (level: ChangeImpact['level']) => {
    switch (level) {
      case 'LOW': return '低';
      case 'MEDIUM': return '中';
      case 'HIGH': return '高';
      case 'CRITICAL': return '重大';
      default: return '不明';
    }
  };

  const renderEmployeeChange = (change: EmployeeChange) => (
    <Card key={change.employeeId} className={`border ${getChangeColor(change.type)}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {getChangeIcon(change.type)}
            <div className="space-y-1">
              <div className="font-medium">
                {change.employee.firstName} {change.employee.lastName}
              </div>
              <div className="text-sm text-gray-600">
                {change.employee.position} - {change.employee.department}
              </div>
              
              {change.changedFields && change.changedFields.length > 0 && (
                <div className="space-y-1">
                  {change.changedFields.map((field, index) => (
                    <div key={index} className="text-xs text-gray-500 flex items-center space-x-2">
                      <span className="font-medium">{field.fieldName}:</span>
                      {field.oldValue && (
                        <>
                          <span className="line-through">{String(field.oldValue)}</span>
                          <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                      <span className="font-medium">{String(field.newValue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <Badge variant="outline">
              {change.type === 'ADDED' ? '追加' :
               change.type === 'REMOVED' ? '削除' :
               change.type === 'MODIFIED' ? '変更' :
               change.type === 'MOVED' ? '異動' : change.type}
            </Badge>
            <Badge variant={getImpactBadgeVariant(change.impact.level)}>
              影響度: {getImpactText(change.impact.level)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDepartmentChange = (change: DepartmentChange) => (
    <Card key={change.departmentId} className={`border ${getChangeColor(change.type)}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {getChangeIcon(change.type)}
            <div className="space-y-1">
              <div className="font-medium">{change.department.name}</div>
              <div className="text-sm text-gray-600">
                レベル {change.department.level}
                {change.department.managerId && ` - 管理者: ${change.department.managerId}`}
              </div>
              
              {change.changedFields && change.changedFields.length > 0 && (
                <div className="space-y-1">
                  {change.changedFields.map((field, index) => (
                    <div key={index} className="text-xs text-gray-500 flex items-center space-x-2">
                      <span className="font-medium">{field.fieldName}:</span>
                      {field.oldValue && (
                        <>
                          <span className="line-through">{String(field.oldValue)}</span>
                          <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                      <span className="font-medium">{String(field.newValue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <Badge variant="outline">
              {change.type === 'ADDED' ? '作成' :
               change.type === 'REMOVED' ? '削除' :
               change.type === 'MODIFIED' ? '変更' :
               change.type === 'RESTRUCTURED' ? '再編' : change.type}
            </Badge>
            <Badge variant={getImpactBadgeVariant(change.impact.level)}>
              影響度: {getImpactText(change.impact.level)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>バージョン比較</span>
              </CardTitle>
              <CardDescription>
                2つのバージョン間の変更内容を比較します
              </CardDescription>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From Version */}
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-medium text-red-900">変更前</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{fromVersion.name}</div>
                    <div className="text-gray-600">{formatDate(fromVersion.createdAt)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* To Version */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-900">変更後</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{toVersion.name}</div>
                    <div className="text-gray-600">{formatDate(toVersion.createdAt)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* サマリー */}
      <Card>
        <CardHeader>
          <CardTitle>変更サマリー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {changes.summary.totalChanges}
              </div>
              <div className="text-sm text-gray-600">総変更数</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {changes.summary.employeeChanges.added + 
                 changes.summary.employeeChanges.removed + 
                 changes.summary.employeeChanges.modified + 
                 changes.summary.employeeChanges.moved}
              </div>
              <div className="text-sm text-gray-600">従業員変更</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {changes.summary.departmentChanges.added + 
                 changes.summary.departmentChanges.removed + 
                 changes.summary.departmentChanges.modified + 
                 changes.summary.departmentChanges.restructured}
              </div>
              <div className="text-sm text-gray-600">部署変更</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <AlertTriangle className={`h-5 w-5 ${
                  changes.summary.overallImpact.level === 'HIGH' || changes.summary.overallImpact.level === 'CRITICAL' 
                    ? 'text-red-500' 
                    : changes.summary.overallImpact.level === 'MEDIUM'
                    ? 'text-yellow-500'
                    : 'text-green-500'
                }`} />
                <span className="text-sm font-medium">
                  {getImpactText(changes.summary.overallImpact.level)}
                </span>
              </div>
              <div className="text-sm text-gray-600">全体影響度</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 詳細変更 */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>従業員変更 ({changes.employeeChanges.length})</span>
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>部署変更 ({changes.departmentChanges.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          {changes.employeeChanges.length > 0 ? (
            <div className="space-y-3">
              {changes.employeeChanges.map(renderEmployeeChange)}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">従業員の変更はありません</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          {changes.departmentChanges.length > 0 ? (
            <div className="space-y-3">
              {changes.departmentChanges.map(renderDepartmentChange)}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">部署の変更はありません</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}