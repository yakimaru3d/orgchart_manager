import { Employee, Department } from './employee';
import { OrgVersion, VersionMetadata, ChangeImpact } from './version';

// シミュレーションのメタデータ
export interface SimulationMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  lastModified: Date;
  tags?: string[];
  isTemplate: boolean;
  baseVersionId: string;
  targetDate: Date;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

// シミュレーション設定
export interface SimulationConfig {
  allowConflicts: boolean;
  autoResolveConflicts: boolean;
  validateConstraints: boolean;
  trackDependencies: boolean;
  enableRollback: boolean;
  maxChangesPerEmployee: number;
  simulationDuration: number; // days
}

// 組織変更アクション
export interface OrgChangeAction {
  id: string;
  type: OrgChangeType;
  targetId: string; // employee or department ID
  effectiveDate: Date;
  parameters: Record<string, unknown>;
  priority: number;
  dependencies?: string[]; // IDs of actions that must execute first
  conditions?: ChangeCondition[];
  rollbackable: boolean;
  description?: string;
}

// 組織変更タイプ
export type OrgChangeType =
  // 従業員関連
  | 'HIRE_EMPLOYEE'
  | 'TERMINATE_EMPLOYEE'
  | 'PROMOTE_EMPLOYEE'
  | 'DEMOTE_EMPLOYEE'
  | 'TRANSFER_EMPLOYEE'
  | 'CHANGE_POSITION'
  | 'CHANGE_DEPARTMENT'
  | 'CHANGE_MANAGER'
  | 'CHANGE_SALARY'
  | 'ADD_SKILLS'
  | 'REMOVE_SKILLS'
  // 部署関連
  | 'CREATE_DEPARTMENT'
  | 'DISSOLVE_DEPARTMENT'
  | 'MERGE_DEPARTMENTS'
  | 'SPLIT_DEPARTMENT'
  | 'RESTRUCTURE_DEPARTMENT'
  | 'CHANGE_DEPARTMENT_MANAGER'
  | 'MOVE_DEPARTMENT'
  // 複合変更
  | 'REORGANIZATION'
  | 'MASS_TRANSFER'
  | 'TEAM_CREATION'
  | 'PROJECT_ASSIGNMENT';

// 変更条件
export interface ChangeCondition {
  type: 'APPROVAL_REQUIRED' | 'BUDGET_AVAILABLE' | 'POSITION_VACANT' | 'DATE_CONSTRAINT' | 'CUSTOM';
  parameters: Record<string, unknown>;
  description: string;
  isMet: boolean;
  checkFunction?: (context: SimulationContext) => boolean;
}

// シミュレーション実行コンテキスト
export interface SimulationContext {
  simulation: OrgSimulation;
  currentState: OrgVersion;
  executedActions: OrgChangeAction[];
  pendingActions: OrgChangeAction[];
  conflicts: SimulationConflict[];
  metrics: SimulationMetrics;
}

// シミュレーション
export interface OrgSimulation {
  metadata: SimulationMetadata;
  config: SimulationConfig;
  baseVersion: OrgVersion;
  actions: OrgChangeAction[];
  scenarios: SimulationScenario[];
  results?: SimulationResults;
}

// シミュレーションシナリオ
export interface SimulationScenario {
  id: string;
  name: string;
  description?: string;
  probability: number; // 0-1
  actions: OrgChangeAction[];
  assumptions: string[];
  expectedOutcome: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// シミュレーション結果
export interface SimulationResults {
  simulationId: string;
  executedAt: Date;
  finalState: OrgVersion;
  scenarios: ScenarioResult[];
  overallMetrics: SimulationMetrics;
  recommendations: Recommendation[];
  warnings: SimulationWarning[];
  conflicts: SimulationConflict[];
}

// シナリオ実行結果
export interface ScenarioResult {
  scenarioId: string;
  scenarioName: string;
  success: boolean;
  executedActions: OrgChangeAction[];
  failedActions: OrgChangeAction[];
  finalState: OrgVersion;
  metrics: SimulationMetrics;
  duration: number; // milliseconds
  impact: ChangeImpact;
}

// シミュレーション指標
export interface SimulationMetrics {
  totalChanges: number;
  successfulChanges: number;
  failedChanges: number;
  conflictCount: number;
  employeeImpact: {
    affected: number;
    promoted: number;
    transferred: number;
    hired: number;
    terminated: number;
  };
  departmentImpact: {
    affected: number;
    created: number;
    dissolved: number;
    restructured: number;
  };
  budgetImpact: {
    salaryChanges: number;
    recruitmentCosts: number;
    trainingCosts: number;
    severanceCosts: number;
    totalImpact: number;
  };
  timelineMetrics: {
    averageExecutionTime: number;
    longestAction: number;
    criticalPath: string[];
  };
}

// 推奨事項
export interface Recommendation {
  id: string;
  type: 'OPTIMIZATION' | 'RISK_MITIGATION' | 'ALTERNATIVE' | 'BEST_PRACTICE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  suggestedActions: string[];
  expectedBenefit: string;
  estimatedCost?: number;
  implementationDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';
}

// シミュレーション警告
export interface SimulationWarning {
  id: string;
  type: 'CONSTRAINT_VIOLATION' | 'RESOURCE_CONFLICT' | 'TIMELINE_ISSUE' | 'DEPENDENCY_FAILURE';
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  affectedActions: string[];
  suggestedResolution?: string;
  autoResolvable: boolean;
}

// シミュレーション競合
export interface SimulationConflict {
  id: string;
  type: 'RESOURCE_CONFLICT' | 'TIMELINE_CONFLICT' | 'DEPENDENCY_CONFLICT' | 'CONSTRAINT_CONFLICT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  conflictingActions: string[];
  resolutionOptions: ConflictResolution[];
  autoResolvable: boolean;
  resolved: boolean;
}

// 競合解決オプション
export interface ConflictResolution {
  id: string;
  description: string;
  type: 'PRIORITIZE' | 'DELAY' | 'MODIFY' | 'CANCEL' | 'MERGE';
  parameters: Record<string, unknown>;
  impact: ChangeImpact;
  automatic: boolean;
}

// シミュレーション実行オプション
export interface SimulationExecutionOptions {
  mode: 'FULL' | 'PARTIAL' | 'DRY_RUN';
  selectedScenarios?: string[];
  stopOnError: boolean;
  generateReport: boolean;
  saveResults: boolean;
  notifyOnCompletion: boolean;
  parallelExecution: boolean;
  maxParallelActions: number;
}

// What-if分析パラメータ
export interface WhatIfAnalysis {
  id: string;
  name: string;
  description?: string;
  baseScenario: string;
  variables: WhatIfVariable[];
  results: WhatIfResult[];
  createdAt: Date;
}

// What-if変数
export interface WhatIfVariable {
  name: string;
  type: 'NUMBER' | 'PERCENTAGE' | 'DATE' | 'BOOLEAN' | 'STRING';
  currentValue: unknown;
  testValues: unknown[];
  description: string;
  impactArea: 'BUDGET' | 'TIMELINE' | 'HEADCOUNT' | 'STRUCTURE' | 'PERFORMANCE';
}

// What-if結果
export interface WhatIfResult {
  variableValues: Record<string, unknown>;
  metrics: SimulationMetrics;
  outcome: ScenarioResult;
  score: number; // 0-100, overall scenario success score
  ranking: number;
}

// シミュレーションテンプレート
export interface SimulationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'RESTRUCTURING' | 'GROWTH' | 'COST_REDUCTION' | 'MERGER' | 'DIGITAL_TRANSFORMATION';
  actions: Omit<OrgChangeAction, 'id' | 'targetId' | 'effectiveDate'>[];
  parameters: TemplateParameter[];
  instructions: string[];
  estimatedDuration: number; // days
  complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'VERY_COMPLEX';
}

// テンプレートパラメータ
export interface TemplateParameter {
  name: string;
  type: 'STRING' | 'NUMBER' | 'DATE' | 'EMPLOYEE_ID' | 'DEPARTMENT_ID' | 'BOOLEAN';
  required: boolean;
  description: string;
  defaultValue?: unknown;
  validation?: ParameterValidation;
}

// パラメータバリデーション
export interface ParameterValidation {
  min?: number;
  max?: number;
  pattern?: string;
  allowedValues?: unknown[];
  customValidation?: string;
}