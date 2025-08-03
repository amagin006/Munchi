# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Munchi is a pet care tracking application built as a monorepo using React Router v7, Supabase, and TailwindCSS. The project follows modern React patterns with server-side rendering enabled by default.

## Development Commands

**Monorepo (from root directory):**
- `pnpm dev` - Start the web app development server
- `pnpm build` - Build the web app for production  
- `pnpm type-check` - Run TypeScript type checking across all packages
- `pnpm lint` - Run linting across all packages

**Web App (from apps/web/):**
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm typecheck` - Run React Router typegen and TypeScript checking

## Architecture

This is a pnpm monorepo with the main web application in `apps/web/`. The app uses:

- **React Router v7** with SSR enabled for routing and data loading
- **Supabase** for authentication and database operations
- **TailwindCSS** for styling with Radix UI components
- **TypeScript** throughout with strict typing
- **Zod** for data validation

### Key Directories

- `apps/web/app/` - Main application code
- `apps/web/app/routes/` - React Router route modules
- `apps/web/app/lib/` - Core business logic and API functions
- `apps/web/app/components/ui/` - Reusable UI components
- `apps/web/app/util/supabase/` - Supabase client configuration

### Data Layer

The app uses a pattern where each domain (pets, foods, auth) has:
- Type definitions in `types.ts` using Zod schemas
- API functions in the main module file (e.g., `pets.ts`, `foodMaster.ts`)
- All functions accept a Supabase client as the first parameter
- User authentication is checked within each function

### Database Tables

- `pets` - Pet information with user ownership
- `food_master` - Food items created by users
- User authentication handled by Supabase Auth

## Code Conventions

Follow the established patterns in `.cursor/rules/frontend-coding-rule.mdc`:

- Use kebab-case for all file names
- Single quotes for strings, 2-space indentation
- Named exports for loaders, actions, and components
- TypeScript interfaces for type safety, avoid `any`
- Server-side data loading with React Router loaders
- Supabase client passed from server/client utils based on context

### File Structure

- Route files follow React Router v7 conventions
- Components use `.tsx` extension
- Utilities and types use `.ts` extension
- Import order: React Router → React/core → third-party → app-specific → relative

### Authentication Pattern

All data functions check user authentication via `client.auth.getUser()` and filter results by `user_id` to ensure data isolation between users.

## Requirements Specification

### Product Overview
Munchi is a simple pet feeding tracker application specifically designed for dog and cat owners. The primary goal is to provide an easy-to-use interface for recording and tracking pet feeding activities.

### Target Users
- Dog and cat owners who want to track their pets' feeding schedules
- Single or multi-pet households
- Users who want simple, quick feeding record entry

### Core Features (Implemented)

#### 1. User Authentication
- **Registration**: Email-based account creation with validation
- **Login**: Secure authentication via Supabase Auth
- **Session Management**: Persistent login sessions

#### 2. Pet Management
- **Pet Registration**: Add pets with basic information
  - Pet type: Cat, Dog, Other (focus on cats and dogs)
  - Name (required)
  - Age (optional, 0-30 years)
  - Weight (optional, with kg/lbs unit selection)
- **Pet Selection**: Choose active pet for feeding records
- **Pet Data Validation**: Comprehensive input validation using Zod

#### 3. Food Master Management
- **Food Database**: User-specific food catalog
- **Food Registration**: Add foods with detailed information
  - Basic info: name, brand, type (dry/wet/treat/supplement)
  - Nutritional data: calories, protein, fat, carbs per 100g
  - Product info: package size, price, purchase URL
  - Usage tracking: count, last used date
  - Favorite marking system
- **Food Categories**: Organized by type and favorites

#### 4. Feeding Record System
- **Quick Recording**: One-click feeding entry with default amounts
- **Meal Type Detection**: Automatic meal type based on time
  - Morning (6-11): Breakfast
  - Afternoon (11-16): Lunch  
  - Evening (16-22): Dinner
  - Night (22-6): Snack/Treat
- **Feeding Details**: Record amount given and amount eaten
- **Eating Status**: Track completion (finished, partially eaten, refused)
- **Today's Summary**: Display daily feeding overview

#### 5. Dashboard Interface
- **Pet Information Display**: Current selected pet details
- **Today's Feeding Summary**: Real-time feeding statistics
- **Quick Actions**: Favorite foods for rapid entry
- **Navigation**: Easy access to all features

### Database Schema

#### Core Tables
1. **`pets`** - Pet information with user ownership
2. **`food_master`** - User-specific food catalog with nutritional data
3. **`food_records`** - Feeding history and tracking data

#### Data Relationships
- All data is user-scoped for privacy and isolation
- Pets belong to users
- Food master records belong to users
- Feeding records link users, pets, and foods

### Technical Requirements

#### Performance
- Mobile-first responsive design
- Fast loading with SSR
- Real-time data updates

#### Security
- User data isolation
- Secure authentication
- Input validation and sanitization

#### Usability
- Intuitive one-handed mobile operation
- Quick feeding entry (< 3 taps)
- Clear visual feedback for all actions

### Implementation Status

#### ✅ Completed Features
- Full authentication system
- Pet CRUD operations with validation
- Food master management with categories
- Basic feeding record system
- Dashboard with today's summary
- Mobile-responsive UI

#### 🚧 Pending Implementation
- Settings page functionality (placeholder exists)
- Medication tracking system (UI exists, no backend)
- Advanced analytics and reporting
- Data export functionality

#### ⚠️ Known Issues
- Dashboard uses mock pet data instead of real database (lines 169-173 in `/dashboard/index.tsx`)
- Settings page has no functionality implemented

### Future Enhancement Considerations
- Feeding reminders and notifications
- Advanced analytics and charts
- Photo attachments for records
- Multi-language support (currently mixed Japanese/English)
- Veterinary appointment tracking
- Weight tracking over time

## Best Practices

### React 19 Best Practices

#### Modern Hooks and Features
- **Use React Router v7's data loading**: Leverage `loader` functions for server-side data fetching instead of `useEffect`
- **Server Components**: This project uses SSR by default - prefer server-side data loading when possible
- **State Management**: Use `useState` and `useCallback` for local component state, avoid complex state management libraries for simple use cases
- **Form Handling**: Use React Router's `Form` component and `action` functions for form submissions
- **Error Boundaries**: Implement proper error boundaries for route-level error handling

#### Component Patterns
- **Prefer function components** with hooks over class components
- **Use TypeScript interfaces** for all props and state definitions
- **Implement proper loading states** for async operations
- **Use React.memo** sparingly and only when performance issues are identified
- **Prefer composition over inheritance** for component reusability

### Vite Configuration and Optimization

#### Development Workflow
- **Hot Module Replacement (HMR)**: Vite provides fast HMR out of the box - leverage it for rapid development
- **Path Resolution**: Use the configured `@/` alias for clean imports (`@/lib/`, `@/components/`)
- **Environment Variables**: Prefix environment variables with `VITE_` for client-side access
- **TypeScript Integration**: Use `vite-tsconfig-paths` for seamless TypeScript path mapping

#### Build Optimization
- **Code Splitting**: Vite automatically handles code splitting - use dynamic imports for route-based splitting
- **Asset Optimization**: Place static assets in `public/` directory for direct access
- **Bundle Analysis**: Use `pnpm build` and analyze output for optimization opportunities
- **Production Builds**: Always test production builds before deployment

### Supabase Integration Patterns

#### Authentication Management
- **Client vs Server**: Use server-side client for loaders/actions, client-side for interactive features
- **Session Handling**: Implement proper session persistence with Supabase SSR package
- **Route Protection**: Check authentication in loaders and redirect to login when necessary
- **User Data Isolation**: Always filter queries by `user_id` to ensure data privacy

#### Database Operations
- **Error Handling**: Always handle Supabase errors gracefully with user-friendly messages
- **Type Safety**: Use TypeScript interfaces that match database schema
- **Query Optimization**: Use selective columns in `.select()` to minimize data transfer
- **Real-time Features**: Consider Supabase real-time subscriptions for live data updates

#### Security Best Practices
- **Row Level Security (RLS)**: Ensure RLS policies are enabled for all user data tables
- **Input Validation**: Use Zod schemas for both client and server-side validation
- **Environment Variables**: Never expose database credentials on client-side
- **API Rate Limiting**: Be aware of Supabase usage limits and implement appropriate caching

### Performance Optimization

#### React Router v7 Specific
- **Loader Optimization**: Minimize data fetching in loaders - only load what's needed
- **Prefetching**: Use `<Link prefetch="intent">` for faster navigation
- **Parallel Data Loading**: Load independent data sources in parallel within loaders
- **Caching Strategy**: Implement appropriate caching for frequently accessed data

#### Database Performance
- **Query Efficiency**: Use indexes for frequently queried columns (`user_id`, timestamps)
- **Pagination**: Implement pagination for large datasets to improve load times
- **Data Normalization**: Follow proper database normalization to avoid data duplication
- **Connection Pooling**: Leverage Supabase's built-in connection pooling

### Code Organization

#### File Structure Best Practices
- **Domain-Driven Organization**: Group related functionality in lib folders (pets, foods, auth)
- **Component Hierarchy**: Keep UI components separate from business logic
- **Type Definitions**: Centralize types in dedicated `types.ts` files per domain
- **Utility Functions**: Create reusable utilities in dedicated files

#### Import Organization
- **Consistent Import Order**: Follow the established import order (React Router → React → Third-party → App-specific → Relative)
- **Barrel Exports**: Use index files for cleaner imports when appropriate
- **Absolute Imports**: Prefer absolute imports with `@/` alias over relative paths
- **Tree Shaking**: Import only what you need from libraries to optimize bundle size

## Documentation and TODO Management

### Requirements Documentation
Detailed functional requirements are organized in `/docs/` directory with numbered markdown files for each feature:
- `01-authentication.md` - User authentication system
- `02-pet-management.md` - Pet registration and management
- `03-food-master.md` - Food catalog management
- `04-feeding-records.md` - Feeding activity tracking
- `05-dashboard.md` - Main dashboard interface
- `06-settings.md` - Application settings

### TODO Tracking System
Each documentation file uses markdown checkboxes for task tracking:
- **Pending Tasks**: `- [ ]` indicates incomplete or not yet implemented features
- **Completed Tasks**: `- [x]` indicates fully implemented and tested features

**When completing TODOs:**
1. Locate the relevant documentation file in `/docs/`
2. Find the specific TODO item
3. Change `- [ ]` to `- [x]` when the task is completed
4. Update implementation notes if needed
5. Add new TODOs as they're discovered during development

**TODO Management Best Practices:**
- Always update documentation TODOs when implementing features
- Keep implementation status current across all documentation files
- Use descriptive TODO items that clearly indicate what needs to be done
- Group related TODOs under appropriate sections (Functional Requirements, Technical Requirements, UI/UX Requirements)
- Include acceptance criteria in TODO descriptions when helpful