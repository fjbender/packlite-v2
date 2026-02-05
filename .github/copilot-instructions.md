# Packlite Development Guide

## Project Overview

Packlite is a web application for hikers and trekkers to manage gear, optimize pack weight, and create trip packing lists. The app features gear management, food/pantry tracking, weight optimization, and social sharing capabilities.

## Tech Stack

### Frontend

- **Next.js** with React and TypeScript
- **Tailwind CSS** for styling
- **React Query** for server state management
- **Context API** for UI state
- **React Hook Form** for forms
- **D3.js/Chart.js** for weight distribution visualizations

### Backend

- **Next.js API Routes** (serverless functions)
- **MongoDB** with MongoDB Atlas
- **NextAuth.js** for authentication (social logins + JWT)
- **AWS S3** for gear image storage
- **Zod** for API request validation

### Deployment

- **Vercel** for hosting
- **GitHub Actions** for CI/CD
- **Sentry** for error tracking

## Build & Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Format code
npm run format

# Run all tests
npm test

# Run single test file
npm test -- <test-file-path>

# Run tests in watch mode
npm test -- --watch

# Integration tests
npm run test:e2e

# Type checking
npm run type-check
```

## Project Architecture

### Directory Structure

Feature-based organization (not type-based):

- `/app` - Next.js App Router pages and API routes
- `/components` - Shared UI components organized atomically (atoms, molecules, organisms)
- `/features` - Feature modules (e.g., `/features/gear`, `/features/trips`, `/features/pantry`)
- `/lib` - Utilities, helpers, and configuration
- `/hooks` - Custom React hooks
- `/types` - TypeScript type definitions
- `/public` - Static assets

### Component Patterns

- **Container/Presenter pattern**: Separate data fetching from UI rendering
- **Atomic design**: Atoms → Molecules → Organisms → Templates → Pages
- Each feature directory contains its own components, hooks, types, and API utilities

### State Management Strategy

- **React Query** for all server/remote state (gear lists, trips, user data)
- **Context API** for shared UI state (modals, theme, global notifications)
- **Component state** (useState) for local UI state only
- Keep read/write concerns separated

### Data Models

Key entities:

- **Gear Item**: name, category, weight, photo, notes, essential flag, ownership status
- **Trip/Packing List**: trip details, selected gear items, food items, weight calculations
- **Food Item**: name, weight, calories (per 100g), meal type, quantity, unit, expiration date
- **User**: authentication, profile, preferences, statistics

Weight calculations:

- Gear and food weight tracked separately
- Category-based weight distribution for visualizations
- Optional vs. essential item distinction

## Key Conventions

### Naming Conventions

- **Components**: PascalCase (e.g., `GearList.tsx`)
- **Functions/Variables**: camelCase (e.g., `calculateTotalWeight`)
- **Files**: kebab-case (e.g., `gear-item-card.tsx`)
- **CSS classes**: BEM methodology (e.g., `.gear-card__title--highlighted`)
- **API routes**: kebab-case (e.g., `/api/gear-items`, `/api/packing-lists`)

### TypeScript Usage

- Use TypeScript for all new files
- Define interfaces for all component props
- Use Zod schemas for API validation (these serve as both runtime validators and type sources)
- Prefer `interface` over `type` for object shapes
- Use `unknown` instead of `any` when type is truly unknown

### API Design

- Follow RESTful conventions
- API routes in `/app/api/[resource]/route.ts`
- Validate all requests with Zod schemas
- Consistent error response format: `{ error: string, details?: unknown }`
- Use proper HTTP status codes
- Implement rate limiting for public endpoints

### Form Handling

- Use React Hook Form for all forms
- Integrate Zod schema validation with `@hookform/resolvers/zod`
- Show inline validation errors
- Disable submit button during submission

### Performance Patterns

- Use Next.js Image component for all images
- Implement lazy loading for routes and heavy components
- Use React.memo() for expensive components
- Memoize expensive calculations with useMemo
- Paginate large datasets (gear lists, trip history)

### Testing Approach

- **Unit tests**: Jest + React Testing Library for components and utilities
- **Integration tests**: Cypress for user flows
- Target 70%+ coverage for critical paths (gear CRUD, trip creation, weight calculations)
- Test accessibility with axe-core
- Mock API calls in component tests

### Security Requirements

- Validate all user inputs on both client and server
- Use HTTPS only (enforced in production)
- Implement Content Security Policy headers
- Rate limit API endpoints
- Regular `npm audit` for dependency vulnerabilities
- Never commit API keys or secrets (use environment variables)

## Authentication Flow

- NextAuth.js handles OAuth providers and JWT sessions
- Protected API routes check session with `getServerSession()`
- Client-side route protection with middleware or HOCs
- Store user preferences in MongoDB linked to authenticated user ID

## File Upload (Gear Images)

- Images uploaded to AWS S3
- Generate pre-signed URLs for secure uploads
- Store S3 object keys in MongoDB
- Serve images through CloudFront or S3 public URLs
- Validate file types and sizes before upload

## Weight Calculations

- Store weights in grams for consistency
- Display in user's preferred unit (grams, ounces, pounds)
- Calculate totals by category for visualizations
- Separate gear weight and food weight in displays
- Weight-to-calorie ratio for food optimization

## Code Quality

- Run ESLint (Airbnb config) before committing
- Use Prettier for formatting (integrated with ESLint)
- Husky pre-commit hooks enforce linting and formatting
- All PRs require code review and passing tests

## Environment Variables

Required environment variables:

- `DATABASE_URL` - MongoDB connection string
- `NEXTAUTH_URL` - App URL
- `NEXTAUTH_SECRET` - NextAuth session secret
- `AWS_ACCESS_KEY_ID` - S3 upload credentials
- `AWS_SECRET_ACCESS_KEY` - S3 upload credentials
- `AWS_REGION` - S3 region
- `AWS_S3_BUCKET` - S3 bucket name
- `NEXT_PUBLIC_APP_URL` - Public app URL for sharing features

## Git Workflow

- **main**: production branch
- **develop**: staging/integration branch
- **feature/**: feature branches (e.g., `feature/gear-management`)
- All PRs require review, passing tests, and coverage thresholds
- Squash and merge to keep history clean

## Accessibility

- Follow WCAG 2.1 AA standards
- All interactive elements keyboard accessible
- Proper ARIA labels and roles
- Screen reader tested
- Sufficient color contrast ratios
