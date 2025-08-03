#!/usr/bin/env node

/**
 * Database Connection Test Script
 * 
 * This script tests the connection to Supabase and verifies data exists
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TENANT_ID = 'a1b2c3d4-e5f6-4789-9012-123456789abc';

async function testConnection() {
  console.log('🔗 Testing Supabase connection...');
  console.log(`📍 URL: ${supabaseUrl}`);
  console.log(`🆔 Tenant ID: ${TENANT_ID}`);
  console.log('');

  try {
    // Test 1: Check if we can connect
    console.log('1️⃣ Testing basic connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('tenants')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Connection failed:', healthError.message);
      return;
    }
    console.log('✅ Connection successful');

    // Test 2: Check tenants table
    console.log('\n2️⃣ Checking tenants table...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*');
    
    if (tenantsError) {
      console.error('❌ Tenants query failed:', tenantsError.message);
      return;
    }
    console.log(`✅ Found ${tenants.length} tenant(s)`);
    if (tenants.length > 0) {
      console.log('   Tenants:', tenants.map(t => `${t.name} (${t.id})`).join(', '));
    }

    // Test 3: Check target tenant exists
    console.log('\n3️⃣ Checking target tenant...');
    const { data: targetTenant, error: targetError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', TENANT_ID)
      .single();
    
    if (targetError) {
      if (targetError.code === 'PGRST116') {
        console.error('❌ Target tenant not found');
        console.error('💡 Available tenants:', tenants.map(t => t.id));
        return;
      } else {
        console.error('❌ Target tenant query failed:', targetError.message);
        return;
      }
    }
    console.log(`✅ Target tenant found: ${targetTenant.name}`);

    // Test 4: Check departments for target tenant
    console.log('\n4️⃣ Checking departments...');
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .eq('tenant_id', TENANT_ID);
    
    if (deptError) {
      console.error('❌ Departments query failed:', deptError.message);
      return;
    }
    console.log(`✅ Found ${departments.length} department(s)`);
    if (departments.length > 0) {
      console.log('   Departments:', departments.map(d => d.name).join(', '));
    }

    // Test 5: Check employees for target tenant
    console.log('\n5️⃣ Checking employees...');
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('tenant_id', TENANT_ID);
    
    if (empError) {
      console.error('❌ Employees query failed:', empError.message);
      return;
    }
    console.log(`✅ Found ${employees.length} employee(s)`);
    if (employees.length > 0) {
      console.log('   Sample employees:', employees.slice(0, 3).map(e => `${e.first_name} ${e.last_name}`).join(', '));
    }

    console.log('\n🎉 All tests passed! Database is properly configured.');
    
  } catch (error) {
    console.error('\n💥 Unexpected error:', error);
  }
}

// Run the test
if (require.main === module) {
  testConnection();
}

module.exports = { testConnection };