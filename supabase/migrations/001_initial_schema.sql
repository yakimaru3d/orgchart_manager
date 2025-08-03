-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  subscription_status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table with tenant isolation
CREATE TABLE employees (
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
CREATE TABLE departments (
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
CREATE TABLE employee_history (
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
CREATE TABLE org_versions (
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
CREATE TABLE version_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  version_id UUID REFERENCES org_versions(id) ON DELETE CASCADE,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('employee', 'department')),
  entity_id UUID NOT NULL,
  snapshot_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create version_changes table
CREATE TABLE version_changes (
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
CREATE TABLE recruitment_plans (
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

-- Create indexes for performance
CREATE INDEX idx_employees_tenant_id ON employees(tenant_id);
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_is_active ON employees(is_active);

CREATE INDEX idx_departments_tenant_id ON departments(tenant_id);
CREATE INDEX idx_departments_parent_id ON departments(parent_id);
CREATE INDEX idx_departments_manager_id ON departments(manager_id);

CREATE INDEX idx_employee_history_tenant_id ON employee_history(tenant_id);
CREATE INDEX idx_employee_history_employee_id ON employee_history(employee_id);

CREATE INDEX idx_recruitment_plans_tenant_id ON recruitment_plans(tenant_id);
CREATE INDEX idx_recruitment_plans_department ON recruitment_plans(department);
CREATE INDEX idx_recruitment_plans_status ON recruitment_plans(status);
CREATE INDEX idx_recruitment_plans_reporting_manager_id ON recruitment_plans(reporting_manager_id);

CREATE INDEX idx_org_versions_tenant_id ON org_versions(tenant_id);
CREATE INDEX idx_org_versions_is_active ON org_versions(is_active);

CREATE INDEX idx_version_snapshots_tenant_id ON version_snapshots(tenant_id);
CREATE INDEX idx_version_snapshots_version_id ON version_snapshots(version_id);

CREATE INDEX idx_version_changes_tenant_id ON version_changes(tenant_id);
CREATE INDEX idx_version_changes_version_id ON version_changes(version_id);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_changes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (for now, allowing all access - will be refined later)
CREATE POLICY "Allow all access to tenants" ON tenants FOR ALL USING (true);
CREATE POLICY "Allow all access to employees" ON employees FOR ALL USING (true);
CREATE POLICY "Allow all access to departments" ON departments FOR ALL USING (true);
CREATE POLICY "Allow all access to employee_history" ON employee_history FOR ALL USING (true);
CREATE POLICY "Allow all access to recruitment_plans" ON recruitment_plans FOR ALL USING (true);
CREATE POLICY "Allow all access to org_versions" ON org_versions FOR ALL USING (true);
CREATE POLICY "Allow all access to version_snapshots" ON version_snapshots FOR ALL USING (true);
CREATE POLICY "Allow all access to version_changes" ON version_changes FOR ALL USING (true);

-- Create function to get current tenant (placeholder for MVP)
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  -- For MVP, return the first tenant
  -- In production, this will be based on auth.jwt() or session
  RETURN (SELECT id FROM tenants LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample tenant for MVP
INSERT INTO tenants (name, subdomain) 
VALUES ('Sample Startup', 'sample-startup')
ON CONFLICT (subdomain) DO NOTHING;

-- Insert sample employees
INSERT INTO employees (tenant_id, employee_id, first_name, last_name, email, join_date, department, position) 
SELECT 
  t.id,
  'EMP001',
  'John',
  'Doe',
  'john.doe@sample-startup.com',
  '2024-01-15',
  'Engineering',
  'CEO'
FROM tenants t WHERE t.subdomain = 'sample-startup'
ON CONFLICT (tenant_id, employee_id) DO NOTHING;

INSERT INTO employees (tenant_id, employee_id, first_name, last_name, email, join_date, department, position, manager_id) 
SELECT 
  t.id,
  'EMP002',
  'Jane',
  'Smith',
  'jane.smith@sample-startup.com',
  '2024-02-01',
  'Engineering',
  'CTO',
  e.id
FROM tenants t, employees e 
WHERE t.subdomain = 'sample-startup' AND e.employee_id = 'EMP001' AND e.tenant_id = t.id
ON CONFLICT (tenant_id, employee_id) DO NOTHING;

INSERT INTO employees (tenant_id, employee_id, first_name, last_name, email, join_date, department, position, manager_id) 
SELECT 
  t.id,
  'EMP003',
  'Mike',
  'Johnson',
  'mike.johnson@sample-startup.com',
  '2024-02-15',
  'Engineering',
  'Senior Developer',
  e.id
FROM tenants t, employees e 
WHERE t.subdomain = 'sample-startup' AND e.employee_id = 'EMP002' AND e.tenant_id = t.id
ON CONFLICT (tenant_id, employee_id) DO NOTHING;