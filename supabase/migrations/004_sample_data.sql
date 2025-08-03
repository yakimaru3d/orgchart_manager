-- Sample Data for OrgChart Manager
-- This migration adds comprehensive sample data for development and testing

-- First, ensure we have the sample tenant
INSERT INTO tenants (id, name, subdomain, subscription_status) 
VALUES (
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  'TechStartup Inc.',
  'sample-tenant',
  'ACTIVE'
) ON CONFLICT (subdomain) DO UPDATE SET 
  name = EXCLUDED.name,
  subscription_status = EXCLUDED.subscription_status,
  updated_at = NOW();

-- Clear existing sample data
DELETE FROM employees WHERE tenant_id = 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6';
DELETE FROM departments WHERE tenant_id = 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6';

-- Insert departments first (to avoid foreign key constraints)
INSERT INTO departments (id, tenant_id, name, parent_id, level, description, color, is_active) VALUES
-- Root level departments (level 1)
('dept-1', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'Engineering', NULL, 1, 'Software development and technical operations', '#3B82F6', TRUE),
('dept-2', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'Sales', NULL, 1, 'Sales and business development', '#10B981', TRUE),
('dept-3', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'Marketing', NULL, 1, 'Marketing and brand management', '#F59E0B', TRUE),
('dept-4', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'HR', NULL, 1, 'Human resources and people operations', '#EF4444', TRUE),
('dept-5', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'Finance', NULL, 1, 'Finance and accounting', '#8B5CF6', TRUE),
('dept-6', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'Operations', NULL, 1, 'Business operations and support', '#06B6D4', TRUE),

-- Sub-departments (level 2)
('dept-7', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'Frontend Team', 'dept-1', 2, 'Frontend development team', '#3B82F6', TRUE),
('dept-8', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'Backend Team', 'dept-1', 2, 'Backend development team', '#3B82F6', TRUE),
('dept-9', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'DevOps Team', 'dept-1', 2, 'DevOps and infrastructure team', '#3B82F6', TRUE),
('dept-10', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'Enterprise Sales', 'dept-2', 2, 'Enterprise customer sales', '#10B981', TRUE),
('dept-11', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'SMB Sales', 'dept-2', 2, 'Small and medium business sales', '#10B981', TRUE),
('dept-12', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'Digital Marketing', 'dept-3', 2, 'Digital marketing and social media', '#F59E0B', TRUE),
('dept-13', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'Content Team', 'dept-3', 2, 'Content creation and strategy', '#F59E0B', TRUE);

-- Insert employees
INSERT INTO employees (id, tenant_id, employee_id, first_name, last_name, email, join_date, department, position, manager_id, phone_number, is_active) VALUES
-- C-Level (Top level)
('1', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP001', 'Michael', 'Chen', 'michael.chen@company.com', '2020-01-01', 'Operations', 'CEO', NULL, '+1-555-0101', TRUE),

-- VPs and Directors (Second level)
('2', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP002', 'Sarah', 'Wilson', 'sarah.wilson@company.com', '2020-02-15', 'Engineering', 'CTO', '1', '+1-555-0102', TRUE),
('3', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP003', 'David', 'Rodriguez', 'david.rodriguez@company.com', '2020-03-01', 'Sales', 'VP of Sales', '1', '+1-555-0103', TRUE),
('4', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP004', 'Jennifer', 'Kim', 'jennifer.kim@company.com', '2020-04-10', 'Marketing', 'VP of Marketing', '1', '+1-555-0104', TRUE),
('5', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP005', 'Robert', 'Thompson', 'robert.thompson@company.com', '2020-05-01', 'HR', 'VP of People', '1', '+1-555-0105', TRUE),
('6', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP006', 'Lisa', 'Anderson', 'lisa.anderson@company.com', '2020-06-15', 'Finance', 'CFO', '1', '+1-555-0106', TRUE),

-- Engineering Team
('7', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP007', 'Alex', 'Johnson', 'alex.johnson@company.com', '2021-01-15', 'Engineering', 'Engineering Manager', '2', '+1-555-0107', TRUE),
('8', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP008', 'Emma', 'Davis', 'emma.davis@company.com', '2021-02-01', 'Engineering', 'Frontend Lead', '7', '+1-555-0108', TRUE),
('9', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP009', 'James', 'Miller', 'james.miller@company.com', '2021-03-01', 'Engineering', 'Backend Lead', '7', '+1-555-0109', TRUE),
('10', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP010', 'Sophie', 'Brown', 'sophie.brown@company.com', '2021-04-01', 'Engineering', 'DevOps Lead', '7', '+1-555-0110', TRUE),
('11', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP011', 'Daniel', 'Garcia', 'daniel.garcia@company.com', '2022-01-15', 'Engineering', 'Senior Frontend Developer', '8', '+1-555-0111', TRUE),
('12', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP012', 'Maria', 'Martinez', 'maria.martinez@company.com', '2022-02-01', 'Engineering', 'Frontend Developer', '8', '+1-555-0112', TRUE),
('13', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP013', 'Kevin', 'Lee', 'kevin.lee@company.com', '2022-03-01', 'Engineering', 'Senior Backend Developer', '9', '+1-555-0113', TRUE),
('14', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP014', 'Rachel', 'Taylor', 'rachel.taylor@company.com', '2022-04-01', 'Engineering', 'Backend Developer', '9', '+1-555-0114', TRUE),
('15', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP015', 'Chris', 'Wang', 'chris.wang@company.com', '2022-05-01', 'Engineering', 'DevOps Engineer', '10', '+1-555-0115', TRUE),

-- Sales Team
('16', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP016', 'Amanda', 'White', 'amanda.white@company.com', '2021-06-01', 'Sales', 'Sales Manager', '3', '+1-555-0116', TRUE),
('17', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP017', 'Mark', 'Harris', 'mark.harris@company.com', '2021-07-01', 'Sales', 'Enterprise Sales Rep', '16', '+1-555-0117', TRUE),
('18', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP018', 'Jessica', 'Clark', 'jessica.clark@company.com', '2021-08-01', 'Sales', 'SMB Sales Rep', '16', '+1-555-0118', TRUE),
('19', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP019', 'Ryan', 'Lewis', 'ryan.lewis@company.com', '2022-06-01', 'Sales', 'Sales Development Rep', '16', '+1-555-0119', TRUE),
('20', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP020', 'Ashley', 'Young', 'ashley.young@company.com', '2022-07-01', 'Sales', 'Account Executive', '16', '+1-555-0120', TRUE),

-- Marketing Team
('21', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP021', 'Nicole', 'Hall', 'nicole.hall@company.com', '2021-09-01', 'Marketing', 'Marketing Manager', '4', '+1-555-0121', TRUE),
('22', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP022', 'Brian', 'Allen', 'brian.allen@company.com', '2021-10-01', 'Marketing', 'Digital Marketing Specialist', '21', '+1-555-0122', TRUE),
('23', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP023', 'Samantha', 'King', 'samantha.king@company.com', '2021-11-01', 'Marketing', 'Content Marketing Manager', '21', '+1-555-0123', TRUE),
('24', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP024', 'Tyler', 'Wright', 'tyler.wright@company.com', '2022-08-01', 'Marketing', 'Social Media Specialist', '21', '+1-555-0124', TRUE),

-- HR Team
('25', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP025', 'Michelle', 'Green', 'michelle.green@company.com', '2021-12-01', 'HR', 'HR Manager', '5', '+1-555-0125', TRUE),
('26', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP026', 'Steven', 'Baker', 'steven.baker@company.com', '2022-01-01', 'HR', 'Recruiter', '25', '+1-555-0126', TRUE),
('27', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP027', 'Laura', 'Adams', 'laura.adams@company.com', '2022-02-01', 'HR', 'HR Coordinator', '25', '+1-555-0127', TRUE),

-- Finance Team
('28', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP028', 'Jonathan', 'Nelson', 'jonathan.nelson@company.com', '2022-03-01', 'Finance', 'Finance Manager', '6', '+1-555-0128', TRUE),
('29', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP029', 'Catherine', 'Carter', 'catherine.carter@company.com', '2022-04-01', 'Finance', 'Financial Analyst', '28', '+1-555-0129', TRUE),
('30', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'EMP030', 'Andrew', 'Mitchell', 'andrew.mitchell@company.com', '2022-05-01', 'Finance', 'Accountant', '28', '+1-555-0130', TRUE);

-- Update department manager_id references
UPDATE departments SET manager_id = '2' WHERE id = 'dept-1'; -- Engineering - CTO
UPDATE departments SET manager_id = '3' WHERE id = 'dept-2'; -- Sales - VP of Sales
UPDATE departments SET manager_id = '4' WHERE id = 'dept-3'; -- Marketing - VP of Marketing
UPDATE departments SET manager_id = '5' WHERE id = 'dept-4'; -- HR - VP of People
UPDATE departments SET manager_id = '6' WHERE id = 'dept-5'; -- Finance - CFO
UPDATE departments SET manager_id = '1' WHERE id = 'dept-6'; -- Operations - CEO

UPDATE departments SET manager_id = '8' WHERE id = 'dept-7'; -- Frontend Team - Frontend Lead
UPDATE departments SET manager_id = '9' WHERE id = 'dept-8'; -- Backend Team - Backend Lead
UPDATE departments SET manager_id = '10' WHERE id = 'dept-9'; -- DevOps Team - DevOps Lead
UPDATE departments SET manager_id = '17' WHERE id = 'dept-10'; -- Enterprise Sales - Enterprise Sales Rep
UPDATE departments SET manager_id = '18' WHERE id = 'dept-11'; -- SMB Sales - SMB Sales Rep
UPDATE departments SET manager_id = '22' WHERE id = 'dept-12'; -- Digital Marketing - Digital Marketing Specialist
UPDATE departments SET manager_id = '23' WHERE id = 'dept-13'; -- Content Team - Content Marketing Manager

-- Insert some employee history records
INSERT INTO employee_history (tenant_id, employee_id, type, from_value, to_value, effective_date, notes) VALUES
('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', '11', 'PROMOTION', 'Frontend Developer', 'Senior Frontend Developer', '2023-01-01', 'Promoted based on excellent performance'),
('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', '13', 'PROMOTION', 'Backend Developer', 'Senior Backend Developer', '2023-01-01', 'Promoted based on technical leadership'),
('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', '19', 'POSITION_CHANGE', 'Intern', 'Sales Development Rep', '2022-06-01', 'Converted from internship to full-time'),
('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', '24', 'DEPARTMENT_CHANGE', 'Sales', 'Marketing', '2022-08-01', 'Transferred to marketing team for social media expertise');

-- Insert some recruitment plans
INSERT INTO recruitment_plans (tenant_id, position_title, department, reporting_manager_id, required_skills, estimated_salary, target_hire_date, urgency, reason, status) VALUES
('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'Senior Full Stack Developer', 'Engineering', '7', ARRAY['React', 'Node.js', 'TypeScript', 'AWS'], 120000, '2024-03-01', 'HIGH', 'EXPANSION', 'APPROVED'),
('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'Product Marketing Manager', 'Marketing', '21', ARRAY['Product Marketing', 'Go-to-Market', 'Analytics'], 110000, '2024-02-15', 'MEDIUM', 'EXPANSION', 'IN_PROGRESS'),
('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'Enterprise Account Executive', 'Sales', '16', ARRAY['B2B Sales', 'SaaS', 'Enterprise'], 95000, '2024-04-01', 'MEDIUM', 'REPLACEMENT', 'PLANNED'),
('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'Data Engineer', 'Engineering', '2', ARRAY['Python', 'SQL', 'ETL', 'Big Data'], 130000, '2024-05-01', 'LOW', 'NEW_INITIATIVE', 'PLANNED'),
('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'UX/UI Designer', 'Engineering', '8', ARRAY['Figma', 'User Research', 'Prototyping'], 105000, '2024-03-15', 'HIGH', 'EXPANSION', 'APPROVED');

-- Create an initial org version
INSERT INTO org_versions (id, tenant_id, name, description, created_by, is_active, is_draft, tag, metadata) VALUES
('version-1', 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', 'Current Organization Structure', 'Current state of the organization as of January 2024', 'michael.chen@company.com', TRUE, FALSE, 'v1.0', '{"employee_count": 30, "department_count": 13}');

-- Create version snapshots for employees
INSERT INTO version_snapshots (tenant_id, version_id, entity_type, entity_id, snapshot_data)
SELECT 
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  'version-1',
  'employee',
  id,
  jsonb_build_object(
    'id', id,
    'employee_id', employee_id,
    'first_name', first_name,
    'last_name', last_name,
    'email', email,
    'department', department,
    'position', position,
    'manager_id', manager_id,
    'is_active', is_active
  )
FROM employees 
WHERE tenant_id = 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6';

-- Create version snapshots for departments
INSERT INTO version_snapshots (tenant_id, version_id, entity_type, entity_id, snapshot_data)
SELECT 
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  'version-1',
  'department',
  id,
  jsonb_build_object(
    'id', id,
    'name', name,
    'parent_id', parent_id,
    'manager_id', manager_id,
    'level', level,
    'description', description,
    'color', color,
    'is_active', is_active
  )
FROM departments 
WHERE tenant_id = 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6';