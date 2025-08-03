# Supabase Integration Setup

This document explains how to set up and use the Supabase integration for the OrgChart Manager application.

## Prerequisites

1. A Supabase account (https://supabase.com)
2. Node.js and npm installed
3. The OrgChart Manager application code

## Setup Instructions

### 1. Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in your project details:
   - Name: `orgchart-manager`
   - Database Password: Choose a strong password
   - Region: Select the closest region to your users

### 2. Configure Environment Variables

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the following values:
   - Project URL
   - Public anon key

4. Update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Run Database Migrations

1. In your Supabase project dashboard, go to the SQL Editor
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run the SQL to create all necessary tables and indexes

Alternatively, if you have the Supabase CLI installed:

```bash
npx supabase db push
```

### 4. Verify Installation

1. Start your development server:
```bash
npm run dev
```

2. Check that the application loads without errors
3. Verify that authentication works with the Supabase Auth system

## Database Structure

The application uses the following main tables:

### Core Tables

- **tenants**: Multi-tenant isolation
- **employees**: Employee data with hierarchical relationships
- **departments**: Department structure with nesting support
- **recruitment_plans**: Future hiring plans

### Version Management

- **org_versions**: Organizational snapshots and versions
- **version_snapshots**: Point-in-time data snapshots
- **version_changes**: Change tracking with impact analysis

### Audit Trail

- **employee_history**: Track employee changes over time

## Key Features

### 1. Multi-Tenant Architecture

Each table includes a `tenant_id` column for data isolation:

```typescript
// All queries automatically filter by tenant
const employees = await EmployeeService.getAll(tenantId);
```

### 2. Type-Safe Database Access

TypeScript definitions are provided for all database operations:

```typescript
// Strongly typed database operations
const employee: Employee = await EmployeeService.create({
  employeeId: 'EMP001',
  firstName: 'John',
  lastName: 'Doe',
  // ... other fields
}, tenantId);
```

### 3. Real-Time Subscriptions

Supabase provides real-time updates for live collaboration:

```typescript
// Listen for changes (future enhancement)
supabase
  .channel('employees')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, 
    (payload) => {
      // Handle real-time updates
    }
  )
  .subscribe();
```

### 4. Row Level Security (RLS)

Basic RLS policies are in place for security:

- All tables have tenant-based isolation
- Policies can be enhanced for role-based access control

## Usage Examples

### Employee Management

```typescript
import { useEmployees } from '@/hooks/use-employees';

function EmployeeList() {
  const { employees, loading, createEmployee, updateEmployee } = useEmployees();

  const handleCreateEmployee = async () => {
    await createEmployee({
      employeeId: 'EMP123',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@company.com',
      joinDate: new Date(),
      department: 'Engineering',
      position: 'Software Engineer',
      isActive: true,
    });
  };

  // ... component logic
}
```

### Department Management

```typescript
import { useDepartments } from '@/hooks/use-departments';

function DepartmentManager() {
  const { departments, createDepartment, getHierarchy } = useDepartments();

  const handleCreateDepartment = async () => {
    await createDepartment({
      name: 'Product Engineering',
      parentId: parentDept.id,
      level: 2,
      isActive: true,
    });
  };

  // ... component logic
}
```

### Version Management

```typescript
import { useVersions } from '@/hooks/use-versions';

function VersionControl() {
  const { versions, createVersion, setActiveVersion } = useVersions();

  const createSnapshot = async () => {
    await createVersion({
      name: 'Q1 2024 Org Structure',
      description: 'Quarterly organizational review',
      createdBy: user.id,
      isActive: false,
      isDraft: true,
      metadata: { quarter: 'Q1', year: 2024 },
    });
  };

  // ... component logic
}
```

## Data Migration

If you have existing data, you can migrate it using the service classes:

```typescript
// Example migration script
async function migrateData() {
  const tenantId = 'your-tenant-id';
  
  // Migrate employees
  for (const emp of existingEmployees) {
    await EmployeeService.create({
      employeeId: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      // ... other fields
    }, tenantId);
  }
  
  // Migrate departments
  for (const dept of existingDepartments) {
    await DepartmentService.create({
      name: dept.name,
      // ... other fields
    }, tenantId);
  }
}
```

## Performance Optimization

### Indexes

The database includes optimized indexes for:

- Tenant-based queries
- Manager-employee relationships
- Department hierarchies
- Version lookups

### Query Optimization

- Use `select('*')` sparingly; specify only needed columns
- Leverage Supabase's built-in caching
- Consider pagination for large datasets

### Real-Time Features

Enable real-time subscriptions for:

- Live org chart updates
- Collaborative editing
- Change notifications

## Security Considerations

### Authentication

- Supabase Auth handles user authentication
- JWT tokens are automatically managed
- Session persistence is built-in

### Authorization

- Row Level Security (RLS) provides tenant isolation
- Policies can be extended for role-based access
- API keys should be properly secured

### Data Privacy

- Employee data is encrypted at rest
- HTTPS is enforced for all connections
- Audit trails track all changes

## Troubleshooting

### Common Issues

1. **Connection Errors**: Verify environment variables are correct
2. **Authentication Failures**: Check Supabase Auth configuration
3. **RLS Policy Errors**: Ensure proper tenant context is set
4. **Migration Failures**: Check SQL syntax and dependencies

### Debug Mode

Enable verbose logging in development:

```typescript
// Add to your Supabase client configuration
const supabase = createClient(url, key, {
  auth: {
    debug: process.env.NODE_ENV === 'development'
  }
});
```

## Future Enhancements

- Real-time collaborative editing
- Advanced role-based permissions
- API rate limiting
- Database connection pooling
- Advanced analytics queries

## Support

For issues and questions:

1. Check the Supabase documentation: https://supabase.com/docs
2. Review the application's GitHub issues
3. Consult the project's README.md for general setup instructions