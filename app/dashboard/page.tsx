import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutsForDate } from "@/data/workouts";
import { WorkoutDatePicker } from "@/components/workout-date-picker";
import { WorkoutList } from "@/components/workout-list";

// Force dynamic rendering - ensures page re-fetches on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // Step 1: Get authenticated user
  const { userId } = await auth();

  // Step 2: Redirect if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  // Step 3: Get date from URL or default to today (parse as local date to avoid timezone issues)
  const params = await searchParams;
  const dateParam = params.date;
  const selectedDate = dateParam
    ? new Date(dateParam + "T00:00:00") // Parse as local time, not UTC
    : new Date();

  // Step 4: Fetch workouts for the selected date
  const workouts = await getWorkoutsForDate(userId, selectedDate);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Workout Dashboard</h1>
        <p className="text-muted-foreground">
          Track and review your daily workouts
        </p>
      </div>

      {/* Date Picker Section */}
      <div className="mb-8">
        <WorkoutDatePicker />
      </div>

      {/* Workouts Section */}
      <WorkoutList workouts={workouts} selectedDate={selectedDate} />
    </div>
  );
}
