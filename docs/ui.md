# UI Coding Standards

This document outlines the strict UI coding standards for the Lifting Diary application.

## Component Library

### shadcn/ui - MANDATORY

**CRITICAL RULE: ONLY shadcn/ui components shall be used throughout this project.**

- **ABSOLUTELY NO custom UI components should be created**
- All UI elements (buttons, inputs, cards, dialogs, etc.) MUST use shadcn/ui components
- If a component is needed, install it from shadcn/ui using `npx shadcn@latest add <component-name>`
- Do not create custom implementations of common UI patterns - use shadcn/ui equivalents

### Installing shadcn/ui Components

```bash
# Install a specific component
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog

# Components are added to components/ui/ directory
```

### Available shadcn/ui Components

Common components to use (install as needed):
- `button` - All buttons
- `input` - Text inputs
- `card` - Content containers
- `dialog` - Modals and dialogs
- `select` - Dropdown selects
- `calendar` - Date picker calendar
- `popover` - Popover containers
- `table` - Data tables
- `badge` - Status badges
- `separator` - Visual dividers
- `form` - Form components
- `label` - Form labels
- `toast` - Notifications
- `dropdown-menu` - Dropdown menus
- `tabs` - Tabbed interfaces
- `alert` - Alert messages

See full list at: https://ui.shadcn.com/docs/components

## Date Formatting

### Library: date-fns

All date formatting MUST use the `date-fns` library.

```bash
npm install date-fns
```

### Standard Date Format

Dates shall be displayed in the following format:
- **1st Sep 2025**
- **2nd Aug 2025**
- **3rd Jan 2026**

### Implementation

```typescript
import { format } from 'date-fns';

// Function to format dates with ordinal suffix
function formatDateWithOrdinal(date: Date): string {
  const day = format(date, 'd');
  const month = format(date, 'MMM');
  const year = format(date, 'yyyy');

  const suffix = getOrdinalSuffix(parseInt(day));

  return `${day}${suffix} ${month} ${year}`;
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// Usage
const formattedDate = formatDateWithOrdinal(new Date()); // "6th Jan 2026"
```

### Date Picker Component

For date selection, use shadcn/ui's calendar component:

```bash
npx shadcn@latest add calendar
npx shadcn@latest add popover
```

Example usage:
```typescript
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

function DatePicker() {
  const [date, setDate] = React.useState<Date>(new Date())

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {formatDateWithOrdinal(date)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => newDate && setDate(newDate)}
        />
      </PopoverContent>
    </Popover>
  )
}
```

## Summary

1. **ONLY shadcn/ui components** - No exceptions
2. **NO custom UI components** - Use shadcn/ui equivalents
3. **date-fns for all date formatting** - Consistent format: "1st Sep 2025"
4. Install components as needed from shadcn/ui
5. Follow shadcn/ui documentation for component usage
