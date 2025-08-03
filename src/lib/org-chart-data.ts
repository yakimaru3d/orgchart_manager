import { OrgNode, OrgChartData, OrgEdge } from '@/types/org-chart';
import { Employee, Department } from '@/types/employee';

export function generateOrgChartData(employees: Employee[]): OrgChartData {
  // Create org nodes from employees
  const nodes: OrgNode[] = employees.map(employee => ({
    id: employee.id,
    employeeId: employee.employeeId,
    name: `${employee.firstName} ${employee.lastName}`,
    position: employee.position,
    department: employee.department,
    email: employee.email,
    profileImage: employee.profileImage || undefined,
    isManager: isEmployeeManager(employee, employees),
    level: calculateEmployeeLevel(employee, employees),
    parentId: employee.managerId,
  }));

  // Create edges based on reporting relationships
  const edges: OrgEdge[] = [];
  nodes.forEach(node => {
    if (node.parentId) {
      edges.push({
        id: `${node.parentId}-${node.id}`,
        source: node.parentId,
        target: node.id,
        type: 'reports-to',
      });
    }
  });

  return { nodes, edges };
}

function isEmployeeManager(employee: Employee, employees: Employee[]): boolean {
  return employees.some(emp => emp.managerId === employee.id);
}

function calculateEmployeeLevel(employee: Employee, employees: Employee[]): number {
  let level = 1;
  let currentEmployee = employee;
  
  // Traverse up the management chain to calculate level
  while (currentEmployee.managerId) {
    const manager = employees.find(emp => emp.id === currentEmployee.managerId);
    if (!manager) break;
    level++;
    currentEmployee = manager;
    
    // Prevent infinite loops
    if (level > 10) break;
  }
  
  return level;
}

export function getEmployeesByDepartment(employees: Employee[], departmentName: string): Employee[] {
  return employees.filter(emp => emp.department === departmentName && emp.isActive);
}

export function getDirectReports(managerId: string, employees: Employee[]): Employee[] {
  return employees.filter(emp => emp.managerId === managerId && emp.isActive);
}

export function getManagerHierarchy(employeeId: string, employees: Employee[]): Employee[] {
  const hierarchy: Employee[] = [];
  let currentEmployee = employees.find(emp => emp.id === employeeId);
  
  while (currentEmployee?.managerId) {
    const manager = employees.find(emp => emp.id === currentEmployee!.managerId);
    if (!manager) break;
    hierarchy.push(manager);
    currentEmployee = manager;
    
    // Prevent infinite loops
    if (hierarchy.length > 10) break;
  }
  
  return hierarchy;
}

export function buildDepartmentTree(departments: Department[]): Department[] {
  const departmentMap = new Map<string, Department & { children: Department[] }>();
  
  // Initialize map with all departments
  departments.forEach(dept => {
    departmentMap.set(dept.id, { ...dept, children: [] });
  });
  
  // Build tree structure
  const rootDepartments: Department[] = [];
  departments.forEach(dept => {
    const deptWithChildren = departmentMap.get(dept.id)!;
    
    if (dept.parentId) {
      const parent = departmentMap.get(dept.parentId);
      if (parent) {
        parent.children.push(deptWithChildren);
      }
    } else {
      rootDepartments.push(deptWithChildren);
    }
  });
  
  return rootDepartments;
}