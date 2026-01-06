import 'dotenv/config';
import { db } from './index';
import { exerciseCategories, exercises } from './schema';

async function seed() {
  console.log('Starting database seeding...');

  try {
    // Seed exercise types
    console.log('Seeding exercise types...');
    const types = await db.insert(exerciseCategories).values([
      { name: 'Strength', type: 'type', description: 'Resistance training exercises' },
      { name: 'Cardio', type: 'type', description: 'Cardiovascular exercises' },
      { name: 'Flexibility', type: 'type', description: 'Stretching and mobility exercises' },
    ]).returning();
    console.log(`Created ${types.length} exercise types`);

    // Seed muscle groups
    console.log('Seeding muscle groups...');
    const muscleGroups = await db.insert(exerciseCategories).values([
      { name: 'Chest', type: 'muscle_group', description: 'Pectoral muscles' },
      { name: 'Back', type: 'muscle_group', description: 'Latissimus dorsi, trapezius, rhomboids' },
      { name: 'Legs', type: 'muscle_group', description: 'Quadriceps, hamstrings, calves' },
      { name: 'Shoulders', type: 'muscle_group', description: 'Deltoids' },
      { name: 'Arms', type: 'muscle_group', description: 'Biceps, triceps, forearms' },
      { name: 'Core', type: 'muscle_group', description: 'Abdominals, obliques' },
      { name: 'Full Body', type: 'muscle_group', description: 'Multiple muscle groups' },
    ]).returning();
    console.log(`Created ${muscleGroups.length} muscle groups`);

    // Get category IDs for linking exercises
    const chestCategory = muscleGroups.find(g => g.name === 'Chest');
    const backCategory = muscleGroups.find(g => g.name === 'Back');
    const legsCategory = muscleGroups.find(g => g.name === 'Legs');
    const shouldersCategory = muscleGroups.find(g => g.name === 'Shoulders');
    const armsCategory = muscleGroups.find(g => g.name === 'Arms');
    const coreCategory = muscleGroups.find(g => g.name === 'Core');
    const fullBodyCategory = muscleGroups.find(g => g.name === 'Full Body');

    // Seed predefined exercises (userId = null)
    console.log('Seeding predefined exercises...');
    const predefinedExercises = await db.insert(exercises).values([
      // Chest exercises
      {
        name: 'Bench Press',
        description: 'Classic barbell chest exercise',
        userId: null,
        categoryId: chestCategory?.id,
        instructions: '1. Lie on bench with feet flat on floor\n2. Grip bar slightly wider than shoulder width\n3. Lower bar to chest with control\n4. Press bar up until arms are extended',
      },
      {
        name: 'Incline Dumbbell Press',
        description: 'Upper chest focused pressing movement',
        userId: null,
        categoryId: chestCategory?.id,
        instructions: '1. Set bench to 30-45 degree incline\n2. Hold dumbbells at shoulder level\n3. Press dumbbells up and together\n4. Lower with control to starting position',
      },
      {
        name: 'Push-ups',
        description: 'Bodyweight chest exercise',
        userId: null,
        categoryId: chestCategory?.id,
        instructions: '1. Start in plank position with hands shoulder-width apart\n2. Lower body until chest nearly touches floor\n3. Push back up to starting position\n4. Keep core tight throughout',
      },

      // Back exercises
      {
        name: 'Deadlift',
        description: 'Compound full-body pulling exercise',
        userId: null,
        categoryId: backCategory?.id,
        instructions: '1. Stand with feet hip-width apart, bar over mid-foot\n2. Grip bar just outside legs\n3. Keep back straight, chest up\n4. Drive through heels to stand up\n5. Lower bar with control',
      },
      {
        name: 'Pull-ups',
        description: 'Bodyweight back exercise',
        userId: null,
        categoryId: backCategory?.id,
        instructions: '1. Hang from bar with palms facing away\n2. Pull yourself up until chin clears bar\n3. Lower with control to full hang\n4. Keep core engaged',
      },
      {
        name: 'Barbell Row',
        description: 'Horizontal pulling exercise for back thickness',
        userId: null,
        categoryId: backCategory?.id,
        instructions: '1. Bend at hips with slight knee bend\n2. Grip bar slightly wider than shoulder width\n3. Pull bar to lower chest/upper abdomen\n4. Lower with control',
      },

      // Leg exercises
      {
        name: 'Squat',
        description: 'Fundamental lower body exercise',
        userId: null,
        categoryId: legsCategory?.id,
        instructions: '1. Bar rests on upper back\n2. Feet shoulder-width apart, toes slightly out\n3. Descend by bending knees and hips\n4. Go to parallel or below\n5. Drive through heels to stand',
      },
      {
        name: 'Romanian Deadlift',
        description: 'Hamstring and glute focused hinge movement',
        userId: null,
        categoryId: legsCategory?.id,
        instructions: '1. Start standing with bar at hip level\n2. Push hips back while keeping legs relatively straight\n3. Lower bar to mid-shin level\n4. Drive hips forward to return to start',
      },
      {
        name: 'Leg Press',
        description: 'Machine-based quad exercise',
        userId: null,
        categoryId: legsCategory?.id,
        instructions: '1. Sit in machine with back against pad\n2. Place feet shoulder-width on platform\n3. Release safety and lower weight with control\n4. Press through heels to extend legs',
      },

      // Shoulder exercises
      {
        name: 'Overhead Press',
        description: 'Vertical pressing movement for shoulders',
        userId: null,
        categoryId: shouldersCategory?.id,
        instructions: '1. Start with bar at shoulder level\n2. Feet shoulder-width apart\n3. Press bar straight overhead\n4. Lock out arms at top\n5. Lower with control',
      },
      {
        name: 'Lateral Raise',
        description: 'Isolation exercise for side deltoids',
        userId: null,
        categoryId: shouldersCategory?.id,
        instructions: '1. Hold dumbbells at sides\n2. Raise arms out to sides until parallel to floor\n3. Keep slight bend in elbows\n4. Lower with control',
      },

      // Arm exercises
      {
        name: 'Barbell Curl',
        description: 'Classic bicep exercise',
        userId: null,
        categoryId: armsCategory?.id,
        instructions: '1. Stand with bar at arms length\n2. Curl bar up by bending elbows\n3. Keep upper arms stationary\n4. Lower with control',
      },
      {
        name: 'Tricep Dips',
        description: 'Bodyweight tricep exercise',
        userId: null,
        categoryId: armsCategory?.id,
        instructions: '1. Support yourself on parallel bars\n2. Lower body by bending elbows\n3. Keep torso upright\n4. Press back up to start',
      },

      // Core exercises
      {
        name: 'Plank',
        description: 'Isometric core stability exercise',
        userId: null,
        categoryId: coreCategory?.id,
        instructions: '1. Support body on forearms and toes\n2. Keep body in straight line\n3. Engage core and hold position\n4. Breathe steadily',
      },
      {
        name: 'Russian Twist',
        description: 'Rotational core exercise',
        userId: null,
        categoryId: coreCategory?.id,
        instructions: '1. Sit with knees bent, feet off floor\n2. Lean back slightly\n3. Rotate torso side to side\n4. Touch floor on each side',
      },

      // Full body
      {
        name: 'Burpees',
        description: 'High-intensity full body exercise',
        userId: null,
        categoryId: fullBodyCategory?.id,
        instructions: '1. Start standing\n2. Drop into squat, place hands on floor\n3. Jump feet back to plank\n4. Do push-up (optional)\n5. Jump feet forward\n6. Jump up with arms overhead',
      },
    ]).returning();
    console.log(`Created ${predefinedExercises.length} predefined exercises`);

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished');
    process.exit(0);
  });
