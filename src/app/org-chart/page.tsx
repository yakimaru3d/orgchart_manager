'use client';

import { useState, useMemo } from 'react';
import { OrgNode, OrgChartViewOptions } from '@/types/org-chart';
import { CreateVersionOptions } from '@/types/version';
import { generateOrgChartData, getEmployeesByDepartment } from '@/lib/org-chart-data';
import { useVersionManager } from '@/hooks/use-version-manager';
import { useEmployees } from '@/hooks/use-employees';
import { useDepartments } from '@/hooks/use-departments';
import DashboardLayout from '@/components/layout/dashboard-layout';
import OrgChart from '@/components/org-chart/org-chart';
import VersionTimeline from '@/components/version/version-timeline';
import VersionComparison from '@/components/version/version-comparison';
import CreateVersionDialog from '@/components/version/create-version-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Download, 
  Filter, 
  Users, 
  Building, 
  Layers,
  Mail,
  GitBranch,
  Play,
  Save
} from 'lucide-react';

// Constants
const TAB_OPTIONS = {
  CHART: 'chart' as const,
  VERSIONS: 'versions' as const,
  SIMULATION: 'simulation' as const,
};


export default function OrgChartPage() {
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [viewOptions, setViewOptions] = useState<OrgChartViewOptions>({
    viewType: 'full',
    showInactiveEmployees: false,
  });
  const [activeTab, setActiveTab] = useState<keyof typeof TAB_OPTIONS>(TAB_OPTIONS.CHART);
  const [showCreateVersion, setShowCreateVersion] = useState(false);
  
  // 実際の従業員データと部門データを取得
  const { employees, loading: employeesLoading, error: employeesError } = useEmployees();
  const { departments, loading: departmentsLoading, error: departmentsError } = useDepartments();
  
  const {
    versions,
    currentVersion,
    comparison,
    isLoading,
    error,
    createVersion,
    compareVersions,
    restoreVersion,
    deleteVersion,
    exportVersion,
    clearComparison,
  } = useVersionManager();
  
  const orgData = useMemo(() => {
    if (employees.length === 0) return { nodes: [], edges: [] };
    return generateOrgChartData(employees);
  }, [employees]);
  
  // Filter data based on view options
  const filteredData = useMemo(() => {
    let filteredEmployees = employees.filter(emp => 
      viewOptions.showInactiveEmployees || emp.isActive
    );

    // Apply filters based on view type
    if (viewOptions.viewType === 'department' && viewOptions.departmentFilter) {
      filteredEmployees = getEmployeesByDepartment(filteredEmployees, viewOptions.departmentFilter);
    }
    
    if (viewOptions.levelFilter) {
      const levelData = generateOrgChartData(filteredEmployees);
      filteredEmployees = filteredEmployees.filter(emp => {
        const node = levelData.nodes.find(n => n.id === emp.id);
        return node && node.level === viewOptions.levelFilter;
      });
    }

    if (viewOptions.employeeFilter) {
      const searchTerm = viewOptions.employeeFilter.toLowerCase();
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.firstName.toLowerCase().includes(searchTerm) ||
        emp.lastName.toLowerCase().includes(searchTerm) ||
        emp.position.toLowerCase().includes(searchTerm) ||
        emp.department.toLowerCase().includes(searchTerm)
      );
    }

    return generateOrgChartData(filteredEmployees);
  }, [employees, viewOptions]);

  const departmentNames = useMemo(() => {
    return departments.filter(dept => dept.isActive).map(dept => dept.name);
  }, [departments]);

  const stats = useMemo(() => {
    const totalEmployees = orgData.nodes.length;
    const totalManagers = orgData.nodes.filter(node => node.isManager).length;
    const totalDepartments = departmentNames.length;
    const maxLevel = orgData.nodes.length > 0 ? Math.max(...orgData.nodes.map(node => node.level)) : 0;
    
    return {
      totalEmployees,
      totalManagers,
      totalDepartments,
      maxLevel,
    };
  }, [orgData.nodes, departmentNames]);

  const handleNodeClick = (node: OrgNode) => {
    setSelectedNode(node);
  };

  const handleExport = () => {
    // In a real app, this would export the chart as PDF or image
    // Export chart as PDF or image
  };

  // ローディング状態の表示
  if (employeesLoading || departmentsLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">組織図データを読み込み中...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // エラー状態の表示
  if (employeesError || departmentsError) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">データの読み込みに失敗しました</p>
            <p className="text-gray-600">{employeesError || departmentsError}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">組織図</h1>
            <p className="text-gray-600">
              会社の組織構造を視覚化します
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* タブナビゲーション */}
            <div className="flex border rounded-lg p-1 bg-gray-50">
              <button
                onClick={() => setActiveTab(TAB_OPTIONS.CHART)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === TAB_OPTIONS.CHART 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                組織図
              </button>
              <button
                onClick={() => setActiveTab(TAB_OPTIONS.VERSIONS)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === TAB_OPTIONS.VERSIONS 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <GitBranch className="h-4 w-4 mr-1 inline" />
                バージョン
              </button>
              <button
                onClick={() => setActiveTab(TAB_OPTIONS.SIMULATION)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === TAB_OPTIONS.SIMULATION 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Play className="h-4 w-4 mr-1 inline" />
                シミュレーション
              </button>
            </div>
            
            {activeTab === TAB_OPTIONS.CHART && (
              <>
                <Select 
                  value={viewOptions.viewType} 
                  onValueChange={(value: 'full' | 'department' | 'hierarchy' | 'team') => setViewOptions(prev => ({ ...prev, viewType: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">全体表示</SelectItem>
                    <SelectItem value="department">部署別</SelectItem>
                    <SelectItem value="hierarchy">階層別</SelectItem>
                    <SelectItem value="team">チーム別</SelectItem>
                  </SelectContent>
                </Select>
                
                {viewOptions.viewType === 'department' && (
                  <Select 
                    value={viewOptions.departmentFilter || 'all'} 
                    onValueChange={(value) => setViewOptions(prev => ({ 
                      ...prev, 
                      departmentFilter: value === 'all' ? undefined : value 
                    }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべての部署</SelectItem>
                      {departmentNames.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  エクスポート
                </Button>
              </>
            )}
            
            {activeTab === TAB_OPTIONS.VERSIONS && (
              <Button onClick={() => setShowCreateVersion(true)}>
                <Save className="mr-2 h-4 w-4" />
                バージョン作成
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">総従業員数</p>
                  <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">管理者</p>
                  <p className="text-2xl font-bold">{stats.totalManagers}</p>
                </div>
                <Building className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">部署数</p>
                  <p className="text-2xl font-bold">{stats.totalDepartments}</p>
                </div>
                <Filter className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">組織レベル</p>
                  <p className="text-2xl font-bold">{stats.maxLevel}</p>
                </div>
                <Layers className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* メインコンテンツ */}
        {activeTab === 'chart' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Organization Chart */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>組織構造</CardTitle>
                  <CardDescription>
                    インタラクティブな組織図 - ノードをクリックして詳細を表示
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <OrgChart data={filteredData} onNodeClick={handleNodeClick} />
                </CardContent>
              </Card>
            </div>

          {/* Selected Node Details */}
          <div className="space-y-6">
            {selectedNode ? (
              <Card>
                <CardHeader>
                  <CardTitle>従業員詳細</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedNode.profileImage || ''} />
                      <AvatarFallback>
                        {selectedNode.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedNode.name}</h3>
                      <p className="text-sm text-gray-600">{selectedNode.position}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">部署</span>
                      <Badge variant="secondary">{selectedNode.department}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">レベル</span>
                      <Badge variant="outline">レベル {selectedNode.level}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">役割</span>
                      <Badge variant={selectedNode.isManager ? 'default' : 'secondary'}>
                        {selectedNode.isManager ? '管理者' : '個人貢献者'}
                      </Badge>
                    </div>
                  </div>
                  
                  {selectedNode.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{selectedNode.email}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>従業員詳細</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">
                    組織図のノードをクリックして従業員詳細を表示
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle>凡例</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">部署色</h4>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>
                      <span>レベル1 (部長)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span>レベル2 (管理者)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>レベル3 (シニア)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span>レベル4 (個人貢献者)</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 pt-3 border-t">
                  <h4 className="text-sm font-medium">シンボル</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <Users className="h-3 w-3" />
                      <span>管理者/チームリーダー</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3" />
                      <span>連絡先あり</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        )}

        {/* バージョン管理タブ */}
        {activeTab === 'versions' && (
          <div className="space-y-6">
            {comparison ? (
              <VersionComparison 
                comparison={comparison} 
                onClose={clearComparison}
              />
            ) : (
              <VersionTimeline
                versions={versions}
                currentVersionId={currentVersion?.metadata.id}
                onViewVersion={() => {}}
                onRestoreVersion={async (version) => {
                  await restoreVersion({
                    targetVersionId: version.metadata.id,
                    restoreType: 'FULL'
                  });
                }}
                onDeleteVersion={async (version) => {
                  await deleteVersion(version.metadata.id);
                }}
                onExportVersion={(version) => {
                  const data = exportVersion(version.metadata.id);
                  if (data) {
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${version.metadata.name}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }
                }}
                onCompareVersions={async (fromVersion, toVersion) => {
                  await compareVersions(fromVersion.metadata.id, toVersion.metadata.id);
                }}
              />
            )}
          </div>
        )}

        {/* シミュレーションタブ */}
        {activeTab === 'simulation' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Play className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    シミュレーション機能
                  </h3>
                  <p className="text-gray-500 mb-4">
                    未来の組織変更をシミュレーションして影響を分析できます。
                  </p>
                  <Button variant="outline">
                    シミュレーションを開始
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* バージョン作成ダイアログ */}
        <CreateVersionDialog
          open={showCreateVersion}
          onOpenChange={setShowCreateVersion}
          employees={employees}
          departments={departments}
          onCreateVersion={async (options: CreateVersionOptions) => {
            await createVersion(employees, departments, options);
          }}
          isLoading={isLoading}
        />

        {/* エラー表示 */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <span className="font-medium">エラー:</span>
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}