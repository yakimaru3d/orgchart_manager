'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import OrgChart from '@/components/org-chart/org-chart';
import { useUnifiedOrgChart } from '@/hooks/use-unified-org-chart';
import { OrgNode } from '@/types/org-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Building, 
  DollarSign,
  Calendar,
  Mail,
  Download,
  Filter,
  Plus,
  TrendingUp
} from 'lucide-react';

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function UnifiedOrgChartContent() {
  const { 
    orgData, 
    isLoading, 
    orgStats, 
    getNodesByDepartment, 
    getNodesByType 
  } = useUnifiedOrgChart();
  
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [viewFilter, setViewFilter] = useState<'all' | 'employees' | 'recruitment'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // フィルタリングされたデータ
  const filteredData = React.useMemo(() => {
    let nodes = orgData.nodes;

    // タイプフィルタ
    if (viewFilter === 'employees') {
      nodes = nodes.filter(node => node.type !== 'recruitment_plan');
    } else if (viewFilter === 'recruitment') {
      nodes = nodes.filter(node => node.type === 'recruitment_plan');
    }

    // 部署フィルタ
    if (departmentFilter !== 'all') {
      nodes = nodes.filter(node => node.department === departmentFilter);
    }

    // フィルタされたノードに関連するエッジのみを残す
    const nodeIds = new Set(nodes.map(node => node.id));
    const edges = orgData.edges.filter(edge => 
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );

    return { nodes, edges };
  }, [orgData, viewFilter, departmentFilter]);

  // 部署一覧を取得
  const departments = React.useMemo(() => {
    const deptSet = new Set(orgData.nodes.map(node => node.department));
    return Array.from(deptSet).sort();
  }, [orgData.nodes]);

  const handleNodeClick = (node: OrgNode) => {
    setSelectedNode(node);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg">読み込み中...</div>
          <p className="text-muted-foreground mt-2">組織データを取得しています</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">統合組織図</h1>
          <p className="text-gray-600">
            現在の従業員と採用予定ポジションを統合した組織図
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={viewFilter} onValueChange={(value: any) => setViewFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて表示</SelectItem>
              <SelectItem value="employees">従業員のみ</SelectItem>
              <SelectItem value="recruitment">採用予定のみ</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部署</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            エクスポート
          </Button>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">現在の従業員</p>
                <p className="text-2xl font-bold">{orgStats.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">採用予定</p>
                <p className="text-2xl font-bold text-green-600">{orgStats.totalRecruitmentPlans}</p>
              </div>
              <Plus className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総ノード数</p>
                <p className="text-2xl font-bold">{orgStats.totalNodes}</p>
              </div>
              <Building className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">予算影響</p>
                <p className="text-2xl font-bold">
                  {(orgStats.totalBudgetImpact / 10000).toFixed(0)}万円
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 組織図 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>統合組織構造</CardTitle>
              <CardDescription>
                青い点線は採用予定ポジション、実線は現在の報告関係を表示
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <OrgChart data={filteredData} onNodeClick={handleNodeClick} />
            </CardContent>
          </Card>
        </div>

        {/* 詳細パネル */}
        <div className="space-y-6">
          {selectedNode ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedNode.type === 'recruitment_plan' ? '採用予定詳細' : '従業員詳細'}
                </CardTitle>
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
                    <span className="text-sm text-gray-600">タイプ</span>
                    <Badge variant={selectedNode.type === 'recruitment_plan' ? 'outline' : 'default'}>
                      {selectedNode.type === 'recruitment_plan' ? '採用予定' : '現従業員'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">レベル</span>
                    <Badge variant="outline">レベル {selectedNode.level}</Badge>
                  </div>
                </div>
                
                {selectedNode.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{selectedNode.email}</span>
                  </div>
                )}

                {/* 採用予定の場合の追加情報 */}
                {selectedNode.type === 'recruitment_plan' && selectedNode.recruitmentData && (
                  <div className="space-y-3 pt-3 border-t">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        採用予定: {new Date(selectedNode.recruitmentData.target_hire_date).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        想定年収: {(selectedNode.recruitmentData.estimated_salary / 10000).toFixed(0)}万円
                      </span>
                    </div>

                    {selectedNode.recruitmentData.required_skills.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-sm text-gray-600">必要スキル:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedNode.recruitmentData.required_skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>詳細情報</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  組織図のノードをクリックして詳細を表示
                </p>
              </CardContent>
            </Card>
          )}

          {/* 凡例 */}
          <Card>
            <CardHeader>
              <CardTitle>凡例</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">ノードタイプ</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-white border-2 border-gray-300 rounded"></div>
                    <span>現在の従業員</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-50 border-2 border-blue-300 border-dashed rounded"></div>
                    <span>採用予定ポジション</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 pt-3 border-t">
                <h4 className="text-sm font-medium">エッジタイプ</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-0 border-t-2 border-indigo-500"></div>
                    <span>現在の報告関係</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-0 border-t-2 border-blue-500 border-dashed"></div>
                    <span>将来の報告関係</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function UnifiedOrgChartPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <UnifiedOrgChartContent />
        </div>
      </DashboardLayout>
    </QueryClientProvider>
  );
}