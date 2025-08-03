#!/usr/bin/env node

/**
 * Setup Sample Data Script for OrgChart Manager
 * 
 * This script connects to Supabase and inserts sample data for development/demo purposes.
 * It uses the same data structure as the mock data but inserts it into the actual database.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key for admin operations
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
  process.exit(1);
}

if (!supabaseServiceKey && !supabaseAnonKey) {
  console.error('❌ Neither SUPABASE_SERVICE_ROLE_KEY nor NEXT_PUBLIC_SUPABASE_ANON_KEY is set');
  process.exit(1);
}

// Use service role key if available, otherwise fall back to anon key
const supabase = createClient(
  supabaseUrl, 
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Sample data matching the mock data structure
const TENANT_ID = 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6';

const sampleTenant = {
  id: TENANT_ID,
  name: 'TechStartup Inc.',
  subdomain: 'sample-tenant',
  subscription_status: 'ACTIVE'
};

const sampleDepartments = [
  // Root level departments
  { id: 'dept-1', name: 'Engineering', parent_id: null, level: 1, description: 'Software development and technical operations', color: '#3B82F6' },
  { id: 'dept-2', name: 'Sales', parent_id: null, level: 1, description: 'Sales and business development', color: '#10B981' },
  { id: 'dept-3', name: 'Marketing', parent_id: null, level: 1, description: 'Marketing and brand management', color: '#F59E0B' },
  { id: 'dept-4', name: 'HR', parent_id: null, level: 1, description: 'Human resources and people operations', color: '#EF4444' },
  { id: 'dept-5', name: 'Finance', parent_id: null, level: 1, description: 'Finance and accounting', color: '#8B5CF6' },
  { id: 'dept-6', name: 'Operations', parent_id: null, level: 1, description: 'Business operations and support', color: '#06B6D4' },
  
  // Sub-departments
  { id: 'dept-7', name: 'Frontend Team', parent_id: 'dept-1', level: 2, description: 'Frontend development team', color: '#3B82F6' },
  { id: 'dept-8', name: 'Backend Team', parent_id: 'dept-1', level: 2, description: 'Backend development team', color: '#3B82F6' },
  { id: 'dept-9', name: 'DevOps Team', parent_id: 'dept-1', level: 2, description: 'DevOps and infrastructure team', color: '#3B82F6' },
  { id: 'dept-10', name: 'Enterprise Sales', parent_id: 'dept-2', level: 2, description: 'Enterprise customer sales', color: '#10B981' },
  { id: 'dept-11', name: 'SMB Sales', parent_id: 'dept-2', level: 2, description: 'Small and medium business sales', color: '#10B981' },
  { id: 'dept-12', name: 'Digital Marketing', parent_id: 'dept-3', level: 2, description: 'Digital marketing and social media', color: '#F59E0B' },
  { id: 'dept-13', name: 'Content Team', parent_id: 'dept-3', level: 2, description: 'Content creation and strategy', color: '#F59E0B' }
];

const sampleEmployees = [
  // C-Level
  { id: '1', employee_id: 'EMP001', first_name: 'Michael', last_name: 'Chen', email: 'michael.chen@company.com', join_date: '2020-01-01', department: 'Operations', position: 'CEO', manager_id: null, phone_number: '+1-555-0101' },
  
  // VPs and Directors
  { id: '2', employee_id: 'EMP002', first_name: 'Sarah', last_name: 'Wilson', email: 'sarah.wilson@company.com', join_date: '2020-02-15', department: 'Engineering', position: 'CTO', manager_id: '1', phone_number: '+1-555-0102' },
  { id: '3', employee_id: 'EMP003', first_name: 'David', last_name: 'Rodriguez', email: 'david.rodriguez@company.com', join_date: '2020-03-01', department: 'Sales', position: 'VP of Sales', manager_id: '1', phone_number: '+1-555-0103' },
  { id: '4', employee_id: 'EMP004', first_name: 'Jennifer', last_name: 'Kim', email: 'jennifer.kim@company.com', join_date: '2020-04-10', department: 'Marketing', position: 'VP of Marketing', manager_id: '1', phone_number: '+1-555-0104' },
  { id: '5', employee_id: 'EMP005', first_name: 'Robert', last_name: 'Thompson', email: 'robert.thompson@company.com', join_date: '2020-05-01', department: 'HR', position: 'VP of People', manager_id: '1', phone_number: '+1-555-0105' },
  { id: '6', employee_id: 'EMP006', first_name: 'Lisa', last_name: 'Anderson', email: 'lisa.anderson@company.com', join_date: '2020-06-15', department: 'Finance', position: 'CFO', manager_id: '1', phone_number: '+1-555-0106' },
  
  // Engineering Team
  { id: '7', employee_id: 'EMP007', first_name: 'Alex', last_name: 'Johnson', email: 'alex.johnson@company.com', join_date: '2021-01-15', department: 'Engineering', position: 'Engineering Manager', manager_id: '2', phone_number: '+1-555-0107' },
  { id: '8', employee_id: 'EMP008', first_name: 'Emma', last_name: 'Davis', email: 'emma.davis@company.com', join_date: '2021-02-01', department: 'Engineering', position: 'Frontend Lead', manager_id: '7', phone_number: '+1-555-0108' },
  { id: '9', employee_id: 'EMP009', first_name: 'James', last_name: 'Miller', email: 'james.miller@company.com', join_date: '2021-03-01', department: 'Engineering', position: 'Backend Lead', manager_id: '7', phone_number: '+1-555-0109' },
  { id: '10', employee_id: 'EMP010', first_name: 'Sophie', last_name: 'Brown', email: 'sophie.brown@company.com', join_date: '2021-04-01', department: 'Engineering', position: 'DevOps Lead', manager_id: '7', phone_number: '+1-555-0110' },
  { id: '11', employee_id: 'EMP011', first_name: 'Daniel', last_name: 'Garcia', email: 'daniel.garcia@company.com', join_date: '2022-01-15', department: 'Engineering', position: 'Senior Frontend Developer', manager_id: '8', phone_number: '+1-555-0111' },
  { id: '12', employee_id: 'EMP012', first_name: 'Maria', last_name: 'Martinez', email: 'maria.martinez@company.com', join_date: '2022-02-01', department: 'Engineering', position: 'Frontend Developer', manager_id: '8', phone_number: '+1-555-0112' },
  { id: '13', employee_id: 'EMP013', first_name: 'Kevin', last_name: 'Lee', email: 'kevin.lee@company.com', join_date: '2022-03-01', department: 'Engineering', position: 'Senior Backend Developer', manager_id: '9', phone_number: '+1-555-0113' },
  { id: '14', employee_id: 'EMP014', first_name: 'Rachel', last_name: 'Taylor', email: 'rachel.taylor@company.com', join_date: '2022-04-01', department: 'Engineering', position: 'Backend Developer', manager_id: '9', phone_number: '+1-555-0114' },
  { id: '15', employee_id: 'EMP015', first_name: 'Chris', last_name: 'Wang', email: 'chris.wang@company.com', join_date: '2022-05-01', department: 'Engineering', position: 'DevOps Engineer', manager_id: '10', phone_number: '+1-555-0115' },
  
  // Sales Team
  { id: '16', employee_id: 'EMP016', first_name: 'Amanda', last_name: 'White', email: 'amanda.white@company.com', join_date: '2021-06-01', department: 'Sales', position: 'Sales Manager', manager_id: '3', phone_number: '+1-555-0116' },
  { id: '17', employee_id: 'EMP017', first_name: 'Mark', last_name: 'Harris', email: 'mark.harris@company.com', join_date: '2021-07-01', department: 'Sales', position: 'Enterprise Sales Rep', manager_id: '16', phone_number: '+1-555-0117' },
  { id: '18', employee_id: 'EMP018', first_name: 'Jessica', last_name: 'Clark', email: 'jessica.clark@company.com', join_date: '2021-08-01', department: 'Sales', position: 'SMB Sales Rep', manager_id: '16', phone_number: '+1-555-0118' },
  { id: '19', employee_id: 'EMP019', first_name: 'Ryan', last_name: 'Lewis', email: 'ryan.lewis@company.com', join_date: '2022-06-01', department: 'Sales', position: 'Sales Development Rep', manager_id: '16', phone_number: '+1-555-0119' },
  { id: '20', employee_id: 'EMP020', first_name: 'Ashley', last_name: 'Young', email: 'ashley.young@company.com', join_date: '2022-07-01', department: 'Sales', position: 'Account Executive', manager_id: '16', phone_number: '+1-555-0120' },
  
  // Marketing Team
  { id: '21', employee_id: 'EMP021', first_name: 'Nicole', last_name: 'Hall', email: 'nicole.hall@company.com', join_date: '2021-09-01', department: 'Marketing', position: 'Marketing Manager', manager_id: '4', phone_number: '+1-555-0121' },
  { id: '22', employee_id: 'EMP022', first_name: 'Brian', last_name: 'Allen', email: 'brian.allen@company.com', join_date: '2021-10-01', department: 'Marketing', position: 'Digital Marketing Specialist', manager_id: '21', phone_number: '+1-555-0122' },
  { id: '23', employee_id: 'EMP023', first_name: 'Samantha', last_name: 'King', email: 'samantha.king@company.com', join_date: '2021-11-01', department: 'Marketing', position: 'Content Marketing Manager', manager_id: '21', phone_number: '+1-555-0123' },
  { id: '24', employee_id: 'EMP024', first_name: 'Tyler', last_name: 'Wright', email: 'tyler.wright@company.com', join_date: '2022-08-01', department: 'Marketing', position: 'Social Media Specialist', manager_id: '21', phone_number: '+1-555-0124' },
  
  // HR Team
  { id: '25', employee_id: 'EMP025', first_name: 'Michelle', last_name: 'Green', email: 'michelle.green@company.com', join_date: '2021-12-01', department: 'HR', position: 'HR Manager', manager_id: '5', phone_number: '+1-555-0125' },
  { id: '26', employee_id: 'EMP026', first_name: 'Steven', last_name: 'Baker', email: 'steven.baker@company.com', join_date: '2022-01-01', department: 'HR', position: 'Recruiter', manager_id: '25', phone_number: '+1-555-0126' },
  { id: '27', employee_id: 'EMP027', first_name: 'Laura', last_name: 'Adams', email: 'laura.adams@company.com', join_date: '2022-02-01', department: 'HR', position: 'HR Coordinator', manager_id: '25', phone_number: '+1-555-0127' },
  
  // Finance Team
  { id: '28', employee_id: 'EMP028', first_name: 'Jonathan', last_name: 'Nelson', email: 'jonathan.nelson@company.com', join_date: '2022-03-01', department: 'Finance', position: 'Finance Manager', manager_id: '6', phone_number: '+1-555-0128' },
  { id: '29', employee_id: 'EMP029', first_name: 'Catherine', last_name: 'Carter', email: 'catherine.carter@company.com', join_date: '2022-04-01', department: 'Finance', position: 'Financial Analyst', manager_id: '28', phone_number: '+1-555-0129' },
  { id: '30', employee_id: 'EMP030', first_name: 'Andrew', last_name: 'Mitchell', email: 'andrew.mitchell@company.com', join_date: '2022-05-01', department: 'Finance', position: 'Accountant', manager_id: '28', phone_number: '+1-555-0130' }
];

const sampleRecruitmentPlans = [
  {
    position_title: 'Senior Full Stack Developer',
    department: 'Engineering',
    reporting_manager_id: '7',
    required_skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    estimated_salary: 120000,
    target_hire_date: '2024-03-01',
    urgency: 'HIGH',
    reason: 'EXPANSION',
    status: 'APPROVED'
  },
  {
    position_title: 'Product Marketing Manager',
    department: 'Marketing',
    reporting_manager_id: '21',
    required_skills: ['Product Marketing', 'Go-to-Market', 'Analytics'],
    estimated_salary: 110000,
    target_hire_date: '2024-02-15',
    urgency: 'MEDIUM',
    reason: 'EXPANSION',
    status: 'IN_PROGRESS'
  },
  {
    position_title: 'Enterprise Account Executive',
    department: 'Sales',
    reporting_manager_id: '16',
    required_skills: ['B2B Sales', 'SaaS', 'Enterprise'],
    estimated_salary: 95000,
    target_hire_date: '2024-04-01',
    urgency: 'MEDIUM',
    reason: 'REPLACEMENT',
    status: 'PLANNED'
  }
];

/**
 * Helper function to clear existing data
 */
async function clearExistingData() {
  console.log('🧹 Clearing existing sample data...');
  
  try {
    // Clear in reverse order of dependencies
    await supabase.from('employee_history').delete().eq('tenant_id', TENANT_ID);
    await supabase.from('recruitment_plans').delete().eq('tenant_id', TENANT_ID);
    await supabase.from('version_changes').delete().eq('tenant_id', TENANT_ID);
    await supabase.from('version_snapshots').delete().eq('tenant_id', TENANT_ID);
    await supabase.from('org_versions').delete().eq('tenant_id', TENANT_ID);
    await supabase.from('employees').delete().eq('tenant_id', TENANT_ID);
    await supabase.from('departments').delete().eq('tenant_id', TENANT_ID);
    
    console.log('✅ Existing data cleared');
  } catch (error) {
    console.warn('⚠️ Some errors while clearing data (might be expected):', error.message);
  }
}

/**
 * Insert tenant data
 */
async function insertTenant() {
  console.log('👤 Inserting tenant...');
  
  const { data, error } = await supabase
    .from('tenants')
    .upsert(sampleTenant);
  
  if (error) {
    console.error('❌ Error inserting tenant:', error.message || error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    throw error;
  }
  
  console.log('✅ Tenant inserted');
}

/**
 * Insert departments
 */
async function insertDepartments() {
  console.log('🏢 Inserting departments...');
  
  const departmentsWithTenant = sampleDepartments.map(dept => ({
    ...dept,
    tenant_id: TENANT_ID,
    is_active: true
  }));
  
  const { error } = await supabase
    .from('departments')
    .insert(departmentsWithTenant);
  
  if (error) {
    console.error('❌ Error inserting departments:', error);
    throw error;
  }
  
  console.log(`✅ ${sampleDepartments.length} departments inserted`);
}

/**
 * Insert employees
 */
async function insertEmployees() {
  console.log('👥 Inserting employees...');
  
  const employeesWithTenant = sampleEmployees.map(emp => ({
    ...emp,
    tenant_id: TENANT_ID,
    is_active: true
  }));
  
  const { error } = await supabase
    .from('employees')
    .insert(employeesWithTenant);
  
  if (error) {
    console.error('❌ Error inserting employees:', error);
    throw error;
  }
  
  console.log(`✅ ${sampleEmployees.length} employees inserted`);
}

/**
 * Update department managers
 */
async function updateDepartmentManagers() {
  console.log('👔 Updating department managers...');
  
  const managerUpdates = [
    { id: 'dept-1', manager_id: '2' }, // Engineering - CTO
    { id: 'dept-2', manager_id: '3' }, // Sales - VP of Sales
    { id: 'dept-3', manager_id: '4' }, // Marketing - VP of Marketing
    { id: 'dept-4', manager_id: '5' }, // HR - VP of People
    { id: 'dept-5', manager_id: '6' }, // Finance - CFO
    { id: 'dept-6', manager_id: '1' }, // Operations - CEO
    { id: 'dept-7', manager_id: '8' }, // Frontend Team - Frontend Lead
    { id: 'dept-8', manager_id: '9' }, // Backend Team - Backend Lead
    { id: 'dept-9', manager_id: '10' }, // DevOps Team - DevOps Lead
    { id: 'dept-10', manager_id: '17' }, // Enterprise Sales
    { id: 'dept-11', manager_id: '18' }, // SMB Sales
    { id: 'dept-12', manager_id: '22' }, // Digital Marketing
    { id: 'dept-13', manager_id: '23' }  // Content Team
  ];
  
  for (const update of managerUpdates) {
    const { error } = await supabase
      .from('departments')
      .update({ manager_id: update.manager_id })
      .eq('id', update.id)
      .eq('tenant_id', TENANT_ID);
    
    if (error) {
      console.error(`❌ Error updating department ${update.id}:`, error);
    }
  }
  
  console.log('✅ Department managers updated');
}

/**
 * Insert recruitment plans
 */
async function insertRecruitmentPlans() {
  console.log('📋 Inserting recruitment plans...');
  
  const plansWithTenant = sampleRecruitmentPlans.map(plan => ({
    ...plan,
    tenant_id: TENANT_ID
  }));
  
  const { error } = await supabase
    .from('recruitment_plans')
    .insert(plansWithTenant);
  
  if (error) {
    console.error('❌ Error inserting recruitment plans:', error);
    throw error;
  }
  
  console.log(`✅ ${sampleRecruitmentPlans.length} recruitment plans inserted`);
}

/**
 * Create initial organization version
 */
async function createInitialVersion() {
  console.log('📦 Creating initial organization version...');
  
  const version = {
    id: 'version-1',
    tenant_id: TENANT_ID,
    name: 'Current Organization Structure',
    description: 'Current state of the organization as of January 2024',
    created_by: 'michael.chen@company.com',
    is_active: true,
    is_draft: false,
    tag: 'v1.0',
    metadata: { employee_count: 30, department_count: 13 }
  };
  
  const { error } = await supabase
    .from('org_versions')
    .insert(version);
  
  if (error) {
    console.error('❌ Error creating initial version:', error);
    throw error;
  }
  
  console.log('✅ Initial organization version created');
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting sample data setup...');
    console.log(`📍 Supabase URL: ${supabaseUrl}`);
    console.log(`🔑 Using ${supabaseServiceKey ? 'service role' : 'anon'} key`);
    
    await clearExistingData();
    await insertTenant();
    await insertDepartments();
    await insertEmployees();
    await updateDepartmentManagers();
    await insertRecruitmentPlans();
    await createInitialVersion();
    
    console.log('\n🎉 Sample data setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - 1 tenant created`);
    console.log(`   - ${sampleDepartments.length} departments created`);
    console.log(`   - ${sampleEmployees.length} employees created`);
    console.log(`   - ${sampleRecruitmentPlans.length} recruitment plans created`);
    console.log(`   - 1 organization version created`);
    
    console.log('\n🔗 You can now:');
    console.log('   1. Set your Supabase environment variables in .env.local');
    console.log('   2. Run "npm run dev" to start the application');
    console.log('   3. Access the org chart with real Supabase data');
    
  } catch (error) {
    console.error('\n💥 Error setting up sample data:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  main,
  clearExistingData,
  insertTenant,
  insertDepartments,
  insertEmployees,
  insertRecruitmentPlans,
  createInitialVersion
};