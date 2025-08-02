export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string;
}

export type UserRole = 'SYSTEM_ADMIN' | 'HR_MANAGER' | 'DEPARTMENT_MANAGER' | 'EMPLOYEE';

export interface Session {
  user: User;
  expires: string;
}