'use client';

import { useState } from 'react';
import { OrgSimulation, OrgChangeAction, OrgChangeType } from '@/types/simulation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Play, 
  Save, 
  Calendar,
  Target,
  Users,
  Building,
  TrendingUp,
  AlertTriangle,
  Clock,
  Edit
} from 'lucide-react';

interface SimulationBuilderProps {
  simulation?: OrgSimulation;
  onSave: (simulation: OrgSimulation) => void;
  onExecute: (simulation: OrgSimulation) => void;
  employees: any[];
  departments: any[];
}

export default function SimulationBuilder({
  simulation,
  onSave,
  onExecute,
  employees,
  departments
}: SimulationBuilderProps) {
  const [name, setName] = useState(simulation?.metadata.name || '');
  const [description, setDescription] = useState(simulation?.metadata.description || '');
  const [targetDate, setTargetDate] = useState(
    simulation?.metadata.targetDate.toISOString().split('T')[0] || 
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [actions, setActions] = useState<OrgChangeAction[]>(simulation?.actions || []);
  const [editingAction, setEditingAction] = useState<OrgChangeAction | null>(null);

  // 新しいアクションの作成
  const [newActionType, setNewActionType] = useState<OrgChangeType>('HIRE_EMPLOYEE');
  const [newActionTarget, setNewActionTarget] = useState('');
  const [newActionDate, setNewActionDate] = useState(new Date().toISOString().split('T')[0]);
  const [newActionParams, setNewActionParams] = useState<Record<string, any>>({});

  const actionTypes: { value: OrgChangeType; label: string; category: string }[] = [
    // 従業員関連
    { value: 'HIRE_EMPLOYEE', label: '従業員採用', category: '従業員' },
    { value: 'TERMINATE_EMPLOYEE', label: '従業員退職', category: '従業員' },
    { value: 'PROMOTE_EMPLOYEE', label: '従業員昇進', category: '従業員' },
    { value: 'DEMOTE_EMPLOYEE', label: '従業員降格', category: '従業員' },
    { value: 'TRANSFER_EMPLOYEE', label: '従業員異動', category: '従業員' },
    { value: 'CHANGE_POSITION', label: '職位変更', category: '従業員' },
    { value: 'CHANGE_DEPARTMENT', label: '部署変更', category: '従業員' },
    { value: 'CHANGE_MANAGER', label: '管理者変更', category: '従業員' },
    
    // 部署関連
    { value: 'CREATE_DEPARTMENT', label: '部署作成', category: '部署' },
    { value: 'DISSOLVE_DEPARTMENT', label: '部署解散', category: '部署' },
    { value: 'MERGE_DEPARTMENTS', label: '部署統合', category: '部署' },
    { value: 'SPLIT_DEPARTMENT', label: '部署分割', category: '部署' },
    { value: 'RESTRUCTURE_DEPARTMENT', label: '部署再編', category: '部署' },
    { value: 'CHANGE_DEPARTMENT_MANAGER', label: '部署管理者変更', category: '部署' },
    
    // 複合変更
    { value: 'REORGANIZATION', label: '組織再編', category: '複合' },
    { value: 'MASS_TRANSFER', label: '大規模異動', category: '複合' },
    { value: 'TEAM_CREATION', label: 'チーム作成', category: '複合' }
  ];

  const getActionIcon = (type: OrgChangeType) => {
    if (type.includes('EMPLOYEE')) return <Users className="h-4 w-4" />;
    if (type.includes('DEPARTMENT')) return <Building className="h-4 w-4" />;
    return <TrendingUp className="h-4 w-4" />;
  };

  const getActionColor = (type: OrgChangeType) => {
    if (type.includes('HIRE') || type.includes('CREATE') || type.includes('PROMOTE')) {
      return 'text-green-700 bg-green-50 border-green-200';
    }
    if (type.includes('TERMINATE') || type.includes('DISSOLVE') || type.includes('DEMOTE')) {
      return 'text-red-700 bg-red-50 border-red-200';
    }
    if (type.includes('TRANSFER') || type.includes('CHANGE') || type.includes('MERGE')) {
      return 'text-blue-700 bg-blue-50 border-blue-200';
    }
    return 'text-purple-700 bg-purple-50 border-purple-200';
  };

  const handleAddAction = () => {
    if (!newActionTarget && ['HIRE_EMPLOYEE', 'CREATE_DEPARTMENT'].includes(newActionType)) {
      // これらのアクションはターゲットIDが不要
    } else if (!newActionTarget) {
      return;
    }

    const newAction: OrgChangeAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: newActionType,
      targetId: newActionTarget,
      effectiveDate: new Date(newActionDate),
      parameters: { ...newActionParams },
      priority: actions.length + 1,
      rollbackable: true,
      description: `${actionTypes.find(t => t.value === newActionType)?.label} - ${new Date(newActionDate).toLocaleDateString('ja-JP')}`
    };

    setActions([...actions, newAction]);
    
    // リセット
    setNewActionTarget('');
    setNewActionParams({});
  };

  const handleDeleteAction = (actionId: string) => {
    setActions(actions.filter(action => action.id !== actionId));
  };

  const handleEditAction = (action: OrgChangeAction) => {
    setEditingAction(action);
  };

  const handleSaveAction = (updatedAction: OrgChangeAction) => {
    setActions(actions.map(action => 
      action.id === updatedAction.id ? updatedAction : action
    ));
    setEditingAction(null);
  };

  const handleSaveSimulation = () => {
    if (!simulation) return;

    const updatedSimulation: OrgSimulation = {
      ...simulation,
      metadata: {
        ...simulation.metadata,
        name,
        description,
        targetDate: new Date(targetDate),
        lastModified: new Date()
      },
      actions
    };

    onSave(updatedSimulation);
  };

  const handleExecuteSimulation = () => {
    if (!simulation) return;

    const updatedSimulation: OrgSimulation = {
      ...simulation,
      metadata: {
        ...simulation.metadata,
        name,
        description,
        targetDate: new Date(targetDate),
        lastModified: new Date(),
        status: 'ACTIVE'
      },
      actions
    };

    onExecute(updatedSimulation);
  };

  const renderActionParameters = (type: OrgChangeType) => {
    switch (type) {
      case 'HIRE_EMPLOYEE':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>名前</Label>
              <Input
                value={newActionParams.firstName || ''}
                onChange={(e) => setNewActionParams({...newActionParams, firstName: e.target.value})}
                placeholder="太郎"
              />
            </div>
            <div>
              <Label>苗字</Label>
              <Input
                value={newActionParams.lastName || ''}
                onChange={(e) => setNewActionParams({...newActionParams, lastName: e.target.value})}
                placeholder="田中"
              />
            </div>
            <div>
              <Label>メールアドレス</Label>
              <Input
                value={newActionParams.email || ''}
                onChange={(e) => setNewActionParams({...newActionParams, email: e.target.value})}
                placeholder="taro.tanaka@company.com"
              />
            </div>
            <div>
              <Label>部署</Label>
              <Select 
                value={newActionParams.department || ''} 
                onValueChange={(value) => setNewActionParams({...newActionParams, department: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="部署を選択" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>職位</Label>
              <Input
                value={newActionParams.position || ''}
                onChange={(e) => setNewActionParams({...newActionParams, position: e.target.value})}
                placeholder="エンジニア"
              />
            </div>
            <div>
              <Label>管理者</Label>
              <Select 
                value={newActionParams.managerId || ''} 
                onValueChange={(value) => setNewActionParams({...newActionParams, managerId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="管理者を選択" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'CREATE_DEPARTMENT':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>部署名</Label>
              <Input
                value={newActionParams.name || ''}
                onChange={(e) => setNewActionParams({...newActionParams, name: e.target.value})}
                placeholder="新部署"
              />
            </div>
            <div>
              <Label>親部署</Label>
              <Select 
                value={newActionParams.parentId || ''} 
                onValueChange={(value) => setNewActionParams({...newActionParams, parentId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="親部署を選択" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>管理者</Label>
              <Select 
                value={newActionParams.managerId || ''} 
                onValueChange={(value) => setNewActionParams({...newActionParams, managerId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="管理者を選択" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>説明</Label>
              <Input
                value={newActionParams.description || ''}
                onChange={(e) => setNewActionParams({...newActionParams, description: e.target.value})}
                placeholder="部署の説明"
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <Label>追加パラメータ</Label>
            <Textarea
              value={JSON.stringify(newActionParams, null, 2)}
              onChange={(e) => {
                try {
                  setNewActionParams(JSON.parse(e.target.value));
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              placeholder='{"key": "value"}'
              rows={3}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>シミュレーション設定</span>
          </CardTitle>
          <CardDescription>
            未来の組織変更をシミュレーションして影響を分析します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="simulation-name">シミュレーション名</Label>
              <Input
                id="simulation-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 2024年組織再編計画"
              />
            </div>
            <div>
              <Label htmlFor="target-date">目標日</Label>
              <Input
                id="target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="simulation-description">説明</Label>
            <Textarea
              id="simulation-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="シミュレーションの目的や背景を記述してください"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* アクション管理 */}
      <Tabs defaultValue="actions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="actions">アクション ({actions.length})</TabsTrigger>
          <TabsTrigger value="add-action">アクション追加</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-4">
          {actions.length > 0 ? (
            <div className="space-y-3">
              {actions
                .sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime())
                .map((action) => (
                  <Card key={action.id} className={`border ${getActionColor(action.type)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getActionIcon(action.type)}
                          <div className="space-y-1">
                            <div className="font-medium">
                              {actionTypes.find(t => t.value === action.type)?.label}
                            </div>
                            <div className="text-sm text-gray-600">
                              {action.description}
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{action.effectiveDate.toLocaleDateString('ja-JP')}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Target className="h-3 w-3" />
                                <span>優先度: {action.priority}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditAction(action)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAction(action.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    アクションがありません
                  </h3>
                  <p className="text-gray-500">
                    「アクション追加」タブから組織変更アクションを追加してください。
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="add-action" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">新しいアクションを追加</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>アクションタイプ</Label>
                  <Select value={newActionType} onValueChange={(value: OrgChangeType) => setNewActionType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['従業員', '部署', '複合'].map(category => (
                        <div key={category}>
                          <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                            {category}
                          </div>
                          {actionTypes
                            .filter(type => type.category === category)
                            .map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!['HIRE_EMPLOYEE', 'CREATE_DEPARTMENT'].includes(newActionType) && (
                  <div>
                    <Label>対象</Label>
                    <Select value={newActionTarget} onValueChange={setNewActionTarget}>
                      <SelectTrigger>
                        <SelectValue placeholder="対象を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {newActionType.includes('EMPLOYEE') || newActionType.includes('TRANSFER') || newActionType.includes('PROMOTE') ? (
                          employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.firstName} {emp.lastName} - {emp.department}
                            </SelectItem>
                          ))
                        ) : (
                          departments.map(dept => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>実行日</Label>
                  <Input
                    type="date"
                    value={newActionDate}
                    onChange={(e) => setNewActionDate(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              {renderActionParameters(newActionType)}

              <div className="flex justify-end">
                <Button onClick={handleAddAction}>
                  <Plus className="h-4 w-4 mr-2" />
                  アクションを追加
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* アクションボタン */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleSaveSimulation}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
            <Button onClick={handleExecuteSimulation} disabled={actions.length === 0}>
              <Play className="h-4 w-4 mr-2" />
              シミュレーション実行
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}