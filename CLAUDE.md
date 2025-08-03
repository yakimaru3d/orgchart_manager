# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OrgChart Manager is a Next.js 15 + TypeScript SaaS application for managing employee information and organizational charts with version control and simulation capabilities. The project uses modern React patterns with comprehensive type safety.

## Development Commands

### Core Commands
```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Production server
npm start

# Linting
npm run lint
```

### Demo Accounts
The application includes demo accounts for testing different roles:
- システム管理者: admin@company.com / password
- HR管理者: hr@company.com / password  
- 部門マネージャー: manager@company.com / password
- 一般ユーザー: employee@company.com / password

### Supabase Sample Data
To populate Supabase with sample data for development/demo purposes:

```bash
# Setup comprehensive sample data (30 employees, 13 departments)
npm run setup-sample-data

# Create demo user accounts
npm run create-demo-users
```

See [SUPABASE_SAMPLE_DATA.md](./SUPABASE_SAMPLE_DATA.md) for detailed setup instructions.

## Architecture Overview

### Core Domain Models
The application is built around four main domain entities:

1. **Employee Management** (`src/types/employee.ts`)
   - Employee with hierarchical manager relationships
   - Department structure with nested hierarchies
   - Employee history tracking for position/department changes

2. **Version Management** (`src/lib/version-manager.ts`)
   - Complete organizational snapshots with metadata
   - Version comparison with field-level change tracking
   - Impact analysis for organizational changes
   - Sophisticated diffing algorithm for employees and departments

3. **Simulation Engine** (`src/lib/simulation-engine.ts`)
   - What-if analysis for organizational changes
   - Action-based change modeling (hire, promote, transfer, etc.)
   - Conflict detection and resolution
   - Metrics tracking for change impact

4. **Organization Chart Data** (`src/lib/org-chart-data.ts`)
   - Tree structure generation from employee data
   - Level calculation and reporting relationship mapping
   - Department hierarchy building

### Key Architectural Patterns

**Singleton Services**: Both `versionManager` and `simulationEngine` are exported as singleton instances to maintain state consistency across the application.

**Hook-Based State Management**: Custom hooks (`use-org-chart.ts`, `use-version-manager.ts`) provide data access layers with memoization and callback optimization.

**Type-Safe Domain Logic**: Comprehensive TypeScript definitions with union types for change tracking, action types, and version states.

**Hierarchical Data Processing**: Multiple algorithms for traversing organizational hierarchies with infinite loop protection (max 10 levels).

## Important Implementation Details

### Authentication System
- Uses NextAuth.js with custom credential provider
- Mock user data in `src/lib/auth.ts` (remove before production)
- Role-based access control with 4 user types
- JWT strategy for session management

### React Flow Integration
The org chart uses `@xyflow/react` for interactive visualization:
- Custom node components in `src/components/org-chart/`
- Dynamic layout generation from employee data
- Manager relationship edge creation

### Version Management Complexity
The version system is sophisticated:
- Tracks both employees and departments as versioned entities
- Field-level change detection with old/new value comparison
- Change impact calculation (LOW/MEDIUM/HIGH/CRITICAL)
- Statistical aggregation across versions

### Mock Data Structure
Mock data in `src/lib/mock-data.ts` provides realistic organizational data for development. The structure includes:
- Hierarchical employee relationships
- Department nesting
- Realistic job titles and organizational levels

## Path Resolution
Uses `@/*` path mapping to `./src/*` for clean imports. Always use absolute imports from the src directory.

## UI Component System
Built on shadcn/ui with Tailwind CSS. Components are in `src/components/ui/` and follow the shadcn pattern for customization and theming.

## Performance Considerations
- Heavy use of `useMemo` and `useCallback` for expensive computations
- Map-based lookups in version management for O(1) access
- Hierarchy calculations include cycle detection
- Consider pagination for large employee datasets

## Security Notes
- Mock credentials are hardcoded and visible in auth components
- No environment variable usage detected for secrets
- bcrypt hashing implemented correctly for password storage
- Remove demo credentials before production deployment