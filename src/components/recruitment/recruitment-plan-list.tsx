import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRecruitmentPlans } from '@/hooks/use-recruitment-plans';
import { RecruitmentPlan } from '@/types/recruitment';
import RecruitmentPlanForm from './recruitment-plan-form';
import { Plus, Edit, Trash2, Calendar, DollarSign, Users } from 'lucide-react';

export default function RecruitmentPlanList() {
  const { 
    recruitmentPlans, 
    isLoading, 
    error, 
    deleteRecruitmentPlan,
    getRecruitmentStats
  } = useRecruitmentPlans();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<RecruitmentPlan | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const stats = getRecruitmentStats();

  const getUrgencyColor = (urgency: RecruitmentPlan['urgency']) => {
    switch (urgency) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: RecruitmentPlan['status']) => {
    switch (status) {
      case 'PLANNED': return 'outline';
      case 'APPROVED': return 'default';
      case 'IN_PROGRESS': return 'default';
      case 'HIRED': return 'default';
      case 'CANCELLED': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusText = (status: RecruitmentPlan['status']) => {
    switch (status) {
      case 'PLANNED': return '計画中';
      case 'APPROVED': return '承認済み';
      case 'IN_PROGRESS': return '進行中';
      case 'HIRED': return '採用完了';
      case 'CANCELLED': return 'キャンセル';
      default: return status;
    }
  };

  const getUrgencyText = (urgency: RecruitmentPlan['urgency']) => {
    switch (urgency) {
      case 'LOW': return '低';
      case 'MEDIUM': return '中';
      case 'HIGH': return '高';
      case 'CRITICAL': return '緊急';
      default: return urgency;
    }
  };

  const handleEdit = (plan: RecruitmentPlan) => {
    setEditingPlan(plan);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (planId: string) => {
    if (confirm('この採用計画を削除しますか？')) {
      try {
        await deleteRecruitmentPlan.mutateAsync(planId);
      } catch (error) {
        console.error('削除に失敗:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-lg">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              エラーが発生しました: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダーと統計 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">採用計画管理</h1>
          <p className="text-muted-foreground">組織の採用計画を管理します</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新しい採用計画
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>新しい採用計画</DialogTitle>
            </DialogHeader>
            <RecruitmentPlanForm
              mode="create"
              onSuccess={() => setIsCreateDialogOpen(false)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">総計画数</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">承認済み</p>
                <p className="text-2xl font-bold">{stats.byStatus.APPROVED || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">予算合計</p>
                <p className="text-2xl font-bold">{(stats.totalBudget / 10000).toFixed(0)}万円</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">緊急</p>
                <p className="text-2xl font-bold">{stats.byUrgency.CRITICAL || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 採用計画リスト */}
      <Card>
        <CardHeader>
          <CardTitle>採用計画一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {recruitmentPlans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">採用計画がまだありません</p>
              <p className="text-sm text-muted-foreground mt-2">
                「新しい採用計画」ボタンから作成してください
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ポジション</TableHead>
                  <TableHead>部署</TableHead>
                  <TableHead>想定年収</TableHead>
                  <TableHead>採用予定日</TableHead>
                  <TableHead>緊急度</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recruitmentPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      {plan.position_title}
                    </TableCell>
                    <TableCell>{plan.department}</TableCell>
                    <TableCell>{(plan.estimated_salary / 10000).toFixed(0)}万円</TableCell>
                    <TableCell>
                      {new Date(plan.target_hire_date).toLocaleDateString('ja-JP')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getUrgencyColor(plan.urgency)}>
                        {getUrgencyText(plan.urgency)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(plan.status)}>
                        {getStatusText(plan.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(plan)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(plan.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>採用計画の編集</DialogTitle>
          </DialogHeader>
          {editingPlan && (
            <RecruitmentPlanForm
              mode="edit"
              initialData={editingPlan}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setEditingPlan(null);
              }}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingPlan(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}