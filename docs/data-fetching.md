# Data Fetching Standards

This document outlines the **CRITICAL** data fetching and database access patterns for the Lifting Diary application.

## CRITICAL RULE: Server Components ONLY

**ALL data fetching in this application MUST be done via Server Components.**

### ABSOLUTELY FORBIDDEN

The following approaches are **STRICTLY PROHIBITED**:

- ❌ **NO Route Handlers** (`app/api/*`) for data fetching
- ❌ **NO Client Components** with data fetching (no `useEffect`, `useSWR`, `react-query`, etc.)
- ❌ **NO Server Actions** for data retrieval (only for mutations)
- ❌ **NO API endpoints** of any kind for getting data
- ❌ **NO other methods** - if it's not a Server Component, it's forbidden

### ✅ CORRECT: Server Components

```typescript
// app/dashboard/page.tsx - CORRECT ✅
import { getWorkoutsForDate } from "@/data/workouts";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Data fetching happens directly in the server component
  const workouts = await getWorkoutsForDate(userId, new Date());

  return (
    <div>
      {workouts.map(workout => (
        <WorkoutCard key={workout.id} workout={workout} />
      ))}
    </div>
  );
}
```

### ❌ INCORRECT Examples

```typescript
// ❌ WRONG: Route Handler
// app/api/workouts/route.ts - NEVER DO THIS
export async function GET(request: Request) {
  // FORBIDDEN - Do not create API routes for data fetching
}

// ❌ WRONG: Client Component with useEffect
"use client";
export default function Dashboard() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    // FORBIDDEN - No data fetching in client components
    fetch('/api/workouts').then(/*...*/);
  }, []);
}

// ❌ WRONG: Server Action for data retrieval
async function getWorkouts() {
  "use server";
  // FORBIDDEN - Server actions are for mutations only
  return await db.query.workouts.findMany();
}
```

## Database Access via /data Directory

### CRITICAL RULE: Helper Functions ONLY

All database queries MUST be performed through helper functions in the `/data` directory.

### Directory Structure

```
/data
  ├── workouts.ts      # Workout-related queries
  ├── exercises.ts     # Exercise-related queries
  ├── users.ts         # User-related queries
  └── ...
```

### MANDATORY Requirements

1. **Use Drizzle ORM** - ALWAYS
2. **NO RAW SQL** - NEVER use raw SQL queries
3. **User Isolation** - ALWAYS filter by userId
4. **Helper Functions** - All queries in `/data` directory

### ✅ CORRECT: Data Helper Pattern

```typescript
// data/workouts.ts - CORRECT ✅

import { db } from "@/db";
import { workouts, exercises } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Get all workouts for a specific user and date
 * @param userId - The authenticated user's ID from Clerk
 * @param date - The date to fetch workouts for
 * @returns Array of workouts with exercises
 */
export async function getWorkoutsForDate(userId: string, date: Date) {
  // CRITICAL: ALWAYS filter by userId to ensure data isolation
  const userWorkouts = await db.query.workouts.findMany({
    where: eq(workouts.userId, userId),
    with: {
      exercises: true,
    },
  });

  return userWorkouts;
}

/**
 * Get a single workout by ID for a specific user
 * @param userId - The authenticated user's ID from Clerk
 * @param workoutId - The workout ID to fetch
 * @returns Workout or null if not found or doesn't belong to user
 */
export async function getWorkoutById(userId: string, workoutId: number) {
  // CRITICAL: Filter by BOTH workoutId AND userId
  const workout = await db.query.workouts.findFirst({
    where: and(
      eq(workouts.id, workoutId),
      eq(workouts.userId, userId) // Security: User can only access their data
    ),
    with: {
      exercises: true,
    },
  });

  return workout;
}

/**
 * Get workout statistics for a user
 * @param userId - The authenticated user's ID from Clerk
 * @returns Workout statistics
 */
export async function getWorkoutStats(userId: string) {
  // CRITICAL: ALWAYS include userId filter
  const stats = await db.select()
    .from(workouts)
    .where(eq(workouts.userId, userId));

  return {
    totalWorkouts: stats.length,
    // ... other statistics
  };
}
```

### ❌ INCORRECT Examples

```typescript
// ❌ WRONG: Raw SQL
export async function getWorkouts(userId: string) {
  // FORBIDDEN - Never use raw SQL
  const result = await db.execute(
    sql`SELECT * FROM workouts WHERE user_id = ${userId}`
  );
  return result;
}

// ❌ WRONG: Missing userId filter
export async function getWorkoutById(workoutId: number) {
  // SECURITY VIOLATION - No userId filter!
  // This allows users to access other users' data
  const workout = await db.query.workouts.findFirst({
    where: eq(workouts.id, workoutId),
  });
  return workout;
}

// ❌ WRONG: Direct database access in component
// app/dashboard/page.tsx
import { db } from "@/db";

export default async function DashboardPage() {
  // FORBIDDEN - Don't query database directly in components
  const workouts = await db.query.workouts.findMany();
  return <div>...</div>;
}
```

## Security: User Data Isolation

### CRITICAL SECURITY RULE

**Every database query MUST filter by the authenticated user's ID.**

This prevents users from accessing other users' data.

### Authentication with Clerk

```typescript
// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutsForDate } from "@/data/workouts";

export default async function DashboardPage() {
  // Step 1: Get authenticated user
  const { userId } = await auth();

  // Step 2: Redirect if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  // Step 3: Pass userId to ALL data functions
  const workouts = await getWorkoutsForDate(userId, new Date());

  return <div>{/* Render workouts */}</div>;
}
```

### Security Checklist

Every data helper function MUST:

- ✅ Accept `userId: string` as the first parameter
- ✅ Include `userId` filter in ALL queries using `eq(table.userId, userId)`
- ✅ Use `and()` when combining with other conditions
- ✅ Use Drizzle ORM (never raw SQL)
- ✅ Return only data belonging to the specified user

### Multi-Condition Queries

When filtering by multiple conditions, ALWAYS include userId:

```typescript
import { and, eq, gte, lte } from "drizzle-orm";

export async function getWorkoutsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  return await db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),     // CRITICAL: Always include
      gte(workouts.date, startDate),
      lte(workouts.date, endDate)
    ),
  });
}
```

## Data Flow Pattern

### Complete Flow Example

```
1. User visits page
   ↓
2. Server Component renders
   ↓
3. Get userId from Clerk auth
   ↓
4. Call helper function in /data with userId
   ↓
5. Helper queries database via Drizzle ORM
   ↓
6. Helper filters by userId (security)
   ↓
7. Return data to Server Component
   ↓
8. Render data in Server Component
   ↓
9. Pass data as props to Client Components (if needed for interactivity)
```

### Code Example

```typescript
// Step 1-2: Server Component
// app/workouts/[id]/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { WorkoutDisplay } from "@/components/workout-display";

export default async function WorkoutPage({
  params,
}: {
  params: { id: string };
}) {
  // Step 3: Get userId
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Step 4: Call helper with userId
  const workout = await getWorkoutById(userId, parseInt(params.id));

  if (!workout) {
    notFound(); // Returns 404 if workout doesn't exist or doesn't belong to user
  }

  // Step 8: Render in Server Component
  // Step 9: Pass to Client Component as props
  return <WorkoutDisplay workout={workout} />;
}

// Client Component receives data as props
// components/workout-display.tsx
"use client";

export function WorkoutDisplay({ workout }: { workout: Workout }) {
  // Client component handles interactivity, but receives data as props
  const [isExpanded, setIsExpanded] = useState(false);

  return <div>{/* Interactive UI */}</div>;
}
```

## Summary

### ✅ DO

- ✅ Fetch data in Server Components
- ✅ Use helper functions from `/data` directory
- ✅ Use Drizzle ORM for all queries
- ✅ ALWAYS filter by `userId`
- ✅ Pass data as props to Client Components
- ✅ Get `userId` from `auth()` in Server Components

### ❌ DON'T

- ❌ Create API routes for data fetching
- ❌ Fetch data in Client Components
- ❌ Use raw SQL queries
- ❌ Query database directly in components
- ❌ Forget to filter by userId
- ❌ Allow users to access other users' data

## File Organization

```
/app
  /dashboard
    page.tsx              # Server Component - fetches data
  /workouts
    /[id]
      page.tsx            # Server Component - fetches data

/data                     # All database helper functions
  workouts.ts             # Workout queries
  exercises.ts            # Exercise queries
  users.ts                # User queries

/components
  workout-card.tsx        # Client Component - receives data as props
  exercise-list.tsx       # Client Component - receives data as props

/db
  index.ts                # Database connection
  schema.ts               # Drizzle schema definitions
```

## Additional Notes

- Server Components are the default in Next.js App Router
- Only use `"use client"` when you need interactivity (state, effects, event handlers)
- Server Components can be async, Client Components cannot
- Server Components run on the server, have no bundle size impact
- This pattern provides better performance, security, and SEO
