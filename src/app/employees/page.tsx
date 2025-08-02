'use client';

import { useState } from 'react';
import { Employee } from '@/types/employee';
import { mockEmployees } from '@/lib/mock-data';
import DashboardLayout from '@/components/layout/dashboard-layout';
import EmployeeList from '@/components/employees/employee-list';
import EmployeeDetail from '@/components/employees/employee-detail';
import EmployeeForm from '@/components/employees/employee-form';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDetail(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleSaveEmployee = (employeeData: Partial<Employee>) => {
    if (editingEmployee) {
      // Update existing employee
      setEmployees(prev => 
        prev.map(emp => 
          emp.id === editingEmployee.id 
            ? { ...emp, ...employeeData, updatedAt: new Date() }
            : emp
        )
      );
    } else {
      // Add new employee
      const newEmployee: Employee = {
        id: Date.now().toString(),
        employeeId: `EMP${String(employees.length + 1).padStart(3, '0')}`,
        firstName: employeeData.firstName!,
        lastName: employeeData.lastName!,
        email: employeeData.email!,
        joinDate: employeeData.joinDate!,
        department: employeeData.department!,
        position: employeeData.position!,
        profileImage: employeeData.profileImage || null,
        phoneNumber: employeeData.phoneNumber || null,
        birthDate: employeeData.birthDate || null,
        address: employeeData.address || null,
        emergencyContact: employeeData.emergencyContact || null,
        skills: employeeData.skills || [],
        bio: employeeData.bio || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setEmployees(prev => [...prev, newEmployee]);
    }
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedEmployee(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  return (
    <DashboardLayout>
      <EmployeeList
        employees={employees}
        onViewEmployee={handleViewEmployee}
        onEditEmployee={handleEditEmployee}
        onAddEmployee={handleAddEmployee}
      />

      <EmployeeDetail
        employee={selectedEmployee}
        isOpen={showDetail}
        onClose={handleCloseDetail}
        onEdit={handleEditEmployee}
      />

      <EmployeeForm
        employee={editingEmployee}
        isOpen={showForm}
        onClose={handleCloseForm}
        onSave={handleSaveEmployee}
      />
    </DashboardLayout>
  );
}