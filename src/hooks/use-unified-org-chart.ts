import { useMemo } from 'react';
import { OrgNode, OrgChartData, OrgEdge } from '@/types/org-chart';
import { Employee } from '@/types/employee';
import { RecruitmentPlan } from '@/types/recruitment';
import { useEmployees } from './use-employees';
import { useRecruitmentPlans } from './use-recruitment-plans';
import { useAuth } from '@/contexts/auth-context';


// 統合組織図フック
export const useUnifiedOrgChart = () => {
  const { employees, loading: employeesLoading } = useEmployees();
  const { recruitmentPlans, isLoading: plansLoading } = useRecruitmentPlans();

  const unifiedOrgData = useMemo((): OrgChartData => {
    if (employeesLoading || plansLoading) {
      return { nodes: [], edges: [] };
    }

    const nodes: OrgNode[] = [];
    const edges: OrgEdge[] = [];

    // 既存従業員をノードに変換
    employees.forEach(employee => {
      const employeeNode: OrgNode = {
        id: employee.id,
        employeeId: employee.employeeId,
        name: `${employee.firstName} ${employee.lastName}`,
        position: employee.position,
        department: employee.department,
        email: employee.email,
        profileImage: employee.profileImage,
        isManager: isEmployeeManager(employee, employees),
        level: calculateEmployeeLevel(employee, employees),
        parentId: employee.managerId,
        type: 'employee',
      };
      nodes.push(employeeNode);

      // 管理関係のエッジを作成
      if (employee.managerId) {
        edges.push({
          id: `${employee.managerId}-${employee.id}`,
          source: employee.managerId,
          target: employee.id,
          type: 'reports-to',
        });
      }
    });

    // 採用予定ポジションをノードに変換
    recruitmentPlans
      .filter(plan => plan.status !== 'CANCELLED' && plan.status !== 'HIRED')
      .forEach(plan => {
        const recruitmentNode: OrgNode = {
          id: `recruitment-${plan.id}`,
          employeeId: `REC-${plan.id.slice(0, 8)}`,
          name: plan.positionTitle,
          position: plan.positionTitle,
          department: plan.department,
          email: '', // 採用予定なのでメールなし
          isManager: false, // 採用予定は管理者として扱わない
          level: plan.reportingManagerId ? 
            calculateRecruitmentLevel(plan.reportingManagerId, employees) : 1,
          parentId: plan.reportingManagerId,
          type: 'recruitment_plan',
          // 採用予定固有の情報
          recruitmentData: {
            estimated_salary: plan.estimatedSalary,
            target_hire_date: plan.targetHireDate.toISOString(),
            urgency: plan.urgency,
            status: plan.status,
            required_skills: plan.requiredSkills,
          },
        };
        nodes.push(recruitmentNode);

        // 報告関係のエッジを作成（報告先が指定されている場合）
        if (plan.reportingManagerId) {
          edges.push({
            id: `${plan.reportingManagerId}-recruitment-${plan.id}`,
            source: plan.reportingManagerId,
            target: `recruitment-${plan.id}`,
            type: 'future-reports-to',
          });
        }
      });

    return { nodes, edges };
  }, [employees, recruitmentPlans, employeesLoading, plansLoading]);

  // 統計情報の計算
  const orgStats = useMemo(() => {
    const totalEmployees = employees.length;
    const totalRecruitmentPlans = recruitmentPlans.filter(
      plan => plan.status !== 'CANCELLED' && plan.status !== 'HIRED'
    ).length;
    
    const departmentStats = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recruitmentByDepartment = recruitmentPlans
      .filter(plan => plan.status !== 'CANCELLED' && plan.status !== 'HIRED')
      .reduce((acc, plan) => {
        acc[plan.department] = (acc[plan.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const totalBudgetImpact = recruitmentPlans
      .filter(plan => plan.status === 'PLANNED' || plan.status === 'APPROVED')
      .reduce((sum, plan) => sum + plan.estimatedSalary, 0);

    return {
      totalEmployees,
      totalRecruitmentPlans,
      totalNodes: totalEmployees + totalRecruitmentPlans,
      departmentStats,
      recruitmentByDepartment,
      totalBudgetImpact,
    };
  }, [employees, recruitmentPlans]);

  // 部署別フィルタリング
  const getNodesByDepartment = (department: string) => {
    return unifiedOrgData.nodes.filter(node => node.department === department);
  };

  // タイプ別フィルタリング
  const getNodesByType = (type: 'employee' | 'recruitment_plan') => {
    return unifiedOrgData.nodes.filter(node => node.type === type);
  };

  return {
    // データ
    orgData: unifiedOrgData,
    employees,
    recruitmentPlans,
    
    // 読み込み状態
    isLoading: employeesLoading || plansLoading,
    
    // 統計
    orgStats,
    
    // フィルタリング
    getNodesByDepartment,
    getNodesByType,
  };
};

// ヘルパー関数
function isEmployeeManager(employee: Employee, employees: Employee[]): boolean {
  return employees.some(emp => emp.managerId === employee.id);
}

function calculateEmployeeLevel(employee: Employee, employees: Employee[]): number {
  let level = 1;
  let currentEmployee = employee;
  
  while (currentEmployee.managerId) {
    const manager = employees.find(emp => emp.id === currentEmployee.managerId);
    if (!manager) break;
    level++;
    currentEmployee = manager;
    
    if (level > 10) break; // 無限ループ防止
  }
  
  return level;
}

function calculateRecruitmentLevel(managerId: string, employees: Employee[]): number {
  const manager = employees.find(emp => emp.id === managerId);
  if (!manager) return 1;
  
  return calculateEmployeeLevel(manager, employees) + 1;
}

