// 採用計画の型定義
export interface RecruitmentPlan {
  id: string;
  tenant_id: string;
  position_title: string;
  department: string;
  reporting_manager_id?: string;
  required_skills: string[];
  estimated_salary: number;
  target_hire_date: string; // ISO date string
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: 'EXPANSION' | 'REPLACEMENT' | 'NEW_INITIATIVE';
  status: 'PLANNED' | 'APPROVED' | 'IN_PROGRESS' | 'HIRED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface CreateRecruitmentPlanData {
  position_title: string;
  department: string;
  reporting_manager_id?: string;
  required_skills?: string[];
  estimated_salary: number;
  target_hire_date: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason?: 'EXPANSION' | 'REPLACEMENT' | 'NEW_INITIATIVE';
}

export interface UpdateRecruitmentPlanData {
  position_title?: string;
  department?: string;
  reporting_manager_id?: string;
  required_skills?: string[];
  estimated_salary?: number;
  target_hire_date?: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason?: 'EXPANSION' | 'REPLACEMENT' | 'NEW_INITIATIVE';
  status?: 'PLANNED' | 'APPROVED' | 'IN_PROGRESS' | 'HIRED' | 'CANCELLED';
}

// 予算影響計算用の型
export interface BudgetImpact {
  monthly_cost: number;
  annual_cost: number;
  department_budget_impact: number;
  total_budget_impact: number;
  effective_date: string;
}

// 組織図表示用の採用予定ノード
export interface RecruitmentNode {
  id: string;
  type: 'recruitment_plan';
  position_title: string;
  department: string;
  estimated_salary: number;
  target_hire_date: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PLANNED' | 'APPROVED' | 'IN_PROGRESS' | 'HIRED' | 'CANCELLED';
  reporting_manager_id?: string;
}

// 統合組織図ノード（既存従業員 + 採用予定）
export interface UnifiedOrgNode {
  id: string;
  type: 'employee' | 'recruitment_plan';
  name: string;
  position: string;
  department: string;
  email?: string;
  parent_id?: string;
  level: number;
  is_manager: boolean;
  // 採用予定の場合の追加情報
  estimated_salary?: number;
  target_hire_date?: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: 'PLANNED' | 'APPROVED' | 'IN_PROGRESS' | 'HIRED' | 'CANCELLED';
}