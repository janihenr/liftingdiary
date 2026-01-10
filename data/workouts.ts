/**
 * Workout Data Access Layer
 *
 * ALL functions in this file MUST:
 * 1. Accept userId as the first parameter
 * 2. Filter ALL queries by userId for security
 * 3. Use Drizzle ORM (never raw SQL)
 * 4. Return only data belonging to the specified user
 */

import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

/**
 * Get all workouts for a specific user and date
 * @param userId - Clerk user ID (NOT the database user.id)
 * @param date - The date to fetch workouts for
 * @returns Array of workouts with exercises and sets
 */
export async function getWorkoutsForDate(userId: string, date: Date) {
  // Opt out of Next.js data cache
  noStore();

  // First, get the database user ID from Clerk user ID
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.clerkUserId, userId),
  });

  if (!user) {
    return [];
  }

  // Set date range for the entire day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // CRITICAL: ALWAYS filter by userId
  const userWorkouts = await db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, user.id),
      gte(workouts.date, startOfDay),
      lte(workouts.date, endOfDay)
    ),
    with: {
      workoutExercises: {
        with: {
          exercise: true,
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.orderIndex)],
      },
    },
    orderBy: [desc(workouts.date)],
  });

  return userWorkouts;
}

/**
 * Get a single workout by ID for a specific user
 * @param userId - Clerk user ID (NOT the database user.id)
 * @param workoutId - The workout ID to fetch
 * @returns Workout or null if not found or doesn't belong to user
 */
export async function getWorkoutById(userId: string, workoutId: number) {
  // First, get the database user ID from Clerk user ID
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.clerkUserId, userId),
  });

  if (!user) {
    return null;
  }

  // CRITICAL: Filter by BOTH workoutId AND userId
  const workout = await db.query.workouts.findFirst({
    where: and(
      eq(workouts.id, workoutId),
      eq(workouts.userId, user.id) // Security: User can only access their data
    ),
    with: {
      workoutExercises: {
        with: {
          exercise: true,
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.orderIndex)],
      },
    },
  });

  return workout;
}

/**
 * Get workout count for a user within a date range
 * @param userId - Clerk user ID (NOT the database user.id)
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Number of workouts
 */
export async function getWorkoutCount(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  // First, get the database user ID from Clerk user ID
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.clerkUserId, userId),
  });

  if (!user) {
    return 0;
  }

  // CRITICAL: ALWAYS include userId filter
  const userWorkouts = await db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, user.id),
      gte(workouts.date, startDate),
      lte(workouts.date, endDate)
    ),
  });

  return userWorkouts.length;
}
