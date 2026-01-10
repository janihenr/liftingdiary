# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Lifting Diary** application built with Next.js 16.1.1 using the App Router architecture, TypeScript, and Tailwind CSS v4.

## CRITICAL: Documentation-First Development

**ALWAYS refer to the `/docs` directory BEFORE generating any code.**

- The `/docs` directory contains authoritative documentation for this project
- Before implementing ANY feature, component, or functionality, CHECK if there is relevant documentation in `/docs`
- Follow patterns, conventions, and specifications defined in the documentation files
- If documentation exists for what you're building, use it as the primary reference
- Documentation files take precedence over assumptions or general best practices

This ensures consistency, follows project-specific patterns, and prevents reimplementation of documented solutions.

### MANDATORY Documentation References

**These documentation files MUST be consulted before writing ANY code:**

1. **`docs/ui.md`** - UI components and styling standards
   - ONLY shadcn/ui components allowed
   - Date formatting with date-fns
   - Shared utility extraction patterns

2. **`docs/data-fetching.md`** - Data fetching and security patterns
   - Server Components ONLY for data fetching
   - Helper functions in `/data` directory
   - User data isolation with userId filtering
   - Drizzle ORM usage (NO raw SQL)

**DO NOT write any UI code without reading `docs/ui.md`.**
**DO NOT write any data fetching code without reading `docs/data-fetching.md`.**

These documents define critical security and architectural patterns that MUST be followed.

### Extracting Reusable Utilities

When documentation provides example code (e.g., helper functions, utilities):
- **DO NOT** copy-paste the code directly into components
- **DO** extract reusable functions to shared utility files in `lib/`
- **DO** import and use these utilities across multiple components
- **Avoid code duplication** - if a pattern appears in documentation, it should be in one place

Example: The date formatting functions from `docs/ui.md` should be in `lib/date-utils.ts`, not duplicated in each component.

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Architecture

### Framework & Routing
- **Next.js 16.1.1** with App Router (app directory)
- TypeScript with strict mode enabled
- React 19.2.3 with JSX transform

### Authentication
- **Clerk** for user authentication and management
- Uses `clerkMiddleware()` in `proxy.ts` for request handling
- `<ClerkProvider>` wraps the entire app in `app/layout.tsx`
- Clerk components in layout header:
  - `<SignInButton />` and `<SignUpButton />` shown when signed out
  - `<UserButton />` shown when signed in
  - `<SignedIn>` and `<SignedOut>` for conditional rendering
- Environment variables required (see `.env.example`):
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Get from Clerk Dashboard
  - `CLERK_SECRET_KEY` - Get from Clerk Dashboard

### Database
- **Neon PostgreSQL** - Serverless Postgres database
- **Drizzle ORM** - Type-safe database queries
- Connection via `@neondatabase/serverless`
- Schema defined in `db/schema.ts`
- All queries via helper functions in `data/` directory
- **CRITICAL**: All queries MUST filter by `userId` for data isolation

### Styling
- **Tailwind CSS v4** using `@tailwindcss/postcss`
- Custom CSS variables defined in `app/globals.css`
- Theme uses inline CSS variables via `@theme inline` directive
- Supports dark mode via `prefers-color-scheme`
- Two Google fonts: Geist Sans and Geist Mono

### File Structure
- `app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with ClerkProvider and auth components
  - `page.tsx` - Home page component
  - `globals.css` - Global styles and Tailwind imports
- `data/` - **Database query helper functions (Drizzle ORM)**
  - `workouts.ts` - Workout-related queries (filtered by userId)
  - `exercises.ts` - Exercise-related queries (filtered by userId)
  - All queries MUST filter by userId for security
- `db/` - Database configuration and schema
  - `index.ts` - Database connection
  - `schema.ts` - Drizzle ORM schema definitions
- `lib/` - Shared utility functions and helpers
  - `utils.ts` - Tailwind CSS class merging utilities (cn function)
  - `date-utils.ts` - Date formatting utilities (formatDateWithOrdinal, etc.)
- `components/` - React components
  - `ui/` - shadcn/ui components (auto-generated)
- `docs/` - Project documentation (authoritative reference)
  - `ui.md` - UI component and styling standards
  - `data-fetching.md` - Data fetching and security patterns
- `proxy.ts` - Clerk middleware using `clerkMiddleware()`
- `public/` - Static assets (SVG files)
- `.env.local` - Environment variables (not committed)
- `.env.example` - Example environment variables template
- Path alias: `@/*` maps to project root

### TypeScript Configuration
- Target: ES2017
- Module resolution: bundler
- JSX: react-jsx (React 19 transform)
- Strict mode enabled
- Path alias configured: `@/*` → `./*`

### ESLint
- Uses Next.js recommended configurations:
  - `eslint-config-next/core-web-vitals`
  - `eslint-config-next/typescript`
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Development Workflow

### When to Run Build
Run `npm run build` in these scenarios:
- After making significant code changes to verify production build succeeds
- Before creating commits or pull requests
- When fixing TypeScript errors to ensure type safety
- After modifying configuration files (`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`)
- To catch build-time errors that may not appear in development mode

The build command performs:
- TypeScript type checking
- Next.js production optimization
- Static page generation
- Asset bundling and optimization

## Key Patterns

- Root layout applies Geist fonts via CSS variables (`--font-geist-sans`, `--font-geist-mono`)
- Tailwind theme extended with custom CSS properties in `globals.css`
- Dark mode styling uses `dark:` prefix with automatic `prefers-color-scheme` detection

## UI Component Standards

**CRITICAL: See `docs/ui.md` for complete UI standards.**

Key rules:
- **ONLY shadcn/ui components** - NO custom UI components
- Install components with `npx shadcn@latest add <component-name>`
- **date-fns** for all date formatting (standard format: "1st Sep 2025")
- Use shared utilities from `lib/` (e.g., `formatDateWithOrdinal` from `lib/date-utils.ts`)

Before creating any UI, check `docs/ui.md` for component and formatting requirements.

## Data Fetching Standards

**CRITICAL: See `docs/data-fetching.md` for complete data fetching standards.**

Key rules:
- **ONLY Server Components** - ALL data fetching via Server Components
- **NO API routes** - NEVER create route handlers for data fetching
- **NO client-side fetching** - NEVER fetch data in Client Components
- **Helper functions in `/data`** - ALL database queries via helper functions
- **Drizzle ORM ONLY** - NEVER use raw SQL
- **User isolation** - ALWAYS filter by `userId` to prevent data leaks

Before implementing any data fetching, check `docs/data-fetching.md` for security and pattern requirements.
