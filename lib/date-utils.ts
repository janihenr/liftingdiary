import { format } from "date-fns";

/**
 * Get ordinal suffix for a day number (1st, 2nd, 3rd, 4th, etc.)
 */
export function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/**
 * Format a date with ordinal suffix
 * @example formatDateWithOrdinal(new Date()) // "6th Jan 2026"
 */
export function formatDateWithOrdinal(date: Date): string {
  const day = format(date, "d");
  const month = format(date, "MMM");
  const year = format(date, "yyyy");

  const suffix = getOrdinalSuffix(parseInt(day));

  return `${day}${suffix} ${month} ${year}`;
}
