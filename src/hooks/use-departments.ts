import { useState, useEffect, useCallback } from 'react';
import { Department, DepartmentWithEmployees } from '@/types/employee';
import { DepartmentService } from '@/lib/services/department-service';
import { useAuth } from '@/contexts/auth-context';

export function useDepartments() {
  const { tenantId } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DepartmentService.getAll(tenantId);
      setDepartments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const createDepartment = useCallback(async (department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newDepartment = await DepartmentService.create(department, tenantId);
      setDepartments(prev => [...prev, newDepartment]);
      return newDepartment;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create department');
    }
  }, [tenantId]);

  const updateDepartment = useCallback(async (id: string, updates: Partial<Department>) => {
    try {
      const updatedDepartment = await DepartmentService.update(id, updates, tenantId);
      setDepartments(prev => prev.map(dept => dept.id === id ? updatedDepartment : dept));
      return updatedDepartment;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update department');
    }
  }, [tenantId]);

  const deleteDepartment = useCallback(async (id: string) => {
    try {
      await DepartmentService.delete(id, tenantId);
      setDepartments(prev => prev.filter(dept => dept.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete department');
    }
  }, [tenantId]);

  const getDepartmentById = useCallback(async (id: string): Promise<Department | null> => {
    try {
      return await DepartmentService.getById(id, tenantId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch department');
    }
  }, [tenantId]);

  const getChildren = useCallback(async (parentId: string): Promise<Department[]> => {
    try {
      return await DepartmentService.getChildren(parentId, tenantId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch child departments');
    }
  }, [tenantId]);

  const getHierarchy = useCallback(async (): Promise<Department[]> => {
    try {
      return await DepartmentService.getHierarchy(tenantId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch department hierarchy');
    }
  }, [tenantId]);

  const getDepartmentPath = useCallback(async (departmentId: string): Promise<Department[]> => {
    try {
      return await DepartmentService.getDepartmentPath(departmentId, tenantId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch department path');
    }
  }, [tenantId]);

  return {
    departments,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentById,
    getChildren,
    getHierarchy,
    getDepartmentPath,
  };
}

export function useDepartmentsWithEmployees() {
  const { tenantId } = useAuth();
  const [departmentsWithEmployees, setDepartmentsWithEmployees] = useState<DepartmentWithEmployees[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartmentsWithEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DepartmentService.getWithEmployees(tenantId);
      setDepartmentsWithEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch departments with employees');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchDepartmentsWithEmployees();
  }, [fetchDepartmentsWithEmployees]);

  return {
    departmentsWithEmployees,
    loading,
    error,
    refetch: fetchDepartmentsWithEmployees,
  };
}

export function useDepartment(id: string) {
  const { tenantId } = useAuth();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await DepartmentService.getById(id, tenantId);
        setDepartment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch department');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDepartment();
    }
  }, [id, tenantId]);

  return { department, loading, error };
}