import { supabase } from '../supabase';
import type { Employee, EmployeeHistory, EmployeeFilters } from '@/types/employee';
import type { Database } from '../supabase';
import { mockEmployees } from '../mock-data';

type SupabaseEmployee = Database['public']['Tables']['employees']['Row'];
type SupabaseEmployeeInsert = Database['public']['Tables']['employees']['Insert'];
type SupabaseEmployeeUpdate = Database['public']['Tables']['employees']['Update'];

export class EmployeeService {
  // 従業員データの型変換
  private static mapFromSupabase(data: SupabaseEmployee): Employee {
    return {
      id: data.id,
      employeeId: data.employee_id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      joinDate: new Date(data.join_date),
      department: data.department,
      position: data.position,
      managerId: data.manager_id || undefined,
      profileImage: data.profile_image || undefined,
      phoneNumber: data.phone_number || undefined,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static mapToSupabase(employee: Partial<Employee>, tenantId: string): SupabaseEmployeeInsert | SupabaseEmployeeUpdate {
    const mapped: any = {
      tenant_id: tenantId,
    };

    if (employee.employeeId !== undefined) mapped.employee_id = employee.employeeId;
    if (employee.firstName !== undefined) mapped.first_name = employee.firstName;
    if (employee.lastName !== undefined) mapped.last_name = employee.lastName;
    if (employee.email !== undefined) mapped.email = employee.email;
    if (employee.joinDate !== undefined) mapped.join_date = employee.joinDate.toISOString();
    if (employee.department !== undefined) mapped.department = employee.department;
    if (employee.position !== undefined) mapped.position = employee.position;
    if (employee.managerId !== undefined) mapped.manager_id = employee.managerId;
    if (employee.profileImage !== undefined) mapped.profile_image = employee.profileImage;
    if (employee.phoneNumber !== undefined) mapped.phone_number = employee.phoneNumber;
    if (employee.isActive !== undefined) mapped.is_active = employee.isActive;

    return mapped;
  }

  // 全従業員取得
  static async getAll(tenantId: string, filters?: EmployeeFilters): Promise<Employee[]> {
    try {
      
      let query = supabase
        .from('employees')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('first_name');

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.department) {
        query = query.eq('department', filters.department);
      }

      if (filters?.position) {
        query = query.ilike('position', `%${filters.position}%`);
      }

      if (filters?.name) {
        query = query.or(`first_name.ilike.%${filters.name}%,last_name.ilike.%${filters.name}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      return data?.map(this.mapFromSupabase) || [];
    } catch (error) {
      console.error('❌ Error fetching employees:', error);
      
      // フォールバック: Supabaseエラーの場合のみモックデータを使用
      let employees = [...mockEmployees];

      // フィルタを適用
      if (filters?.isActive !== undefined) {
        employees = employees.filter(emp => emp.isActive === filters.isActive);
      }

      if (filters?.department) {
        employees = employees.filter(emp => emp.department === filters.department);
      }

      if (filters?.position) {
        employees = employees.filter(emp => 
          emp.position.toLowerCase().includes(filters.position!.toLowerCase())
        );
      }

      if (filters?.name) {
        const nameFilter = filters.name.toLowerCase();
        employees = employees.filter(emp => 
          emp.firstName.toLowerCase().includes(nameFilter) ||
          emp.lastName.toLowerCase().includes(nameFilter)
        );
      }

      // 名前順でソート
      employees.sort((a, b) => a.firstName.localeCompare(b.firstName));
      
      return employees;
    }
  }

  // 従業員取得（ID指定）
  static async getById(id: string, tenantId: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
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
      console.error('Error fetching employee:', error);
      
      // フォールバック: モックデータを検索
      return mockEmployees.find(emp => emp.id === id) || null;
    }
  }

  // 従業員作成
  static async create(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>, tenantId: string): Promise<Employee> {
    try {
      const insertData = this.mapToSupabase(employee, tenantId) as SupabaseEmployeeInsert;
      
      const { data, error } = await supabase
        .from('employees')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return this.mapFromSupabase(data);
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  // 従業員更新
  static async update(id: string, updates: Partial<Employee>, tenantId: string): Promise<Employee> {
    try {
      const updateData = this.mapToSupabase(updates, tenantId) as SupabaseEmployeeUpdate;
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw error;
      return this.mapFromSupabase(data);
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  // 従業員削除（論理削除）
  static async delete(id: string, tenantId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }

  // 部下従業員取得
  static async getDirectReports(managerId: string, tenantId: string): Promise<Employee[]> {
    // Supabaseが設定されていない場合はモックデータを使用
    if (!this.isSupabaseConfigured()) {
      return mockEmployees
        .filter(emp => emp.managerId === managerId && emp.isActive)
        .sort((a, b) => a.firstName.localeCompare(b.firstName));
    }

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('manager_id', managerId)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      return data.map(this.mapFromSupabase);
    } catch (error) {
      console.error('Error fetching direct reports:', error);
      throw error;
    }
  }

  // 部門別従業員取得
  static async getByDepartment(department: string, tenantId: string): Promise<Employee[]> {
    // Supabaseが設定されていない場合はモックデータを使用
    if (!this.isSupabaseConfigured()) {
      return mockEmployees
        .filter(emp => emp.department === department && emp.isActive)
        .sort((a, b) => a.firstName.localeCompare(b.firstName));
    }

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('department', department)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      return data.map(this.mapFromSupabase);
    } catch (error) {
      console.error('Error fetching employees by department:', error);
      throw error;
    }
  }

  // 履歴記録
  static async recordHistory(
    employeeId: string,
    type: EmployeeHistory['type'],
    fromValue: string,
    toValue: string,
    effectiveDate: Date,
    tenantId: string,
    notes?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('employee_history')
        .insert({
          tenant_id: tenantId,
          employee_id: employeeId,
          type,
          from_value: fromValue,
          to_value: toValue,
          effective_date: effectiveDate.toISOString(),
          notes,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording employee history:', error);
      throw error;
    }
  }

  // 履歴取得
  static async getHistory(employeeId: string, tenantId: string): Promise<EmployeeHistory[]> {
    try {
      const { data, error } = await supabase
        .from('employee_history')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('tenant_id', tenantId)
        .order('effective_date', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        employeeId: item.employee_id,
        type: item.type,
        fromValue: item.from_value,
        toValue: item.to_value,
        effectiveDate: new Date(item.effective_date),
        notes: item.notes || undefined,
        createdAt: new Date(item.created_at),
      }));
    } catch (error) {
      console.error('Error fetching employee history:', error);
      throw error;
    }
  }
}