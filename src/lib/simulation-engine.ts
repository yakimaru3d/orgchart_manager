import {
  OrgSimulation,
  SimulationMetadata,
  SimulationConfig,
  OrgChangeAction,
  OrgChangeType,
  SimulationContext,
  SimulationResults,
  ScenarioResult,
  SimulationMetrics,
  SimulationConflict,
  SimulationWarning,
  Recommendation,
  WhatIfAnalysis,
  WhatIfResult,
  SimulationExecutionOptions,
  SimulationTemplate
} from '@/types/simulation';
import { OrgVersion, VersionMetadata, ChangeImpact } from '@/types/version';
import { Employee, Department } from '@/types/employee';
import { versionManager } from './version-manager';
import { generateOrgChartData } from './org-chart-data';

export class SimulationEngine {
  private simulations: Map<string, OrgSimulation> = new Map();
  private templates: Map<string, SimulationTemplate> = new Map();

  constructor() {
    this.loadDefaultTemplates();
  }

  // シミュレーションの作成
  async createSimulation(
    baseVersionId: string,
    name: string,
    description?: string,
    config?: Partial<SimulationConfig>
  ): Promise<OrgSimulation | null> {
    const baseVersion = versionManager.getVersion(baseVersionId);
    if (!baseVersion) {
      return null;
    }

    const simulationId = this.generateSimulationId();
    const defaultConfig: SimulationConfig = {
      allowConflicts: false,
      autoResolveConflicts: true,
      validateConstraints: true,
      trackDependencies: true,
      enableRollback: true,
      maxChangesPerEmployee: 5,
      simulationDuration: 365
    };

    const metadata: SimulationMetadata = {
      id: simulationId,
      name,
      description,
      createdAt: new Date(),
      createdBy: 'user', // 実際の実装では認証システムから取得
      lastModified: new Date(),
      tags: [],
      isTemplate: false,
      baseVersionId,
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年後
      status: 'DRAFT'
    };

    const simulation: OrgSimulation = {
      metadata,
      config: { ...defaultConfig, ...config },
      baseVersion,
      actions: [],
      scenarios: []
    };

    this.simulations.set(simulationId, simulation);
    return simulation;
  }

  // アクションの追加
  addAction(simulationId: string, action: Omit<OrgChangeAction, 'id'>): boolean {
    const simulation = this.simulations.get(simulationId);
    if (!simulation) {
      return false;
    }

    const actionWithId: OrgChangeAction = {
      ...action,
      id: this.generateActionId()
    };

    // 制約検証
    if (simulation.config.validateConstraints) {
      const validation = this.validateAction(actionWithId, simulation);
      if (!validation.valid) {
        return false;
      }
    }

    simulation.actions.push(actionWithId);
    simulation.metadata.lastModified = new Date();
    return true;
  }

  // シミュレーションの実行
  async executeSimulation(
    simulationId: string,
    options: SimulationExecutionOptions = { mode: 'FULL', stopOnError: false, generateReport: true, saveResults: true, notifyOnCompletion: false, parallelExecution: false, maxParallelActions: 3 }
  ): Promise<SimulationResults | null> {
    const simulation = this.simulations.get(simulationId);
    if (!simulation) {
      return null;
    }

    const startTime = Date.now();
    const context: SimulationContext = {
      simulation,
      currentState: this.cloneVersion(simulation.baseVersion),
      executedActions: [],
      pendingActions: [...simulation.actions],
      conflicts: [],
      metrics: this.initializeMetrics()
    };

    try {
      // アクションの実行順序を決定
      const sortedActions = this.sortActionsByPriority(context.pendingActions);
      
      // アクションを順次実行
      for (const action of sortedActions) {
        const result = await this.executeAction(action, context);
        
        if (result.success) {
          context.executedActions.push(action);
          context.pendingActions = context.pendingActions.filter(a => a.id !== action.id);
          this.updateMetrics(context.metrics, action, result);
        } else {
          context.conflicts.push(...result.conflicts);
          
          if (options.stopOnError) {
            break;
          }
        }
      }

      // シナリオ結果の生成
      const scenarioResults: ScenarioResult[] = [];
      if (simulation.scenarios.length > 0) {
        for (const scenario of simulation.scenarios) {
          const scenarioResult = await this.executeScenario(scenario, context);
          scenarioResults.push(scenarioResult);
        }
      }

      // 結果の作成
      const results: SimulationResults = {
        simulationId,
        executedAt: new Date(),
        finalState: context.currentState,
        scenarios: scenarioResults,
        overallMetrics: context.metrics,
        recommendations: this.generateRecommendations(context),
        warnings: this.generateWarnings(context),
        conflicts: context.conflicts
      };

      if (options.saveResults) {
        simulation.results = results;
        simulation.metadata.status = 'COMPLETED';
      }

      return results;

    } catch (error) {
      console.error('Simulation execution failed:', error);
      return null;
    }
  }

  // 単一アクションの実行
  private async executeAction(
    action: OrgChangeAction,
    context: SimulationContext
  ): Promise<{ success: boolean; conflicts: SimulationConflict[] }> {
    const conflicts: SimulationConflict[] = [];

    try {
      switch (action.type) {
        case 'HIRE_EMPLOYEE':
          return this.executeHireEmployee(action, context);
        case 'TERMINATE_EMPLOYEE':
          return this.executeTerminateEmployee(action, context);
        case 'PROMOTE_EMPLOYEE':
          return this.executePromoteEmployee(action, context);
        case 'TRANSFER_EMPLOYEE':
          return this.executeTransferEmployee(action, context);
        case 'CHANGE_DEPARTMENT':
          return this.executeChangeDepartment(action, context);
        case 'CREATE_DEPARTMENT':
          return this.executeCreateDepartment(action, context);
        case 'DISSOLVE_DEPARTMENT':
          return this.executeDissolveDepartment(action, context);
        default:
          return { success: false, conflicts: [this.createUnsupportedActionConflict(action)] };
      }
    } catch (error) {
      conflicts.push(this.createExecutionErrorConflict(action, error as Error));
      return { success: false, conflicts };
    }
  }

  // 従業員採用の実行
  private executeHireEmployee(
    action: OrgChangeAction,
    context: SimulationContext
  ): { success: boolean; conflicts: SimulationConflict[] } {
    const params = action.parameters;
    const conflicts: SimulationConflict[] = [];

    // 新しい従業員の作成
    const newEmployee: Employee = {
      id: params.employeeId || this.generateEmployeeId(),
      employeeId: params.employeeNumber || this.generateEmployeeNumber(),
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      joinDate: action.effectiveDate,
      department: params.department,
      position: params.position,
      managerId: params.managerId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // バリデーション
    if (this.employeeExists(newEmployee.id, context.currentState)) {
      conflicts.push(this.createDuplicateEmployeeConflict(action, newEmployee.id));
      return { success: false, conflicts };
    }

    // 従業員を追加
    context.currentState.employees.push({
      ...newEmployee,
      versionId: context.currentState.metadata.id,
      effectiveDate: action.effectiveDate,
      changeType: 'CREATE'
    });

    // 統計を更新
    context.currentState.statistics.totalEmployees++;

    return { success: true, conflicts: [] };
  }

  // 従業員退職の実行
  private executeTerminateEmployee(
    action: OrgChangeAction,
    context: SimulationContext
  ): { success: boolean; conflicts: SimulationConflict[] } {
    const employeeId = action.targetId;
    const employeeIndex = context.currentState.employees.findIndex(emp => emp.id === employeeId);
    
    if (employeeIndex === -1) {
      return { 
        success: false, 
        conflicts: [this.createEmployeeNotFoundConflict(action, employeeId)] 
      };
    }

    // 従業員を非アクティブに設定
    context.currentState.employees[employeeIndex].isActive = false;
    context.currentState.employees[employeeIndex].changeType = 'UPDATE';
    context.currentState.employees[employeeIndex].effectiveDate = action.effectiveDate;

    // 統計を更新
    context.currentState.statistics.totalEmployees--;

    return { success: true, conflicts: [] };
  }

  // 従業員昇進の実行
  private executePromoteEmployee(
    action: OrgChangeAction,
    context: SimulationContext
  ): { success: boolean; conflicts: SimulationConflict[] } {
    const employeeId = action.targetId;
    const employee = context.currentState.employees.find(emp => emp.id === employeeId);
    
    if (!employee) {
      return { 
        success: false, 
        conflicts: [this.createEmployeeNotFoundConflict(action, employeeId)] 
      };
    }

    // 昇進処理
    if (action.parameters.newPosition) {
      employee.position = action.parameters.newPosition;
    }
    if (action.parameters.newManagerId) {
      employee.managerId = action.parameters.newManagerId;
    }
    if (action.parameters.newDepartment) {
      employee.department = action.parameters.newDepartment;
    }

    employee.changeType = 'UPDATE';
    employee.effectiveDate = action.effectiveDate;
    employee.updatedAt = new Date();

    return { success: true, conflicts: [] };
  }

  // 従業員異動の実行
  private executeTransferEmployee(
    action: OrgChangeAction,
    context: SimulationContext
  ): { success: boolean; conflicts: SimulationConflict[] } {
    const employeeId = action.targetId;
    const employee = context.currentState.employees.find(emp => emp.id === employeeId);
    
    if (!employee) {
      return { 
        success: false, 
        conflicts: [this.createEmployeeNotFoundConflict(action, employeeId)] 
      };
    }

    // 異動処理
    employee.department = action.parameters.newDepartment;
    if (action.parameters.newManagerId) {
      employee.managerId = action.parameters.newManagerId;
    }
    if (action.parameters.newPosition) {
      employee.position = action.parameters.newPosition;
    }

    employee.changeType = 'UPDATE';
    employee.effectiveDate = action.effectiveDate;
    employee.updatedAt = new Date();

    return { success: true, conflicts: [] };
  }

  // 部署変更の実行
  private executeChangeDepartment(
    action: OrgChangeAction,
    context: SimulationContext
  ): { success: boolean; conflicts: SimulationConflict[] } {
    const departmentId = action.targetId;
    const department = context.currentState.departments.find(dept => dept.id === departmentId);
    
    if (!department) {
      return { 
        success: false, 
        conflicts: [this.createDepartmentNotFoundConflict(action, departmentId)] 
      };
    }

    // 部署情報を更新
    Object.assign(department, action.parameters);
    department.changeType = 'UPDATE';
    department.effectiveDate = action.effectiveDate;
    department.updatedAt = new Date();

    return { success: true, conflicts: [] };
  }

  // 部署作成の実行
  private executeCreateDepartment(
    action: OrgChangeAction,
    context: SimulationContext
  ): { success: boolean; conflicts: SimulationConflict[] } {
    const params = action.parameters;
    const conflicts: SimulationConflict[] = [];

    const newDepartment: Department = {
      id: params.departmentId || this.generateDepartmentId(),
      name: params.name,
      parentId: params.parentId,
      managerId: params.managerId,
      level: params.level || 1,
      description: params.description,
      color: params.color,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // バリデーション
    if (this.departmentExists(newDepartment.id, context.currentState)) {
      conflicts.push(this.createDuplicateDepartmentConflict(action, newDepartment.id));
      return { success: false, conflicts };
    }

    // 部署を追加
    context.currentState.departments.push({
      ...newDepartment,
      versionId: context.currentState.metadata.id,
      effectiveDate: action.effectiveDate,
      changeType: 'CREATE'
    });

    // 統計を更新
    context.currentState.statistics.totalDepartments++;

    return { success: true, conflicts: [] };
  }

  // 部署解散の実行
  private executeDissolveDepartment(
    action: OrgChangeAction,
    context: SimulationContext
  ): { success: boolean; conflicts: SimulationConflict[] } {
    const departmentId = action.targetId;
    const departmentIndex = context.currentState.departments.findIndex(dept => dept.id === departmentId);
    
    if (departmentIndex === -1) {
      return { 
        success: false, 
        conflicts: [this.createDepartmentNotFoundConflict(action, departmentId)] 
      };
    }

    // 部署に所属する従業員をチェック
    const employeesInDepartment = context.currentState.employees.filter(
      emp => emp.department === context.currentState.departments[departmentIndex].name && emp.isActive
    );

    if (employeesInDepartment.length > 0 && !action.parameters.forceDissolve) {
      return {
        success: false,
        conflicts: [this.createDepartmentNotEmptyConflict(action, departmentId, employeesInDepartment.length)]
      };
    }

    // 部署を非アクティブに設定
    context.currentState.departments[departmentIndex].isActive = false;
    context.currentState.departments[departmentIndex].changeType = 'UPDATE';
    context.currentState.departments[departmentIndex].effectiveDate = action.effectiveDate;

    // 統計を更新
    context.currentState.statistics.totalDepartments--;

    return { success: true, conflicts: [] };
  }

  // What-if分析の実行
  async executeWhatIfAnalysis(
    simulationId: string,
    analysis: Omit<WhatIfAnalysis, 'id' | 'results' | 'createdAt'>
  ): Promise<WhatIfAnalysis | null> {
    const simulation = this.simulations.get(simulationId);
    if (!simulation) {
      return null;
    }

    const analysisId = this.generateAnalysisId();
    const results: WhatIfResult[] = [];

    // 各変数の組み合わせでシミュレーションを実行
    for (const variable of analysis.variables) {
      for (const testValue of variable.testValues) {
        // 変数値を適用したシミュレーションを作成
        const modifiedSimulation = this.applyVariableToSimulation(
          simulation, 
          variable.name, 
          testValue
        );

        // シミュレーションを実行
        const executionResult = await this.executeSimulation(
          modifiedSimulation.metadata.id,
          { mode: 'FULL', stopOnError: false, generateReport: false, saveResults: false, notifyOnCompletion: false, parallelExecution: false, maxParallelActions: 3 }
        );

        if (executionResult) {
          const score = this.calculateScenarioScore(executionResult);
          results.push({
            variableValues: { [variable.name]: testValue },
            metrics: executionResult.overallMetrics,
            outcome: executionResult.scenarios[0] || this.createDefaultScenarioResult(),
            score,
            ranking: 0 // 後で計算
          });
        }
      }
    }

    // 結果をスコア順にランキング
    results.sort((a, b) => b.score - a.score);
    results.forEach((result, index) => {
      result.ranking = index + 1;
    });

    const whatIfAnalysis: WhatIfAnalysis = {
      id: analysisId,
      name: analysis.name,
      description: analysis.description,
      baseScenario: analysis.baseScenario,
      variables: analysis.variables,
      results,
      createdAt: new Date()
    };

    return whatIfAnalysis;
  }

  // ヘルパーメソッド
  private cloneVersion(version: OrgVersion): OrgVersion {
    return JSON.parse(JSON.stringify(version));
  }

  private sortActionsByPriority(actions: OrgChangeAction[]): OrgChangeAction[] {
    return [...actions].sort((a, b) => b.priority - a.priority);
  }

  private initializeMetrics(): SimulationMetrics {
    return {
      totalChanges: 0,
      successfulChanges: 0,
      failedChanges: 0,
      conflictCount: 0,
      employeeImpact: {
        affected: 0,
        promoted: 0,
        transferred: 0,
        hired: 0,
        terminated: 0
      },
      departmentImpact: {
        affected: 0,
        created: 0,
        dissolved: 0,
        restructured: 0
      },
      budgetImpact: {
        salaryChanges: 0,
        recruitmentCosts: 0,
        trainingCosts: 0,
        severanceCosts: 0,
        totalImpact: 0
      },
      timelineMetrics: {
        averageExecutionTime: 0,
        longestAction: 0,
        criticalPath: []
      }
    };
  }

  private updateMetrics(
    metrics: SimulationMetrics, 
    action: OrgChangeAction, 
    result: { success: boolean }
  ): void {
    metrics.totalChanges++;
    if (result.success) {
      metrics.successfulChanges++;
    } else {
      metrics.failedChanges++;
    }

    // アクションタイプ別の統計更新
    switch (action.type) {
      case 'HIRE_EMPLOYEE':
        metrics.employeeImpact.hired++;
        break;
      case 'TERMINATE_EMPLOYEE':
        metrics.employeeImpact.terminated++;
        break;
      case 'PROMOTE_EMPLOYEE':
        metrics.employeeImpact.promoted++;
        break;
      case 'TRANSFER_EMPLOYEE':
        metrics.employeeImpact.transferred++;
        break;
      case 'CREATE_DEPARTMENT':
        metrics.departmentImpact.created++;
        break;
      case 'DISSOLVE_DEPARTMENT':
        metrics.departmentImpact.dissolved++;
        break;
    }
  }

  // 競合作成ヘルパー
  private createEmployeeNotFoundConflict(action: OrgChangeAction, employeeId: string): SimulationConflict {
    return {
      id: this.generateConflictId(),
      type: 'RESOURCE_CONFLICT',
      severity: 'HIGH',
      description: `従業員 ${employeeId} が見つかりません`,
      conflictingActions: [action.id],
      resolutionOptions: [],
      autoResolvable: false,
      resolved: false
    };
  }

  private createDepartmentNotFoundConflict(action: OrgChangeAction, departmentId: string): SimulationConflict {
    return {
      id: this.generateConflictId(),
      type: 'RESOURCE_CONFLICT',
      severity: 'HIGH',
      description: `部署 ${departmentId} が見つかりません`,
      conflictingActions: [action.id],
      resolutionOptions: [],
      autoResolvable: false,
      resolved: false
    };
  }

  private createDuplicateEmployeeConflict(action: OrgChangeAction, employeeId: string): SimulationConflict {
    return {
      id: this.generateConflictId(),
      type: 'CONSTRAINT_CONFLICT',
      severity: 'MEDIUM',
      description: `従業員 ${employeeId} は既に存在します`,
      conflictingActions: [action.id],
      resolutionOptions: [],
      autoResolvable: true,
      resolved: false
    };
  }

  private createDuplicateDepartmentConflict(action: OrgChangeAction, departmentId: string): SimulationConflict {
    return {
      id: this.generateConflictId(),
      type: 'CONSTRAINT_CONFLICT',
      severity: 'MEDIUM',
      description: `部署 ${departmentId} は既に存在します`,
      conflictingActions: [action.id],
      resolutionOptions: [],
      autoResolvable: true,
      resolved: false
    };
  }

  private createDepartmentNotEmptyConflict(action: OrgChangeAction, departmentId: string, employeeCount: number): SimulationConflict {
    return {
      id: this.generateConflictId(),
      type: 'CONSTRAINT_CONFLICT',
      severity: 'HIGH',
      description: `部署 ${departmentId} には ${employeeCount} 人の従業員がいるため削除できません`,
      conflictingActions: [action.id],
      resolutionOptions: [],
      autoResolvable: false,
      resolved: false
    };
  }

  private createUnsupportedActionConflict(action: OrgChangeAction): SimulationConflict {
    return {
      id: this.generateConflictId(),
      type: 'CONSTRAINT_CONFLICT',
      severity: 'CRITICAL',
      description: `アクションタイプ ${action.type} はサポートされていません`,
      conflictingActions: [action.id],
      resolutionOptions: [],
      autoResolvable: false,
      resolved: false
    };
  }

  private createExecutionErrorConflict(action: OrgChangeAction, error: Error): SimulationConflict {
    return {
      id: this.generateConflictId(),
      type: 'CONSTRAINT_CONFLICT',
      severity: 'CRITICAL',
      description: `アクション実行中にエラーが発生しました: ${error.message}`,
      conflictingActions: [action.id],
      resolutionOptions: [],
      autoResolvable: false,
      resolved: false
    };
  }

  // バリデーションヘルパー
  private validateAction(action: OrgChangeAction, simulation: OrgSimulation): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 基本的なバリデーション
    if (!action.targetId && this.requiresTargetId(action.type)) {
      errors.push('ターゲットIDが必要です');
    }

    if (!action.effectiveDate) {
      errors.push('有効日が必要です');
    }

    // タイプ別バリデーション
    switch (action.type) {
      case 'HIRE_EMPLOYEE':
        if (!action.parameters.firstName || !action.parameters.lastName) {
          errors.push('従業員の名前が必要です');
        }
        if (!action.parameters.department || !action.parameters.position) {
          errors.push('部署と職位が必要です');
        }
        break;
    }

    return { valid: errors.length === 0, errors };
  }

  private requiresTargetId(actionType: OrgChangeType): boolean {
    const noTargetActions: OrgChangeType[] = ['HIRE_EMPLOYEE', 'CREATE_DEPARTMENT'];
    return !noTargetActions.includes(actionType);
  }

  private employeeExists(employeeId: string, version: OrgVersion): boolean {
    return version.employees.some(emp => emp.id === employeeId);
  }

  private departmentExists(departmentId: string, version: OrgVersion): boolean {
    return version.departments.some(dept => dept.id === departmentId);
  }

  private generateRecommendations(context: SimulationContext): Recommendation[] {
    // 簡略化された推奨事項生成
    return [];
  }

  private generateWarnings(context: SimulationContext): SimulationWarning[] {
    // 簡略化された警告生成
    return [];
  }

  private async executeScenario(scenario: any, context: SimulationContext): Promise<ScenarioResult> {
    // 簡略化されたシナリオ実行
    return this.createDefaultScenarioResult();
  }

  private createDefaultScenarioResult(): ScenarioResult {
    return {
      scenarioId: '',
      scenarioName: '',
      success: true,
      executedActions: [],
      failedActions: [],
      finalState: {} as OrgVersion,
      metrics: this.initializeMetrics(),
      duration: 0,
      impact: { level: 'LOW', affectedEmployees: 0, affectedDepartments: 0, description: '' }
    };
  }

  private applyVariableToSimulation(simulation: OrgSimulation, variableName: string, value: any): OrgSimulation {
    // 簡略化された変数適用
    return simulation;
  }

  private calculateScenarioScore(result: SimulationResults): number {
    // 簡略化されたスコア計算
    return Math.random() * 100;
  }

  private loadDefaultTemplates(): void {
    // デフォルトテンプレートの読み込み
    // 実装省略
  }

  // ID生成ヘルパー
  private generateSimulationId(): string {
    return `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateActionId(): string {
    return `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEmployeeId(): string {
    return `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEmployeeNumber(): string {
    return `EMP${Date.now().toString().slice(-6)}`;
  }

  private generateDepartmentId(): string {
    return `dept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConflictId(): string {
    return `conf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// シングルトンインスタンス
export const simulationEngine = new SimulationEngine();