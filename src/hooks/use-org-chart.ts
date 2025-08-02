import { useState, useCallback, useMemo } from 'react';
import { Employee, Department } from '@/types/employee';
import { OrgChartViewOptions } from '@/types/org-chart';
import { generateOrgChartData, getEmployeesByDepartment, getDirectReports, getManagerHierarchy } from '@/lib/org-chart-data';

export interface UseOrgChartProps {
  employees: Employee[];
  departments: Department[];
  initialViewOptions?: Partial<OrgChartViewOptions>;
}

export function useOrgChart({ employees, departments, initialViewOptions }: UseOrgChartProps) {
  const [viewOptions, setViewOptions] = useState<OrgChartViewOptions>({
    viewType: 'full',
    showInactiveEmployees: false,
    ...initialViewOptions,
  });

  const updateViewOptions = useCallback((updates: Partial<OrgChartViewOptions>) => {
    setViewOptions(prev => ({ ...prev, ...updates }));
  }, []);

  const filteredData = useMemo(() => {
    let filteredEmployees = employees.filter(emp => 
      viewOptions.showInactiveEmployees || emp.isActive
    );

    // Apply filters based on view type
    if (viewOptions.viewType === 'department' && viewOptions.departmentFilter) {
      filteredEmployees = getEmployeesByDepartment(filteredEmployees, viewOptions.departmentFilter);
    }
    
    if (viewOptions.levelFilter) {
      const levelData = generateOrgChartData(filteredEmployees, departments);
      filteredEmployees = filteredEmployees.filter(emp => {
        const node = levelData.nodes.find(n => n.id === emp.id);
        return node && node.level === viewOptions.levelFilter;
      });
    }

    if (viewOptions.employeeFilter) {
      const searchTerm = viewOptions.employeeFilter.toLowerCase();
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.firstName.toLowerCase().includes(searchTerm) ||
        emp.lastName.toLowerCase().includes(searchTerm) ||
        emp.position.toLowerCase().includes(searchTerm) ||
        emp.department.toLowerCase().includes(searchTerm)
      );
    }

    return generateOrgChartData(filteredEmployees, departments);
  }, [employees, departments, viewOptions]);

  const stats = useMemo(() => {
    const totalEmployees = filteredData.nodes.length;
    const totalManagers = filteredData.nodes.filter(node => node.isManager).length;
    const activeDepartments = departments.filter(dept => dept.isActive);
    const maxLevel = filteredData.nodes.length > 0 ? Math.max(...filteredData.nodes.map(node => node.level)) : 0;
    
    return {
      totalEmployees,
      totalManagers,
      totalDepartments: activeDepartments.length,
      maxLevel,
    };
  }, [filteredData, departments]);

  const getEmployeeDetails = useCallback((employeeId: string) => {
    return employees.find(emp => emp.id === employeeId);
  }, [employees]);

  const getEmployeeDirectReports = useCallback((managerId: string) => {
    return getDirectReports(managerId, employees);
  }, [employees]);

  const getEmployeeManagerHierarchy = useCallback((employeeId: string) => {
    return getManagerHierarchy(employeeId, employees);
  }, [employees]);

  return {
    viewOptions,
    updateViewOptions,
    filteredData,
    stats,
    getEmployeeDetails,
    getEmployeeDirectReports,
    getEmployeeManagerHierarchy,
    availableDepartments: departments.filter(dept => dept.isActive),
  };
}