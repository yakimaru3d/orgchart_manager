#!/usr/bin/env node

/**
 * Simple Supabase Connection Test
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Service Key available:', !!supabaseServiceKey);
console.log('🔑 Anon Key available:', !!supabaseAnonKey);

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing');
  process.exit(1);
}

// Test with service role key first
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

async function testConnection() {
  try {
    console.log('\n📋 Testing basic connection...');
    
    // Test 1: Check if we can connect to Supabase
    const { data: healthCheck, error: healthError } = await supabase
      .from('auth.users')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.log('⚠️ Auth table test failed (expected for new projects)');
      console.log('Error:', healthError.message);
    } else {
      console.log('✅ Basic connection successful');
    }

    // Test 2: Check if our tables exist
    console.log('\n📊 Checking for existing tables...');
    
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['tenants', 'employees', 'departments']);
    
    if (tableError) {
      console.log('⚠️ Could not check tables:', tableError.message);
    } else {
      console.log('📋 Found tables:', tables?.map(t => t.table_name) || 'none');
      
      if (!tables || tables.length === 0) {
        console.log('\n❗ No tables found. You need to run migrations first.');
        console.log('🔧 Please create tables using one of these methods:');
        console.log('   1. Run SQL migrations in Supabase Dashboard SQL Editor');
        console.log('   2. Use Supabase CLI: npx supabase db push');
        console.log('   3. Copy and paste the migration SQL manually');
      }
    }

    // Test 3: If tenants table exists, try to query it
    if (tables && tables.some(t => t.table_name === 'tenants')) {
      console.log('\n👤 Testing tenants table...');
      const { data: tenants, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .limit(5);
      
      if (tenantError) {
        console.log('❌ Error querying tenants:', tenantError.message);
      } else {
        console.log('✅ Tenants table accessible');
        console.log('📊 Found', tenants?.length || 0, 'tenants');
      }
    }

  } catch (error) {
    console.error('💥 Connection test failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection().then(() => {
  console.log('\n🏁 Connection test completed');
});