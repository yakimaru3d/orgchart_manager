import { useState, useEffect, useCallback } from 'react';
import { Employee, EmployeeFilters, EmployeeHistory } from '@/types/employee';
import { EmployeeService } from '@/lib/services/employee-service';
import { useAuth } from '@/contexts/auth-context';

export function useEmployees() {
  const { tenantId } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async (filters?: EmployeeFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await EmployeeService.getAll(tenantId, filters);
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const createEmployee = useCallback(async (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newEmployee = await EmployeeService.create(employee, tenantId);
      setEmployees(prev => [...prev, newEmployee]);
      return newEmployee;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create employee');
    }
  }, [tenantId]);

  const updateEmployee = useCallback(async (id: string, updates: Partial<Employee>) => {
    try {
      const updatedEmployee = await EmployeeService.update(id, updates, tenantId);
      setEmployees(prev => prev.map(emp => emp.id === id ? updatedEmployee : emp));
      return updatedEmployee;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update employee');
    }
  }, [tenantId]);

  const deleteEmployee = useCallback(async (id: string) => {
    try {
      await EmployeeService.delete(id, tenantId);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete employee');
    }
  }, [tenantId]);

  const getEmployeeById = useCallback(async (id: string): Promise<Employee | null> => {
    try {
      return await EmployeeService.getById(id, tenantId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch employee');
    }
  }, [tenantId]);

  const getDirectReports = useCallback(async (managerId: string): Promise<Employee[]> => {
    try {
      return await EmployeeService.getDirectReports(managerId, tenantId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch direct reports');
    }
  }, [tenantId]);

  const getByDepartment = useCallback(async (department: string): Promise<Employee[]> => {
    try {
      return await EmployeeService.getByDepartment(department, tenantId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch employees by department');
    }
  }, [tenantId]);

  const recordHistory = useCallback(async (
    employeeId: string,
    type: EmployeeHistory['type'],
    fromValue: string,
    toValue: string,
    effectiveDate: Date,
    notes?: string
  ) => {
    try {
      await EmployeeService.recordHistory(employeeId, type, fromValue, toValue, effectiveDate, tenantId, notes);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to record employee history');
    }
  }, [tenantId]);

  const getHistory = useCallback(async (employeeId: string): Promise<EmployeeHistory[]> => {
    try {
      return await EmployeeService.getHistory(employeeId, tenantId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch employee history');
    }
  }, [tenantId]);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    getDirectReports,
    getByDepartment,
    recordHistory,
    getHistory,
  };
}

export function useEmployee(id: string) {
  const { tenantId } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await EmployeeService.getById(id, tenantId);
        setEmployee(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch employee');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployee();
    }
  }, [id, tenantId]);

  return { employee, loading, error };
}