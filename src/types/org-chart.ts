export interface OrgNode {
  id: string;
  employeeId?: string;
  name: string;
  position: string;
  department: string;
  email?: string;
  profileImage?: string;
  isManager: boolean;
  level: number;
  parentId?: string;
  children?: OrgNode[];
  type?: 'employee' | 'recruitment_plan';
  recruitmentData?: {
    estimated_salary: number;
    target_hire_date: string;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'PLANNED' | 'APPROVED' | 'IN_PROGRESS' | 'HIRED' | 'CANCELLED';
    required_skills: string[];
  };
}

export interface OrgChartData {
  nodes: OrgNode[];
  edges: OrgEdge[];
}

export interface OrgEdge {
  id: string;
  source: string;
  target: string;
  type: 'reports-to' | 'future-reports-to';
}

export interface OrgChartViewOptions {
  viewType: 'full' | 'department' | 'hierarchy' | 'team';
  departmentFilter?: string;
  levelFilter?: number;
  employeeFilter?: string;
  showInactiveEmployees?: boolean;
}

export interface OrgChartLayoutOptions {
  direction: 'top-down' | 'left-right' | 'bottom-up' | 'right-left';
  nodeSpacing: number;
  levelSpacing: number;
  compactMode: boolean;
}