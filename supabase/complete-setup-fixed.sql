-- ========================================
-- COMPLETE SUPABASE SETUP FOR ORGCHART MANAGER (FIXED UUID VERSION)
-- ========================================
-- This file contains all migrations and sample data in one place
-- Copy and paste this entire file into Supabase SQL Editor and run it

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. CREATE TABLES
-- ========================================

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  subscription_status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table with tenant isolation
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  join_date DATE NOT NULL,
  department VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  manager_id UUID REFERENCES employees(id),
  profile_image TEXT,
  phone_number VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, employee_id),
  UNIQUE(tenant_id, email)
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES departments(id),
  manager_id UUID REFERENCES employees(id),
  level INTEGER DEFAULT 1,
  description TEXT,
  color VARCHAR(7),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);

-- Create employee_history table
CREATE TABLE IF NOT EXISTS employee_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('DEPARTMENT_CHANGE', 'POSITION_CHANGE', 'PROMOTION')),
  from_value VARCHAR(255) NOT NULL,
  to_value VARCHAR(255) NOT NULL,
  effective_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create org_versions table
CREATE TABLE IF NOT EXISTS org_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  is_draft BOOLEAN DEFAULT TRUE,
  tag VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create version_snapshots table
CREATE TABLE IF NOT EXISTS version_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  version_id UUID REFERENCES org_versions(id) ON DELETE CASCADE,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('employee', 'department')),
  entity_id UUID NOT NULL,
  snapshot_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create version_changes table
CREATE TABLE IF NOT EXISTS version_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  version_id UUID REFERENCES org_versions(id) ON DELETE CASCADE,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('employee', 'department')),
  entity_id UUID NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('CREATE', 'UPDATE', 'DELETE')),
  impact_level VARCHAR(20) DEFAULT 'LOW' CHECK (impact_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recruitment_plans table
CREATE TABLE IF NOT EXISTS recruitment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  position_title VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  reporting_manager_id UUID REFERENCES employees(id),
  required_skills TEXT[] DEFAULT '{}',
  estimated_salary INTEGER NOT NULL,
  target_hire_date DATE NOT NULL,
  urgency VARCHAR(20) DEFAULT 'MEDIUM' CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  reason VARCHAR(50) DEFAULT 'EXPANSION' CHECK (reason IN ('EXPANSION', 'REPLACEMENT', 'NEW_INITIATIVE')),
  status VARCHAR(20) DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'APPROVED', 'IN_PROGRESS', 'HIRED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'hr', 'admin')),
    department TEXT,
    employee_id TEXT,
    phone_number TEXT,
    profile_image TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, user_id),
    UNIQUE(tenant_id, employee_id)
);

-- ========================================
-- 2. CREATE INDEXES
-- ========================================

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_tenant_id ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);

CREATE INDEX IF NOT EXISTS idx_departments_tenant_id ON departments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent_id ON departments(parent_id);
CREATE INDEX IF NOT EXISTS idx_departments_manager_id ON departments(manager_id);

CREATE INDEX IF NOT EXISTS idx_employee_history_tenant_id ON employee_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employee_history_employee_id ON employee_history(employee_id);

CREATE INDEX IF NOT EXISTS idx_recruitment_plans_tenant_id ON recruitment_plans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recruitment_plans_department ON recruitment_plans(department);
CREATE INDEX IF NOT EXISTS idx_recruitment_plans_status ON recruitment_plans(status);
CREATE INDEX IF NOT EXISTS idx_recruitment_plans_reporting_manager_id ON recruitment_plans(reporting_manager_id);

CREATE INDEX IF NOT EXISTS idx_org_versions_tenant_id ON org_versions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_versions_is_active ON org_versions(is_active);

CREATE INDEX IF NOT EXISTS idx_version_snapshots_tenant_id ON version_snapshots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_version_snapshots_version_id ON version_snapshots(version_id);

CREATE INDEX IF NOT EXISTS idx_version_changes_tenant_id ON version_changes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_version_changes_version_id ON version_changes(version_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant_id ON user_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_department ON user_profiles(department);

-- ========================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. CREATE RLS POLICIES (ALLOWING ALL FOR MVP)
-- ========================================

-- Create RLS policies (for now, allowing all access - will be refined later)
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow all access to tenants" ON tenants;
    DROP POLICY IF EXISTS "Allow all access to employees" ON employees;
    DROP POLICY IF EXISTS "Allow all access to departments" ON departments;
    DROP POLICY IF EXISTS "Allow all access to employee_history" ON employee_history;
    DROP POLICY IF EXISTS "Allow all access to recruitment_plans" ON recruitment_plans;
    DROP POLICY IF EXISTS "Allow all access to org_versions" ON org_versions;
    DROP POLICY IF EXISTS "Allow all access to version_snapshots" ON version_snapshots;
    DROP POLICY IF EXISTS "Allow all access to version_changes" ON version_changes;
    DROP POLICY IF EXISTS "Allow all access to user_profiles" ON user_profiles;
    
    -- Create new policies
    CREATE POLICY "Allow all access to tenants" ON tenants FOR ALL USING (true);
    CREATE POLICY "Allow all access to employees" ON employees FOR ALL USING (true);
    CREATE POLICY "Allow all access to departments" ON departments FOR ALL USING (true);
    CREATE POLICY "Allow all access to employee_history" ON employee_history FOR ALL USING (true);
    CREATE POLICY "Allow all access to recruitment_plans" ON recruitment_plans FOR ALL USING (true);
    CREATE POLICY "Allow all access to org_versions" ON org_versions FOR ALL USING (true);
    CREATE POLICY "Allow all access to version_snapshots" ON version_snapshots FOR ALL USING (true);
    CREATE POLICY "Allow all access to version_changes" ON version_changes FOR ALL USING (true);
    CREATE POLICY "Allow all access to user_profiles" ON user_profiles FOR ALL USING (true);
END $$;

-- ========================================
-- 5. CREATE HELPER FUNCTIONS
-- ========================================

-- Create function to get current tenant (placeholder for MVP)
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  -- For MVP, return the first tenant
  -- In production, this will be based on auth.jwt() or session
  RETURN (SELECT id FROM tenants LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at 
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at 
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 6. INSERT SAMPLE DATA WITH PROPER UUIDS
-- ========================================

-- Insert sample tenant for MVP
INSERT INTO tenants (id, name, subdomain, subscription_status) 
VALUES (
  'a1b2c3d4-e5f6-4789-9012-123456789abc',
  'TechStartup Inc.',
  'sample-tenant',
  'ACTIVE'
) ON CONFLICT (subdomain) DO UPDATE SET 
  name = EXCLUDED.name,
  subscription_status = EXCLUDED.subscription_status,
  updated_at = NOW();

-- Clear existing sample data
DELETE FROM employee_history WHERE tenant_id = 'a1b2c3d4-e5f6-4789-9012-123456789abc';
DELETE FROM recruitment_plans WHERE tenant_id = 'a1b2c3d4-e5f6-4789-9012-123456789abc';
DELETE FROM version_changes WHERE tenant_id = 'a1b2c3d4-e5f6-4789-9012-123456789abc';
DELETE FROM version_snapshots WHERE tenant_id = 'a1b2c3d4-e5f6-4789-9012-123456789abc';
DELETE FROM org_versions WHERE tenant_id = 'a1b2c3d4-e5f6-4789-9012-123456789abc';
DELETE FROM employees WHERE tenant_id = 'a1b2c3d4-e5f6-4789-9012-123456789abc';
DELETE FROM departments WHERE tenant_id = 'a1b2c3d4-e5f6-4789-9012-123456789abc';

-- Insert departments first (to avoid foreign key constraints) with proper UUIDs
INSERT INTO departments (id, tenant_id, name, parent_id, level, description, color, is_active) VALUES
-- Root level departments (level 1)
('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'Engineering', NULL, 1, 'Software development and technical operations', '#3B82F6', TRUE),
('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'Sales', NULL, 1, 'Sales and business development', '#10B981', TRUE),
('33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'Marketing', NULL, 1, 'Marketing and brand management', '#F59E0B', TRUE),
('44444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'HR', NULL, 1, 'Human resources and people operations', '#EF4444', TRUE),
('55555555-5555-5555-5555-555555555555', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'Finance', NULL, 1, 'Finance and accounting', '#8B5CF6', TRUE),
('66666666-6666-6666-6666-666666666666', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'Operations', NULL, 1, 'Business operations and support', '#06B6D4', TRUE),

-- Sub-departments (level 2)
('77777777-7777-7777-7777-777777777777', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'Frontend Team', '11111111-1111-1111-1111-111111111111', 2, 'Frontend development team', '#3B82F6', TRUE),
('88888888-8888-8888-8888-888888888888', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'Backend Team', '11111111-1111-1111-1111-111111111111', 2, 'Backend development team', '#3B82F6', TRUE),
('99999999-9999-9999-9999-999999999999', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'DevOps Team', '11111111-1111-1111-1111-111111111111', 2, 'DevOps and infrastructure team', '#3B82F6', TRUE),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'Enterprise Sales', '22222222-2222-2222-2222-222222222222', 2, 'Enterprise customer sales', '#10B981', TRUE),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'SMB Sales', '22222222-2222-2222-2222-222222222222', 2, 'Small and medium business sales', '#10B981', TRUE),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'Digital Marketing', '33333333-3333-3333-3333-333333333333', 2, 'Digital marketing and social media', '#F59E0B', TRUE),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'Content Team', '33333333-3333-3333-3333-333333333333', 2, 'Content creation and strategy', '#F59E0B', TRUE);

-- Insert employees with proper UUIDs
INSERT INTO employees (id, tenant_id, employee_id, first_name, last_name, email, join_date, department, position, manager_id, phone_number, is_active) VALUES
-- C-Level (Top level)
('00000001-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP001', 'Michael', 'Chen', 'michael.chen@company.com', '2020-01-01', 'Operations', 'CEO', NULL, '+1-555-0101', TRUE),

-- VPs and Directors (Second level)
('00000002-0002-0002-0002-000000000002', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP002', 'Sarah', 'Wilson', 'sarah.wilson@company.com', '2020-02-15', 'Engineering', 'CTO', '00000001-0001-0001-0001-000000000001', '+1-555-0102', TRUE),
('00000003-0003-0003-0003-000000000003', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP003', 'David', 'Rodriguez', 'david.rodriguez@company.com', '2020-03-01', 'Sales', 'VP of Sales', '00000001-0001-0001-0001-000000000001', '+1-555-0103', TRUE),
('00000004-0004-0004-0004-000000000004', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP004', 'Jennifer', 'Kim', 'jennifer.kim@company.com', '2020-04-10', 'Marketing', 'VP of Marketing', '00000001-0001-0001-0001-000000000001', '+1-555-0104', TRUE),
('00000005-0005-0005-0005-000000000005', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP005', 'Robert', 'Thompson', 'robert.thompson@company.com', '2020-05-01', 'HR', 'VP of People', '00000001-0001-0001-0001-000000000001', '+1-555-0105', TRUE),
('00000006-0006-0006-0006-000000000006', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP006', 'Lisa', 'Anderson', 'lisa.anderson@company.com', '2020-06-15', 'Finance', 'CFO', '00000001-0001-0001-0001-000000000001', '+1-555-0106', TRUE),

-- Engineering Team
('00000007-0007-0007-0007-000000000007', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP007', 'Alex', 'Johnson', 'alex.johnson@company.com', '2021-01-15', 'Engineering', 'Engineering Manager', '00000002-0002-0002-0002-000000000002', '+1-555-0107', TRUE),
('00000008-0008-0008-0008-000000000008', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP008', 'Emma', 'Davis', 'emma.davis@company.com', '2021-02-01', 'Engineering', 'Frontend Lead', '00000007-0007-0007-0007-000000000007', '+1-555-0108', TRUE),
('00000009-0009-0009-0009-000000000009', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP009', 'James', 'Miller', 'james.miller@company.com', '2021-03-01', 'Engineering', 'Backend Lead', '00000007-0007-0007-0007-000000000007', '+1-555-0109', TRUE),
('00000010-0010-0010-0010-000000000010', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP010', 'Sophie', 'Brown', 'sophie.brown@company.com', '2021-04-01', 'Engineering', 'DevOps Lead', '00000007-0007-0007-0007-000000000007', '+1-555-0110', TRUE),
('00000011-0011-0011-0011-000000000011', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP011', 'Daniel', 'Garcia', 'daniel.garcia@company.com', '2022-01-15', 'Engineering', 'Senior Frontend Developer', '00000008-0008-0008-0008-000000000008', '+1-555-0111', TRUE),
('00000012-0012-0012-0012-000000000012', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP012', 'Maria', 'Martinez', 'maria.martinez@company.com', '2022-02-01', 'Engineering', 'Frontend Developer', '00000008-0008-0008-0008-000000000008', '+1-555-0112', TRUE),
('00000013-0013-0013-0013-000000000013', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP013', 'Kevin', 'Lee', 'kevin.lee@company.com', '2022-03-01', 'Engineering', 'Senior Backend Developer', '00000009-0009-0009-0009-000000000009', '+1-555-0113', TRUE),
('00000014-0014-0014-0014-000000000014', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP014', 'Rachel', 'Taylor', 'rachel.taylor@company.com', '2022-04-01', 'Engineering', 'Backend Developer', '00000009-0009-0009-0009-000000000009', '+1-555-0114', TRUE),
('00000015-0015-0015-0015-000000000015', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP015', 'Chris', 'Wang', 'chris.wang@company.com', '2022-05-01', 'Engineering', 'DevOps Engineer', '00000010-0010-0010-0010-000000000010', '+1-555-0115', TRUE),

-- Sales Team
('00000016-0016-0016-0016-000000000016', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP016', 'Amanda', 'White', 'amanda.white@company.com', '2021-06-01', 'Sales', 'Sales Manager', '00000003-0003-0003-0003-000000000003', '+1-555-0116', TRUE),
('00000017-0017-0017-0017-000000000017', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP017', 'Mark', 'Harris', 'mark.harris@company.com', '2021-07-01', 'Sales', 'Enterprise Sales Rep', '00000016-0016-0016-0016-000000000016', '+1-555-0117', TRUE),
('00000018-0018-0018-0018-000000000018', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP018', 'Jessica', 'Clark', 'jessica.clark@company.com', '2021-08-01', 'Sales', 'SMB Sales Rep', '00000016-0016-0016-0016-000000000016', '+1-555-0118', TRUE),
('00000019-0019-0019-0019-000000000019', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP019', 'Ryan', 'Lewis', 'ryan.lewis@company.com', '2022-06-01', 'Sales', 'Sales Development Rep', '00000016-0016-0016-0016-000000000016', '+1-555-0119', TRUE),
('00000020-0020-0020-0020-000000000020', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP020', 'Ashley', 'Young', 'ashley.young@company.com', '2022-07-01', 'Sales', 'Account Executive', '00000016-0016-0016-0016-000000000016', '+1-555-0120', TRUE),

-- Marketing Team
('00000021-0021-0021-0021-000000000021', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP021', 'Nicole', 'Hall', 'nicole.hall@company.com', '2021-09-01', 'Marketing', 'Marketing Manager', '00000004-0004-0004-0004-000000000004', '+1-555-0121', TRUE),
('00000022-0022-0022-0022-000000000022', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP022', 'Brian', 'Allen', 'brian.allen@company.com', '2021-10-01', 'Marketing', 'Digital Marketing Specialist', '00000021-0021-0021-0021-000000000021', '+1-555-0122', TRUE),
('00000023-0023-0023-0023-000000000023', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP023', 'Samantha', 'King', 'samantha.king@company.com', '2021-11-01', 'Marketing', 'Content Marketing Manager', '00000021-0021-0021-0021-000000000021', '+1-555-0123', TRUE),
('00000024-0024-0024-0024-000000000024', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP024', 'Tyler', 'Wright', 'tyler.wright@company.com', '2022-08-01', 'Marketing', 'Social Media Specialist', '00000021-0021-0021-0021-000000000021', '+1-555-0124', TRUE),

-- HR Team
('00000025-0025-0025-0025-000000000025', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP025', 'Michelle', 'Green', 'michelle.green@company.com', '2021-12-01', 'HR', 'HR Manager', '00000005-0005-0005-0005-000000000005', '+1-555-0125', TRUE),
('00000026-0026-0026-0026-000000000026', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP026', 'Steven', 'Baker', 'steven.baker@company.com', '2022-01-01', 'HR', 'Recruiter', '00000025-0025-0025-0025-000000000025', '+1-555-0126', TRUE),
('00000027-0027-0027-0027-000000000027', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP027', 'Laura', 'Adams', 'laura.adams@company.com', '2022-02-01', 'HR', 'HR Coordinator', '00000025-0025-0025-0025-000000000025', '+1-555-0127', TRUE),

-- Finance Team
('00000028-0028-0028-0028-000000000028', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP028', 'Jonathan', 'Nelson', 'jonathan.nelson@company.com', '2022-03-01', 'Finance', 'Finance Manager', '00000006-0006-0006-0006-000000000006', '+1-555-0128', TRUE),
('00000029-0029-0029-0029-000000000029', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP029', 'Catherine', 'Carter', 'catherine.carter@company.com', '2022-04-01', 'Finance', 'Financial Analyst', '00000028-0028-0028-0028-000000000028', '+1-555-0129', TRUE),
('00000030-0030-0030-0030-000000000030', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'EMP030', 'Andrew', 'Mitchell', 'andrew.mitchell@company.com', '2022-05-01', 'Finance', 'Accountant', '00000028-0028-0028-0028-000000000028', '+1-555-0130', TRUE);

-- Update department manager_id references with proper UUIDs
UPDATE departments SET manager_id = '00000002-0002-0002-0002-000000000002' WHERE id = '11111111-1111-1111-1111-111111111111'; -- Engineering - CTO
UPDATE departments SET manager_id = '00000003-0003-0003-0003-000000000003' WHERE id = '22222222-2222-2222-2222-222222222222'; -- Sales - VP of Sales
UPDATE departments SET manager_id = '00000004-0004-0004-0004-000000000004' WHERE id = '33333333-3333-3333-3333-333333333333'; -- Marketing - VP of Marketing
UPDATE departments SET manager_id = '00000005-0005-0005-0005-000000000005' WHERE id = '44444444-4444-4444-4444-444444444444'; -- HR - VP of People
UPDATE departments SET manager_id = '00000006-0006-0006-0006-000000000006' WHERE id = '55555555-5555-5555-5555-555555555555'; -- Finance - CFO
UPDATE departments SET manager_id = '00000001-0001-0001-0001-000000000001' WHERE id = '66666666-6666-6666-6666-666666666666'; -- Operations - CEO

UPDATE departments SET manager_id = '00000008-0008-0008-0008-000000000008' WHERE id = '77777777-7777-7777-7777-777777777777'; -- Frontend Team - Frontend Lead
UPDATE departments SET manager_id = '00000009-0009-0009-0009-000000000009' WHERE id = '88888888-8888-8888-8888-888888888888'; -- Backend Team - Backend Lead
UPDATE departments SET manager_id = '00000010-0010-0010-0010-000000000010' WHERE id = '99999999-9999-9999-9999-999999999999'; -- DevOps Team - DevOps Lead
UPDATE departments SET manager_id = '00000017-0017-0017-0017-000000000017' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'; -- Enterprise Sales - Enterprise Sales Rep
UPDATE departments SET manager_id = '00000018-0018-0018-0018-000000000018' WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'; -- SMB Sales - SMB Sales Rep
UPDATE departments SET manager_id = '00000022-0022-0022-0022-000000000022' WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'; -- Digital Marketing - Digital Marketing Specialist
UPDATE departments SET manager_id = '00000023-0023-0023-0023-000000000023' WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'; -- Content Team - Content Marketing Manager

-- Insert some employee history records
INSERT INTO employee_history (tenant_id, employee_id, type, from_value, to_value, effective_date, notes) VALUES
('a1b2c3d4-e5f6-4789-9012-123456789abc', '00000011-0011-0011-0011-000000000011', 'PROMOTION', 'Frontend Developer', 'Senior Frontend Developer', '2023-01-01', 'Promoted based on excellent performance'),
('a1b2c3d4-e5f6-4789-9012-123456789abc', '00000013-0013-0013-0013-000000000013', 'PROMOTION', 'Backend Developer', 'Senior Backend Developer', '2023-01-01', 'Promoted based on technical leadership'),
('a1b2c3d4-e5f6-4789-9012-123456789abc', '00000019-0019-0019-0019-000000000019', 'POSITION_CHANGE', 'Intern', 'Sales Development Rep', '2022-06-01', 'Converted from internship to full-time'),
('a1b2c3d4-e5f6-4789-9012-123456789abc', '00000024-0024-0024-0024-000000000024', 'DEPARTMENT_CHANGE', 'Sales', 'Marketing', '2022-08-01', 'Transferred to marketing team for social media expertise');

-- Insert some recruitment plans
INSERT INTO recruitment_plans (tenant_id, position_title, department, reporting_manager_id, required_skills, estimated_salary, target_hire_date, urgency, reason, status) VALUES
('a1b2c3d4-e5f6-4789-9012-123456789abc', 'Senior Full Stack Developer', 'Engineering', '00000007-0007-0007-0007-000000000007', ARRAY['React', 'Node.js', 'TypeScript', 'AWS'], 120000, '2024-03-01', 'HIGH', 'EXPANSION', 'APPROVED'),
('a1b2c3d4-e5f6-4789-9012-123456789abc', 'Product Marketing Manager', 'Marketing', '00000021-0021-0021-0021-000000000021', ARRAY['Product Marketing', 'Go-to-Market', 'Analytics'], 110000, '2024-02-15', 'MEDIUM', 'EXPANSION', 'IN_PROGRESS'),
('a1b2c3d4-e5f6-4789-9012-123456789abc', 'Enterprise Account Executive', 'Sales', '00000016-0016-0016-0016-000000000016', ARRAY['B2B Sales', 'SaaS', 'Enterprise'], 95000, '2024-04-01', 'MEDIUM', 'REPLACEMENT', 'PLANNED'),
('a1b2c3d4-e5f6-4789-9012-123456789abc', 'Data Engineer', 'Engineering', '00000002-0002-0002-0002-000000000002', ARRAY['Python', 'SQL', 'ETL', 'Big Data'], 130000, '2024-05-01', 'LOW', 'NEW_INITIATIVE', 'PLANNED'),
('a1b2c3d4-e5f6-4789-9012-123456789abc', 'UX/UI Designer', 'Engineering', '00000008-0008-0008-0008-000000000008', ARRAY['Figma', 'User Research', 'Prototyping'], 105000, '2024-03-15', 'HIGH', 'EXPANSION', 'APPROVED');

-- Create an initial org version
INSERT INTO org_versions (id, tenant_id, name, description, created_by, is_active, is_draft, tag, metadata) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'a1b2c3d4-e5f6-4789-9012-123456789abc', 'Current Organization Structure', 'Current state of the organization as of January 2024', 'michael.chen@company.com', TRUE, FALSE, 'v1.0', '{"employee_count": 30, "department_count": 13}');

-- ========================================
-- 7. CONFIRMATION MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '🎉 SETUP COMPLETED SUCCESSFULLY! 🎉';
    RAISE NOTICE '';
    RAISE NOTICE '📊 SUMMARY:';
    RAISE NOTICE '   - Tables created: 9 tables with indexes and RLS';
    RAISE NOTICE '   - Sample tenant: TechStartup Inc.';
    RAISE NOTICE '   - Departments: 13 departments (hierarchical)';
    RAISE NOTICE '   - Employees: 30 employees';
    RAISE NOTICE '   - Recruitment plans: 5 plans';
    RAISE NOTICE '   - Organization version: 1 version';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Your Supabase database is now ready for the OrgChart Manager app!';
    RAISE NOTICE '   Run "npm run dev" to start the application.';
END $$;