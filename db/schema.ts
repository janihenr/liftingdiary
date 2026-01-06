import {
  pgTable,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
  decimal,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// 1. USERS TABLE - Clerk Integration
// ============================================
export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  clerkUserId: varchar({ length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  clerkUserIdIdx: uniqueIndex("users_clerk_user_id_idx").on(table.clerkUserId),
}));

// ============================================
// 2. EXERCISE CATEGORIES - System-wide
// ============================================
export const categoryTypeEnum = pgEnum("category_type", [
  "type",        // strength, cardio, flexibility
  "muscle_group" // chest, back, legs, shoulders, arms, core, etc.
]);

export const exerciseCategories = pgTable("exercise_categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 100 }).notNull(),
  type: categoryTypeEnum().notNull(),
  description: text(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueNameType: uniqueIndex("exercise_categories_name_type_idx")
    .on(table.name, table.type),
}));

// ============================================
// 3. EXERCISES - Predefined + Custom
// ============================================
export const exercises = pgTable("exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),

  // NULL = predefined (system-wide), NOT NULL = custom (user-created)
  userId: integer().references(() => users.id, { onDelete: "cascade" }),

  // Category classification
  categoryId: integer().references(() => exerciseCategories.id, {
    onDelete: "restrict"
  }),

  // Instructions for performing the exercise
  instructions: text(),

  // Video URL or other media
  videoUrl: varchar({ length: 500 }),

  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("exercises_user_id_idx").on(table.userId),
  categoryIdIdx: index("exercises_category_id_idx").on(table.categoryId),
}));

// ============================================
// 4. WORKOUT TEMPLATES - Reusable Patterns
// ============================================
export const workoutTemplates = pgTable("workout_templates", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().references(() => users.id, {
    onDelete: "cascade"
  }),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  isFavorite: boolean().default(false).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("workout_templates_user_id_idx").on(table.userId),
}));

// ============================================
// 5. TEMPLATE EXERCISES - Junction Table
// ============================================
export const templateExercises = pgTable("template_exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  templateId: integer().notNull().references(() => workoutTemplates.id, {
    onDelete: "cascade"
  }),
  exerciseId: integer().notNull().references(() => exercises.id, {
    onDelete: "restrict"
  }),

  // Order of exercise in template
  orderIndex: integer().notNull(),

  // Suggested defaults (optional)
  suggestedSets: integer(),
  suggestedReps: integer(),
  suggestedWeight: decimal({ precision: 10, scale: 2 }),

  notes: text(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  templateIdIdx: index("template_exercises_template_id_idx").on(table.templateId),
  exerciseIdIdx: index("template_exercises_exercise_id_idx").on(table.exerciseId),
}));

// ============================================
// 6. WORKOUTS - Individual Sessions
// ============================================
export const workouts = pgTable("workouts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().references(() => users.id, {
    onDelete: "cascade"
  }),

  // Optional: link to template if created from one
  templateId: integer().references(() => workoutTemplates.id, {
    onDelete: "set null"
  }),

  name: varchar({ length: 255 }),
  date: timestamp({ withTimezone: true }).notNull(),

  // Duration in seconds (optional)
  durationSeconds: integer(),

  notes: text(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdDateIdx: index("workouts_user_id_date_idx").on(table.userId, table.date),
  templateIdIdx: index("workouts_template_id_idx").on(table.templateId),
}));

// ============================================
// 7. WORKOUT EXERCISES - Junction Table
// ============================================
export const workoutExercises = pgTable("workout_exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutId: integer().notNull().references(() => workouts.id, {
    onDelete: "cascade"
  }),
  exerciseId: integer().notNull().references(() => exercises.id, {
    onDelete: "restrict"
  }),

  // Order of exercise in workout
  orderIndex: integer().notNull(),

  // Exercise-level notes
  notes: text(),

  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  workoutIdIdx: index("workout_exercises_workout_id_idx").on(table.workoutId),
  exerciseIdIdx: index("workout_exercises_exercise_id_idx").on(table.exerciseId),
}));

// ============================================
// 8. SETS - Individual Set Data
// ============================================
export const sets = pgTable("sets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutExerciseId: integer().notNull().references(() => workoutExercises.id, {
    onDelete: "cascade"
  }),

  // Set number (1, 2, 3, etc.)
  setNumber: integer().notNull(),

  // Set data
  reps: integer().notNull(),
  weight: decimal({ precision: 10, scale: 2 }).notNull(),

  // Optional: Track if this was a warmup set
  isWarmup: boolean().default(false).notNull(),

  // Optional: Rate of perceived exertion (1-10)
  rpe: integer(),

  notes: text(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  workoutExerciseIdIdx: index("sets_workout_exercise_id_idx")
    .on(table.workoutExerciseId),
}));

// ============================================
// DRIZZLE RELATIONS (for queries)
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  exercises: many(exercises),
  workouts: many(workouts),
  workoutTemplates: many(workoutTemplates),
}));

export const exerciseCategoriesRelations = relations(
  exerciseCategories,
  ({ many }) => ({
    exercises: many(exercises),
  })
);

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  user: one(users, {
    fields: [exercises.userId],
    references: [users.id],
  }),
  category: one(exerciseCategories, {
    fields: [exercises.categoryId],
    references: [exerciseCategories.id],
  }),
  workoutExercises: many(workoutExercises),
  templateExercises: many(templateExercises),
}));

export const workoutTemplatesRelations = relations(
  workoutTemplates,
  ({ one, many }) => ({
    user: one(users, {
      fields: [workoutTemplates.userId],
      references: [users.id],
    }),
    templateExercises: many(templateExercises),
    workouts: many(workouts),
  })
);

export const templateExercisesRelations = relations(
  templateExercises,
  ({ one }) => ({
    template: one(workoutTemplates, {
      fields: [templateExercises.templateId],
      references: [workoutTemplates.id],
    }),
    exercise: one(exercises, {
      fields: [templateExercises.exerciseId],
      references: [exercises.id],
    }),
  })
);

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  user: one(users, {
    fields: [workouts.userId],
    references: [users.id],
  }),
  template: one(workoutTemplates, {
    fields: [workouts.templateId],
    references: [workoutTemplates.id],
  }),
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(
  workoutExercises,
  ({ one, many }) => ({
    workout: one(workouts, {
      fields: [workoutExercises.workoutId],
      references: [workouts.id],
    }),
    exercise: one(exercises, {
      fields: [workoutExercises.exerciseId],
      references: [exercises.id],
    }),
    sets: many(sets),
  })
);

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));
