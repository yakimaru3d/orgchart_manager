/**
 * Demo Users Creation Script for Supabase
 * 
 * This script creates demo users using Supabase Auth API
 * Run with: node scripts/create-demo-users.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase configuration from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You need to add this to .env.local

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Demo users to create
const demoUsers = [
  {
    email: 'admin@company.com',
    password: 'password',
    name: 'システム管理者',
    role: 'admin'
  },
  {
    email: 'hr@company.com',
    password: 'password',
    name: 'HR管理者',
    role: 'hr'
  },
  {
    email: 'manager@company.com',
    password: 'password',
    name: '部門マネージャー',
    role: 'manager'
  },
  {
    email: 'employee@company.com',
    password: 'password',
    name: '一般ユーザー',
    role: 'employee'
  }
];

async function createDemoUsers() {
  console.log('🚀 Creating demo users...\n');

  for (const user of demoUsers) {
    try {
      console.log(`Creating user: ${user.email}`);
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Skip email confirmation for demo
        user_metadata: {
          name: user.name,
          role: user.role
        }
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`✅ User ${user.email} already exists`);
        } else {
          console.error(`❌ Failed to create ${user.email}:`, error.message);
        }
      } else {
        console.log(`✅ Successfully created user: ${user.email}`);
        console.log(`   ID: ${data.user.id}`);
        console.log(`   Name: ${user.name}\n`);
      }
    } catch (err) {
      console.error(`❌ Error creating user ${user.email}:`, err.message);
    }
  }

  console.log('✨ Demo user creation completed!\n');
  console.log('You can now use these credentials to sign in:');
  demoUsers.forEach(user => {
    console.log(`- ${user.name}: ${user.email} / password`);
  });
}

// Also create a sample tenant
async function createSampleTenant() {
  console.log('🏢 Creating sample tenant...');
  
  try {
    const { data, error } = await supabase
      .from('tenants')
      .insert({
        name: 'Sample Company',
        subdomain: 'sample-company',
        subscription_status: 'active'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        console.log('✅ Sample tenant already exists');
      } else {
        console.error('❌ Failed to create tenant:', error.message);
      }
    } else {
      console.log(`✅ Successfully created tenant: ${data.name}`);
      console.log(`   ID: ${data.id}`);
      console.log(`   Subdomain: ${data.subdomain}\n`);
    }
  } catch (err) {
    console.error('❌ Error creating tenant:', err.message);
  }
}

// Run the script
async function main() {
  try {
    await createSampleTenant();
    await createDemoUsers();
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

main();