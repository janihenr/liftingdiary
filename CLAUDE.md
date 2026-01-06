# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Lifting Diary** application built with Next.js 16.1.1 using the App Router architecture, TypeScript, and Tailwind CSS v4.

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
