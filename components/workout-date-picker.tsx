"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { formatDateWithOrdinal } from "@/lib/date-utils";

export function WorkoutDatePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get date from URL or default to today (parse as local date to avoid timezone issues)
  const dateParam = searchParams.get("date");
  const selectedDate = dateParam
    ? new Date(dateParam + "T00:00:00") // Parse as local time, not UTC
    : new Date();

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;

    // Format date as YYYY-MM-DD in local timezone
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    // Update URL with new date and refresh to trigger server re-render
    const params = new URLSearchParams(searchParams);
    params.set("date", dateString);
    router.push(`/dashboard?${params.toString()}`);
    router.refresh(); // Force server component to re-render with new date
  };

  return (
    <div className="flex items-center gap-4">
      <h2 className="text-2xl font-semibold">Select Date</h2>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateWithOrdinal(selectedDate)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
