import { 
  OrgVersion, 
  VersionMetadata, 
  VersionedEmployee, 
  VersionedDepartment,
  VersionComparison,
  EmployeeChange,
  DepartmentChange,
  FieldChange,
  ChangeImpact,
  ChangeSummary,
  CreateVersionOptions,
  RestoreOptions,
  VersionFilters,
  VersionStatistics
} from '@/types/version';
import { Employee, Department } from '@/types/employee';
import { generateOrgChartData } from './org-chart-data';

// バージョン管理クラス
export class VersionManager {
  private versions: Map<string, OrgVersion> = new Map();
  private currentVersionId: string | null = null;

  // 新しいバージョンを作成
  async createVersion(
    employees: Employee[], 
    departments: Department[], 
    options: CreateVersionOptions,
    createdBy: string = 'system'
  ): Promise<OrgVersion> {
    const versionId = this.generateVersionId();
    const now = new Date();

    // バージョンメタデータを作成
    const metadata: VersionMetadata = {
      id: versionId,
      name: options.name,
      description: options.description,
      createdAt: now,
      createdBy,
      tags: options.tags || [],
      isActive: true,
      parentVersionId: options.parentVersionId
    };

    // 従業員データをバージョン化
    const versionedEmployees: VersionedEmployee[] = employees
      .filter(emp => options.includeInactive || emp.isActive)
      .map(emp => ({
        ...emp,
        versionId,
        effectiveDate: now,
        changeType: 'CREATE' as const
      }));

    // 部署データをバージョン化
    const versionedDepartments: VersionedDepartment[] = departments
      .filter(dept => options.includeInactive || dept.isActive)
      .map(dept => ({
        ...dept,
        versionId,
        effectiveDate: now,
        changeType: 'CREATE' as const
      }));

    // 統計情報を計算
    const orgData = generateOrgChartData(employees);
    const statistics = {
      totalEmployees: versionedEmployees.length,
      totalDepartments: versionedDepartments.length,
      totalManagers: orgData.nodes.filter(node => node.isManager).length,
      organizationLevels: Math.max(...orgData.nodes.map(node => node.level))
    };

    const version: OrgVersion = {
      metadata,
      employees: versionedEmployees,
      departments: versionedDepartments,
      statistics
    };

    this.versions.set(versionId, version);
    this.currentVersionId = versionId;

    return version;
  }

  // バージョンを取得
  getVersion(versionId: string): OrgVersion | null {
    return this.versions.get(versionId) || null;
  }

  // 現在のバージョンを取得
  getCurrentVersion(): OrgVersion | null {
    return this.currentVersionId ? this.getVersion(this.currentVersionId) : null;
  }

  // すべてのバージョンを取得
  getAllVersions(): OrgVersion[] {
    return Array.from(this.versions.values()).sort(
      (a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime()
    );
  }

  // フィルタリングされたバージョンを取得
  getFilteredVersions(filters: VersionFilters): OrgVersion[] {
    let versions = this.getAllVersions();

    if (filters.dateRange) {
      versions = versions.filter(v => 
        v.metadata.createdAt >= filters.dateRange!.from &&
        v.metadata.createdAt <= filters.dateRange!.to
      );
    }

    if (filters.createdBy) {
      versions = versions.filter(v => v.metadata.createdBy === filters.createdBy);
    }

    if (filters.tags && filters.tags.length > 0) {
      versions = versions.filter(v => 
        filters.tags!.some(tag => v.metadata.tags?.includes(tag))
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      versions = versions.filter(v => 
        v.metadata.name.toLowerCase().includes(query) ||
        v.metadata.description?.toLowerCase().includes(query)
      );
    }

    if (filters.isActive !== undefined) {
      versions = versions.filter(v => v.metadata.isActive === filters.isActive);
    }

    return versions;
  }

  // バージョン間の比較
  compareVersions(fromVersionId: string, toVersionId: string): VersionComparison | null {
    const fromVersion = this.getVersion(fromVersionId);
    const toVersion = this.getVersion(toVersionId);

    if (!fromVersion || !toVersion) {
      return null;
    }

    const employeeChanges = this.compareEmployees(fromVersion.employees, toVersion.employees);
    const departmentChanges = this.compareDepartments(fromVersion.departments, toVersion.departments);
    const summary = this.generateChangeSummary(employeeChanges, departmentChanges);

    return {
      fromVersion: fromVersion.metadata,
      toVersion: toVersion.metadata,
      changes: {
        employeeChanges,
        departmentChanges,
        summary
      }
    };
  }

  // 従業員の変更を比較
  private compareEmployees(
    fromEmployees: VersionedEmployee[], 
    toEmployees: VersionedEmployee[]
  ): EmployeeChange[] {
    const changes: EmployeeChange[] = [];
    const fromMap = new Map(fromEmployees.map(emp => [emp.id, emp]));
    const toMap = new Map(toEmployees.map(emp => [emp.id, emp]));

    // 追加された従業員
    for (const [id, employee] of toMap) {
      if (!fromMap.has(id)) {
        changes.push({
          type: 'ADDED',
          employeeId: id,
          employee,
          impact: this.calculateEmployeeImpact('ADDED', employee)
        });
      }
    }

    // 削除された従業員
    for (const [id, employee] of fromMap) {
      if (!toMap.has(id)) {
        changes.push({
          type: 'REMOVED',
          employeeId: id,
          employee,
          impact: this.calculateEmployeeImpact('REMOVED', employee)
        });
      }
    }

    // 変更された従業員
    for (const [id, toEmployee] of toMap) {
      const fromEmployee = fromMap.get(id);
      if (fromEmployee) {
        const fieldChanges = this.compareEmployeeFields(fromEmployee, toEmployee);
        if (fieldChanges.length > 0) {
          const changeType = this.determineEmployeeChangeType(fieldChanges);
          changes.push({
            type: changeType,
            employeeId: id,
            employee: toEmployee,
            previousEmployee: fromEmployee,
            changedFields: fieldChanges,
            impact: this.calculateEmployeeImpact(changeType, toEmployee, fromEmployee)
          });
        }
      }
    }

    return changes;
  }

  // 部署の変更を比較
  private compareDepartments(
    fromDepartments: VersionedDepartment[], 
    toDepartments: VersionedDepartment[]
  ): DepartmentChange[] {
    const changes: DepartmentChange[] = [];
    const fromMap = new Map(fromDepartments.map(dept => [dept.id, dept]));
    const toMap = new Map(toDepartments.map(dept => [dept.id, dept]));

    // 追加された部署
    for (const [id, department] of toMap) {
      if (!fromMap.has(id)) {
        changes.push({
          type: 'ADDED',
          departmentId: id,
          department,
          impact: this.calculateDepartmentImpact('ADDED', department)
        });
      }
    }

    // 削除された部署
    for (const [id, department] of fromMap) {
      if (!toMap.has(id)) {
        changes.push({
          type: 'REMOVED',
          departmentId: id,
          department,
          impact: this.calculateDepartmentImpact('REMOVED', department)
        });
      }
    }

    // 変更された部署
    for (const [id, toDepartment] of toMap) {
      const fromDepartment = fromMap.get(id);
      if (fromDepartment) {
        const fieldChanges = this.compareDepartmentFields(fromDepartment, toDepartment);
        if (fieldChanges.length > 0) {
          const changeType = this.determineDepartmentChangeType(fieldChanges);
          changes.push({
            type: changeType,
            departmentId: id,
            department: toDepartment,
            previousDepartment: fromDepartment,
            changedFields: fieldChanges,
            impact: this.calculateDepartmentImpact(changeType, toDepartment, fromDepartment)
          });
        }
      }
    }

    return changes;
  }

  // フィールドレベルの比較
  private compareEmployeeFields(from: Employee, to: Employee): FieldChange[] {
    const changes: FieldChange[] = [];
    const fieldsToCompare: (keyof Employee)[] = [
      'firstName', 'lastName', 'email', 'department', 'position', 
      'managerId', 'phoneNumber', 'isActive'
    ];

    for (const field of fieldsToCompare) {
      const oldValue = from[field];
      const newValue = to[field];
      
      if (oldValue !== newValue) {
        changes.push({
          fieldName: field,
          oldValue,
          newValue,
          fieldType: this.getFieldType(newValue)
        });
      }
    }

    return changes;
  }

  private compareDepartmentFields(from: Department, to: Department): FieldChange[] {
    const changes: FieldChange[] = [];
    const fieldsToCompare: (keyof Department)[] = [
      'name', 'parentId', 'managerId', 'level', 'description', 'color', 'isActive'
    ];

    for (const field of fieldsToCompare) {
      const oldValue = from[field];
      const newValue = to[field];
      
      if (oldValue !== newValue) {
        changes.push({
          fieldName: field,
          oldValue,
          newValue,
          fieldType: this.getFieldType(newValue)
        });
      }
    }

    return changes;
  }

  // 変更タイプの判定
  private determineEmployeeChangeType(fieldChanges: FieldChange[]): 'MODIFIED' | 'MOVED' {
    const hasPositionChange = fieldChanges.some(change => 
      change.fieldName === 'position' || change.fieldName === 'managerId'
    );
    const hasDepartmentChange = fieldChanges.some(change => 
      change.fieldName === 'department'
    );

    if (hasDepartmentChange || hasPositionChange) {
      return 'MOVED';
    }
    return 'MODIFIED';
  }

  private determineDepartmentChangeType(fieldChanges: FieldChange[]): 'MODIFIED' | 'RESTRUCTURED' {
    const hasStructuralChange = fieldChanges.some(change => 
      change.fieldName === 'parentId' || change.fieldName === 'managerId' || change.fieldName === 'level'
    );
    
    return hasStructuralChange ? 'RESTRUCTURED' : 'MODIFIED';
  }

  // 影響度の計算
  private calculateEmployeeImpact(
    changeType: string, 
    employee: Employee, 
    previousEmployee?: Employee
  ): ChangeImpact {
    // 簡略化された影響度計算
    let level: ChangeImpact['level'] = 'LOW';
    const affectedEmployees = 1;
    let affectedDepartments = 0;
    let description = '';

    switch (changeType) {
      case 'ADDED':
        level = 'MEDIUM';
        description = '新しい従業員が追加されました';
        break;
      case 'REMOVED':
        level = 'HIGH';
        description = '従業員が削除されました';
        break;
      case 'MOVED':
        level = 'MEDIUM';
        affectedDepartments = 1;
        description = '従業員の配置が変更されました';
        break;
      default:
        level = 'LOW';
        description = '従業員情報が更新されました';
    }

    return {
      level,
      affectedEmployees,
      affectedDepartments,
      description
    };
  }

  private calculateDepartmentImpact(
    changeType: string, 
    department: Department, 
    previousDepartment?: Department
  ): ChangeImpact {
    let level: ChangeImpact['level'] = 'MEDIUM';
    const affectedEmployees = 0;
    let affectedDepartments = 1;
    let description = '';

    switch (changeType) {
      case 'ADDED':
        level = 'MEDIUM';
        description = '新しい部署が作成されました';
        break;
      case 'REMOVED':
        level = 'HIGH';
        description = '部署が削除されました';
        break;
      case 'RESTRUCTURED':
        level = 'HIGH';
        affectedDepartments = 3; // 推定
        description = '部署構造が再編されました';
        break;
      default:
        level = 'LOW';
        description = '部署情報が更新されました';
    }

    return {
      level,
      affectedEmployees,
      affectedDepartments,
      description
    };
  }

  // 変更サマリーの生成
  private generateChangeSummary(
    employeeChanges: EmployeeChange[], 
    departmentChanges: DepartmentChange[]
  ): ChangeSummary {
    const employeeStats = {
      added: employeeChanges.filter(c => c.type === 'ADDED').length,
      removed: employeeChanges.filter(c => c.type === 'REMOVED').length,
      modified: employeeChanges.filter(c => c.type === 'MODIFIED').length,
      moved: employeeChanges.filter(c => c.type === 'MOVED').length
    };

    const departmentStats = {
      added: departmentChanges.filter(c => c.type === 'ADDED').length,
      removed: departmentChanges.filter(c => c.type === 'REMOVED').length,
      modified: departmentChanges.filter(c => c.type === 'MODIFIED').length,
      restructured: departmentChanges.filter(c => c.type === 'RESTRUCTURED').length
    };

    const totalChanges = employeeChanges.length + departmentChanges.length;
    const overallImpact = this.calculateOverallImpact(employeeChanges, departmentChanges);

    return {
      totalChanges,
      employeeChanges: employeeStats,
      departmentChanges: departmentStats,
      overallImpact
    };
  }

  private calculateOverallImpact(
    employeeChanges: EmployeeChange[], 
    departmentChanges: DepartmentChange[]
  ): ChangeImpact {
    const allChanges = [...employeeChanges, ...departmentChanges];
    const highImpactChanges = allChanges.filter(c => 
      c.impact.level === 'HIGH' || c.impact.level === 'CRITICAL'
    ).length;

    let level: ChangeImpact['level'] = 'LOW';
    if (highImpactChanges > 0) {
      level = 'HIGH';
    } else if (allChanges.length > 10) {
      level = 'MEDIUM';
    }

    const totalAffectedEmployees = allChanges.reduce(
      (sum, change) => sum + change.impact.affectedEmployees, 0
    );
    const totalAffectedDepartments = allChanges.reduce(
      (sum, change) => sum + change.impact.affectedDepartments, 0
    );

    return {
      level,
      affectedEmployees: totalAffectedEmployees,
      affectedDepartments: totalAffectedDepartments,
      description: `組織に${allChanges.length}件の変更が適用されました`
    };
  }

  // バージョンの復元
  async restoreVersion(options: RestoreOptions): Promise<OrgVersion | null> {
    const targetVersion = this.getVersion(options.targetVersionId);
    if (!targetVersion) {
      return null;
    }

    // 復元ロジックの実装
    // 実際の実装では、データベースへの書き込みなどが含まれる
    this.currentVersionId = options.targetVersionId;
    
    return targetVersion;
  }

  // バージョンの削除
  deleteVersion(versionId: string): boolean {
    if (this.currentVersionId === versionId) {
      return false; // 現在のバージョンは削除不可
    }
    
    return this.versions.delete(versionId);
  }

  // 統計情報の取得
  getStatistics(): VersionStatistics {
    const versions = this.getAllVersions();
    const activeVersions = versions.filter(v => v.metadata.isActive);

    return {
      totalVersions: versions.length,
      activeVersions: activeVersions.length,
      averageChangesPerVersion: 0, // 実装省略
      mostActiveMonth: '', // 実装省略
      latestVersion: versions[0]?.metadata,
      oldestVersion: versions[versions.length - 1]?.metadata,
      versionGrowthTrend: [] // 実装省略
    };
  }

  // ユーティリティメソッド
  private generateVersionId(): string {
    return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getFieldType(value: unknown): FieldChange['fieldType'] {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    if (Array.isArray(value)) return 'array';
    return 'object';
  }
}

// シングルトンインスタンス
export const versionManager = new VersionManager();