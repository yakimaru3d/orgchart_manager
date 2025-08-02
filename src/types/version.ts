import { Employee, Department } from './employee';

// バージョン管理のメタデータ
export interface VersionMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  tags?: string[];
  isActive: boolean;
  parentVersionId?: string;
}

// バージョン管理された従業員データ
export interface VersionedEmployee extends Employee {
  versionId: string;
  effectiveDate: Date;
  expiryDate?: Date;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';
  changedFields?: string[];
  changeReason?: string;
}

// バージョン管理された部署データ
export interface VersionedDepartment extends Department {
  versionId: string;
  effectiveDate: Date;
  expiryDate?: Date;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';
  changedFields?: string[];
  changeReason?: string;
}

// 組織のスナップショット
export interface OrgVersion {
  metadata: VersionMetadata;
  employees: VersionedEmployee[];
  departments: VersionedDepartment[];
  statistics: {
    totalEmployees: number;
    totalDepartments: number;
    totalManagers: number;
    organizationLevels: number;
  };
}

// バージョン比較結果
export interface VersionComparison {
  fromVersion: VersionMetadata;
  toVersion: VersionMetadata;
  changes: {
    employeeChanges: EmployeeChange[];
    departmentChanges: DepartmentChange[];
    summary: ChangeSummary;
  };
}

// 従業員変更情報
export interface EmployeeChange {
  type: 'ADDED' | 'REMOVED' | 'MODIFIED' | 'MOVED';
  employeeId: string;
  employee: Employee;
  previousEmployee?: Employee;
  changedFields?: FieldChange[];
  impact: ChangeImpact;
}

// 部署変更情報
export interface DepartmentChange {
  type: 'ADDED' | 'REMOVED' | 'MODIFIED' | 'RESTRUCTURED';
  departmentId: string;
  department: Department;
  previousDepartment?: Department;
  changedFields?: FieldChange[];
  impact: ChangeImpact;
}

// フィールド変更詳細
export interface FieldChange {
  fieldName: string;
  oldValue: unknown;
  newValue: unknown;
  fieldType: 'string' | 'number' | 'date' | 'boolean' | 'object' | 'array';
}

// 変更影響度
export interface ChangeImpact {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedEmployees: number;
  affectedDepartments: number;
  description: string;
  risks?: string[];
  benefits?: string[];
}

// 変更サマリー
export interface ChangeSummary {
  totalChanges: number;
  employeeChanges: {
    added: number;
    removed: number;
    modified: number;
    moved: number;
  };
  departmentChanges: {
    added: number;
    removed: number;
    modified: number;
    restructured: number;
  };
  overallImpact: ChangeImpact;
}

// バージョン履歴エントリ
export interface VersionHistoryEntry {
  version: VersionMetadata;
  changes: ChangeSummary;
  timeline: Date;
}

// バージョン復元オプション
export interface RestoreOptions {
  targetVersionId: string;
  restoreType: 'FULL' | 'PARTIAL';
  selectedEmployees?: string[];
  selectedDepartments?: string[];
  preserveCurrentData?: boolean;
  createBackup?: boolean;
}

// バージョン作成オプション
export interface CreateVersionOptions {
  name: string;
  description?: string;
  tags?: string[];
  includeInactive?: boolean;
  autoGenerate?: boolean;
  parentVersionId?: string;
}

// バージョン検索・フィルタリング
export interface VersionFilters {
  dateRange?: {
    from: Date;
    to: Date;
  };
  createdBy?: string;
  tags?: string[];
  searchQuery?: string;
  isActive?: boolean;
  hasChanges?: boolean;
}

// バージョン統計
export interface VersionStatistics {
  totalVersions: number;
  activeVersions: number;
  averageChangesPerVersion: number;
  mostActiveMonth: string;
  latestVersion: VersionMetadata;
  oldestVersion: VersionMetadata;
  versionGrowthTrend: {
    month: string;
    count: number;
  }[];
}