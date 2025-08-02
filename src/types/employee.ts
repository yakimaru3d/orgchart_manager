export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  joinDate: Date;
  department: string;
  position: string;
  managerId?: string;
  profileImage?: string;
  phoneNumber?: string;
  birthDate?: Date;
  address?: string;
  emergencyContact?: string;
  skills?: string[];
  bio?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeHistory {
  id: string;
  employeeId: string;
  type: 'DEPARTMENT_CHANGE' | 'POSITION_CHANGE' | 'PROMOTION';
  fromValue: string;
  toValue: string;
  effectiveDate: Date;
  notes?: string;
  createdAt: Date;
}

export interface Department {
  id: string;
  name: string;
  parentId?: string;
  managerId?: string;
  level: number;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentWithEmployees extends Department {
  employees: Employee[];
  manager?: Employee;
  parentDepartment?: Department;
  childDepartments?: Department[];
}

export interface EmployeeFilters {
  name?: string;
  department?: string;
  position?: string;
  joinYear?: number;
  isActive?: boolean;
}