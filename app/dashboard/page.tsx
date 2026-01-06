"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { formatDateWithOrdinal } from "@/lib/date-utils";

// Mock workout data for demonstration
const mockWorkouts = [
  {
    id: 1,
    name: "Morning Strength Training",
    exercises: [
      { name: "Bench Press", sets: 4, reps: 8, weight: "80kg" },
      { name: "Squats", sets: 4, reps: 10, weight: "100kg" },
      { name: "Deadlifts", sets: 3, reps: 6, weight: "120kg" },
    ],
    duration: "45 min",
    completedAt: "08:30 AM",
  },
  {
    id: 2,
    name: "Evening Cardio",
    exercises: [
      { name: "Running", sets: 1, reps: 1, weight: "5km" },
      { name: "Jump Rope", sets: 3, reps: 100, weight: "-" },
    ],
    duration: "30 min",
    completedAt: "06:00 PM",
  },
];

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">Select Date</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDateWithOrdinal(selectedDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(newDate) => newDate && setSelectedDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Workouts Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Workouts for {formatDateWithOrdinal(selectedDate)}
        </h2>

        {mockWorkouts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No workouts logged for this date.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {mockWorkouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{workout.name}</CardTitle>
                      <CardDescription>
                        Completed at {workout.completedAt} • {workout.duration}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workout.exercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-muted rounded-lg"
                      >
                        <div className="font-medium">{exercise.name}</div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{exercise.sets} sets</span>
                          <span>{exercise.reps} reps</span>
                          <span className="font-semibold text-foreground">
                            {exercise.weight}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
