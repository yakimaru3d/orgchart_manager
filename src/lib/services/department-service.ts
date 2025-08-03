import { supabase } from '../supabase';
import type { Department, DepartmentWithEmployees } from '@/types/employee';
import type { Database } from '../supabase';
import { EmployeeService } from './employee-service';
import { mockDepartments } from '../mock-data';

type SupabaseDepartment = Database['public']['Tables']['departments']['Row'];
type SupabaseDepartmentInsert = Database['public']['Tables']['departments']['Insert'];
type SupabaseDepartmentUpdate = Database['public']['Tables']['departments']['Update'];

export class DepartmentService {
  // 部門データの型変換
  private static mapFromSupabase(data: SupabaseDepartment): Department {
    return {
      id: data.id,
      name: data.name,
      parentId: data.parent_id || undefined,
      managerId: data.manager_id || undefined,
      level: data.level,
      description: data.description || undefined,
      color: data.color || undefined,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static mapToSupabase(department: Partial<Department>, tenantId: string): SupabaseDepartmentInsert | SupabaseDepartmentUpdate {
    const mapped: any = {
      tenant_id: tenantId,
    };

    if (department.name !== undefined) mapped.name = department.name;
    if (department.parentId !== undefined) mapped.parent_id = department.parentId;
    if (department.managerId !== undefined) mapped.manager_id = department.managerId;
    if (department.level !== undefined) mapped.level = department.level;
    if (department.description !== undefined) mapped.description = department.description;
    if (department.color !== undefined) mapped.color = department.color;
    if (department.isActive !== undefined) mapped.is_active = department.isActive;

    return mapped;
  }

  // 全部門取得
  static async getAll(tenantId: string): Promise<Department[]> {
    try {
      
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('level')
        .order('name');

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      return data?.map(this.mapFromSupabase) || [];
    } catch (error) {
      console.error('❌ Error fetching departments:', error);
      
      // フォールバック: Supabaseエラーの場合のみモックデータを使用
      return [...mockDepartments]
        .filter(dept => dept.isActive)
        .sort((a, b) => {
          if (a.level !== b.level) return a.level - b.level;
          return a.name.localeCompare(b.name);
        });
    }
  }

  // 部門取得（ID指定）
  static async getById(id: string, tenantId: string): Promise<Department | null> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return this.mapFromSupabase(data);
    } catch (error) {
      console.error('Error fetching department:', error);
      throw error;
    }
  }

  // 従業員付き部門取得
  static async getWithEmployees(tenantId: string): Promise<DepartmentWithEmployees[]> {
    try {
      const [departments, employees] = await Promise.all([
        this.getAll(tenantId),
        EmployeeService.getAll(tenantId, { isActive: true })
      ]);

      return departments.map(dept => {
        const departmentEmployees = employees.filter(emp => emp.department === dept.name);
        const manager = dept.managerId ? employees.find(emp => emp.id === dept.managerId) : undefined;
        const parentDepartment = dept.parentId ? departments.find(d => d.id === dept.parentId) : undefined;
        const childDepartments = departments.filter(d => d.parentId === dept.id);

        return {
          ...dept,
          employees: departmentEmployees,
          manager,
          parentDepartment,
          childDepartments,
        };
      });
    } catch (error) {
      console.error('Error fetching departments with employees:', error);
      throw error;
    }
  }

  // 部門作成
  static async create(department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>, tenantId: string): Promise<Department> {
    try {
      const insertData = this.mapToSupabase(department, tenantId) as SupabaseDepartmentInsert;
      
      const { data, error } = await supabase
        .from('departments')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return this.mapFromSupabase(data);
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  }

  // 部門更新
  static async update(id: string, updates: Partial<Department>, tenantId: string): Promise<Department> {
    try {
      const updateData = this.mapToSupabase(updates, tenantId) as SupabaseDepartmentUpdate;
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('departments')
        .update(updateData)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw error;
      return this.mapFromSupabase(data);
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  }

  // 部門削除（論理削除）
  static async delete(id: string, tenantId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('departments')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  }

  // 子部門取得
  static async getChildren(parentId: string, tenantId: string): Promise<Department[]> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('parent_id', parentId)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data.map(this.mapFromSupabase);
    } catch (error) {
      console.error('Error fetching child departments:', error);
      throw error;
    }
  }

  // 階層構造取得
  static async getHierarchy(tenantId: string): Promise<Department[]> {
    try {
      const departments = await this.getAll(tenantId);
      
      // 親部門から開始して階層構造を構築
      const buildHierarchy = (parentId?: string, level = 0): Department[] => {
        return departments
          .filter(dept => dept.parentId === parentId)
          .map(dept => ({
            ...dept,
            level,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
      };

      // ルート部門から階層を構築
      const hierarchy: Department[] = [];
      const processLevel = (parentId?: string, currentLevel = 0) => {
        const levelDepartments = buildHierarchy(parentId, currentLevel);
        hierarchy.push(...levelDepartments);
        
        // 子部門を再帰的に処理
        levelDepartments.forEach(dept => {
          processLevel(dept.id, currentLevel + 1);
        });
      };

      processLevel();
      return hierarchy;
    } catch (error) {
      console.error('Error building department hierarchy:', error);
      throw error;
    }
  }

  // 部門パス取得（親→子の順）
  static async getDepartmentPath(departmentId: string, tenantId: string): Promise<Department[]> {
    try {
      const departments = await this.getAll(tenantId);
      const departmentMap = new Map(departments.map(d => [d.id, d]));
      
      const path: Department[] = [];
      let currentDept = departmentMap.get(departmentId);
      
      while (currentDept) {
        path.unshift(currentDept);
        currentDept = currentDept.parentId ? departmentMap.get(currentDept.parentId) : undefined;
      }
      
      return path;
    } catch (error) {
      console.error('Error getting department path:', error);
      throw error;
    }
  }
}