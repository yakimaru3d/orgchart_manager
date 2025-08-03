import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { RecruitmentPlan, CreateRecruitmentPlanData, UpdateRecruitmentPlanData } from '@/types/recruitment';
import { useAuth } from '@/contexts/auth-context';

// 採用計画管理のカスタムフック
export const useRecruitmentPlans = () => {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();

  // 採用計画一覧の取得
  const {
    data: recruitmentPlans = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['recruitment-plans', tenantId],
    queryFn: async (): Promise<RecruitmentPlan[]> => {
      const { data, error } = await supabase
        .from('recruitment_plans')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`採用計画の取得に失敗しました: ${error.message}`);
      }

      return data || [];
    },
  });

  // 採用計画の作成
  const createRecruitmentPlan = useMutation({
    mutationFn: async (planData: CreateRecruitmentPlanData): Promise<RecruitmentPlan> => {
      
      const { data, error } = await supabase
        .from('recruitment_plans')
        .insert({
          tenant_id: tenantId,
          ...planData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`採用計画の作成に失敗しました: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-plans', tenantId] });
    },
  });

  // 採用計画の更新
  const updateRecruitmentPlan = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateRecruitmentPlanData }): Promise<RecruitmentPlan> => {
      const { data, error } = await supabase
        .from('recruitment_plans')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`採用計画の更新に失敗しました: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-plans', tenantId] });
    },
  });

  // 採用計画の削除
  const deleteRecruitmentPlan = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('recruitment_plans')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`採用計画の削除に失敗しました: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-plans', tenantId] });
    },
  });

  // 部署別採用計画の取得
  const getRecruitmentPlansByDepartment = useCallback((department: string) => {
    return recruitmentPlans.filter(plan => plan.department === department);
  }, [recruitmentPlans]);

  // ステータス別採用計画の取得
  const getRecruitmentPlansByStatus = useCallback((status: RecruitmentPlan['status']) => {
    return recruitmentPlans.filter(plan => plan.status === status);
  }, [recruitmentPlans]);

  // 緊急度別採用計画の取得
  const getRecruitmentPlansByUrgency = useCallback((urgency: RecruitmentPlan['urgency']) => {
    return recruitmentPlans.filter(plan => plan.urgency === urgency);
  }, [recruitmentPlans]);

  // 採用予定日でのフィルタリング
  const getRecruitmentPlansInDateRange = useCallback((startDate: string, endDate: string) => {
    return recruitmentPlans.filter(plan => 
      plan.target_hire_date >= startDate && plan.target_hire_date <= endDate
    );
  }, [recruitmentPlans]);

  // 統計情報の計算
  const getRecruitmentStats = useCallback(() => {
    const total = recruitmentPlans.length;
    const byStatus = recruitmentPlans.reduce((acc, plan) => {
      acc[plan.status] = (acc[plan.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byUrgency = recruitmentPlans.reduce((acc, plan) => {
      acc[plan.urgency] = (acc[plan.urgency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalBudget = recruitmentPlans
      .filter(plan => plan.status === 'PLANNED' || plan.status === 'APPROVED')
      .reduce((sum, plan) => sum + plan.estimated_salary, 0);

    return {
      total,
      byStatus,
      byUrgency,
      totalBudget,
    };
  }, [recruitmentPlans]);

  return {
    // データ
    recruitmentPlans,
    isLoading,
    error,
    
    // 操作
    createRecruitmentPlan,
    updateRecruitmentPlan,
    deleteRecruitmentPlan,
    refetch,
    
    // フィルタリング
    getRecruitmentPlansByDepartment,
    getRecruitmentPlansByStatus,
    getRecruitmentPlansByUrgency,
    getRecruitmentPlansInDateRange,
    
    // 統計
    getRecruitmentStats,
  };
};

