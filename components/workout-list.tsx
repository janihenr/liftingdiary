import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateWithOrdinal } from "@/lib/date-utils";
import { format } from "date-fns";

// Type for workout data from the database
type WorkoutWithDetails = {
  id: number;
  name: string | null;
  date: Date;
  durationSeconds: number | null;
  notes: string | null;
  workoutExercises: {
    id: number;
    orderIndex: number;
    exercise: {
      id: number;
      name: string;
    };
    sets: {
      id: number;
      setNumber: number;
      reps: number;
      weight: string;
      isWarmup: boolean;
    }[];
  }[];
};

interface WorkoutListProps {
  workouts: WorkoutWithDetails[];
  selectedDate: Date;
}

export function WorkoutList({ workouts, selectedDate }: WorkoutListProps) {
  if (workouts.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Workouts for {formatDateWithOrdinal(selectedDate)}
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No workouts logged for this date.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Workouts for {formatDateWithOrdinal(selectedDate)}
      </h2>

      <div className="space-y-4">
        {workouts.map((workout) => {
          const completedTime = format(new Date(workout.date), "hh:mm a");
          const duration = workout.durationSeconds
            ? `${Math.floor(workout.durationSeconds / 60)} min`
            : null;

          return (
            <Card key={workout.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{workout.name || "Untitled Workout"}</CardTitle>
                    <CardDescription>
                      Completed at {completedTime}
                      {duration && ` • ${duration}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workout.workoutExercises.map((workoutExercise) => {
                    const exercise = workoutExercise.exercise;
                    const sets = workoutExercise.sets;

                    // Calculate total sets and show weight range
                    const totalSets = sets.length;
                    const weights = sets.map((s) => parseFloat(s.weight));
                    const minWeight = Math.min(...weights);
                    const maxWeight = Math.max(...weights);
                    const weightDisplay =
                      minWeight === maxWeight
                        ? `${minWeight}kg`
                        : `${minWeight}-${maxWeight}kg`;

                    // Get reps range
                    const reps = sets.map((s) => s.reps);
                    const minReps = Math.min(...reps);
                    const maxReps = Math.max(...reps);
                    const repsDisplay =
                      minReps === maxReps ? `${minReps}` : `${minReps}-${maxReps}`;

                    return (
                      <div
                        key={workoutExercise.id}
                        className="flex justify-between items-center p-3 bg-muted rounded-lg"
                      >
                        <div className="font-medium">{exercise.name}</div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{totalSets} sets</span>
                          <span>{repsDisplay} reps</span>
                          <span className="font-semibold text-foreground">
                            {weightDisplay}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
