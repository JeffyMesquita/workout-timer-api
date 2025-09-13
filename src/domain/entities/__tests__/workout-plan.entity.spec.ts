import { Exercise } from '../exercise.entity';
import { WorkoutPlan } from '../workout-plan.entity';

describe('WorkoutPlan', () => {
  let workoutPlan: WorkoutPlan;
  let exercise: Exercise;

  beforeEach(() => {
    workoutPlan = new WorkoutPlan(
      'plan-1',
      'user-1',
      'Treino A',
      'Treino de peito e tríceps',
      true,
      new Date('2023-01-01'),
      new Date('2023-01-01'),
      [],
    );

    exercise = new Exercise(
      'exercise-1',
      'plan-1',
      'Supino reto',
      'Exercício para peitoral',
      'Peito',
      3,
      10,
      60,
      1,
      new Date('2023-01-01'),
      new Date('2023-01-01'),
    );
  });

  describe('constructor', () => {
    it('should create a workout plan with correct properties', () => {
      expect(workoutPlan.id).toBe('plan-1');
      expect(workoutPlan.userId).toBe('user-1');
      expect(workoutPlan.name).toBe('Treino A');
      expect(workoutPlan.description).toBe('Treino de peito e tríceps');
      expect(workoutPlan.isActive).toBe(true);
      expect(workoutPlan.exercises).toEqual([]);
    });
  });

  describe('addExercise', () => {
    it('should add exercise to workout plan', () => {
      workoutPlan.addExercise(exercise);

      expect(workoutPlan.exercises).toHaveLength(1);
      expect(workoutPlan.exercises[0]).toBe(exercise);
      expect(exercise.order).toBe(1);
    });

    it('should set correct order for multiple exercises', () => {
      const exercise2 = new Exercise(
        'exercise-2',
        'plan-1',
        'Supino inclinado',
        null,
        'Peito',
        3,
        10,
        60,
        2,
      );

      workoutPlan.addExercise(exercise);
      workoutPlan.addExercise(exercise2);

      expect(workoutPlan.exercises).toHaveLength(2);
      expect(workoutPlan.exercises[0].order).toBe(1);
      expect(workoutPlan.exercises[1].order).toBe(2);
    });

    it('should throw error when adding duplicate exercise', () => {
      workoutPlan.addExercise(exercise);

      expect(() => workoutPlan.addExercise(exercise)).toThrow(
        'Exercise already exists in this workout plan',
      );
    });

    it('should update updatedAt when adding exercise', () => {
      const initialUpdatedAt = workoutPlan.updatedAt;

      // Wait a bit to ensure different timestamp
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      workoutPlan.addExercise(exercise);

      expect(workoutPlan.updatedAt).not.toEqual(initialUpdatedAt);

      jest.useRealTimers();
    });
  });

  describe('removeExercise', () => {
    beforeEach(() => {
      workoutPlan.addExercise(exercise);
    });

    it('should remove exercise from workout plan', () => {
      workoutPlan.removeExercise('exercise-1');

      expect(workoutPlan.exercises).toHaveLength(0);
    });

    it('should throw error when removing non-existent exercise', () => {
      expect(() => workoutPlan.removeExercise('non-existent')).toThrow(
        'Exercise not found in this workout plan',
      );
    });

    it('should reorder remaining exercises after removal', () => {
      const exercise2 = new Exercise(
        'exercise-2',
        'plan-1',
        'Supino inclinado',
        null,
        'Peito',
        3,
        10,
        60,
        2,
      );
      const exercise3 = new Exercise(
        'exercise-3',
        'plan-1',
        'Supino declinado',
        null,
        'Peito',
        3,
        10,
        60,
        3,
      );

      workoutPlan.addExercise(exercise2);
      workoutPlan.addExercise(exercise3);

      // Remove middle exercise
      workoutPlan.removeExercise('exercise-2');

      expect(workoutPlan.exercises).toHaveLength(2);
      expect(workoutPlan.exercises[0].order).toBe(1);
      expect(workoutPlan.exercises[1].order).toBe(2);
    });
  });

  describe('updateExerciseOrder', () => {
    beforeEach(() => {
      const exercise2 = new Exercise(
        'exercise-2',
        'plan-1',
        'Supino inclinado',
        null,
        'Peito',
        3,
        10,
        60,
        2,
      );
      const exercise3 = new Exercise(
        'exercise-3',
        'plan-1',
        'Supino declinado',
        null,
        'Peito',
        3,
        10,
        60,
        3,
      );

      workoutPlan.addExercise(exercise);
      workoutPlan.addExercise(exercise2);
      workoutPlan.addExercise(exercise3);
    });

    it('should update exercise order correctly', () => {
      // Move first exercise to third position
      workoutPlan.updateExerciseOrder('exercise-1', 3);

      const orderedExercises = workoutPlan.getOrderedExercises();
      expect(orderedExercises[0].id).toBe('exercise-2');
      expect(orderedExercises[1].id).toBe('exercise-3');
      expect(orderedExercises[2].id).toBe('exercise-1');
    });

    it('should throw error for non-existent exercise', () => {
      expect(() => workoutPlan.updateExerciseOrder('non-existent', 2)).toThrow(
        'Exercise not found in this workout plan',
      );
    });

    it('should throw error for invalid order', () => {
      expect(() => workoutPlan.updateExerciseOrder('exercise-1', 0)).toThrow(
        'Invalid exercise order',
      );

      expect(() => workoutPlan.updateExerciseOrder('exercise-1', 4)).toThrow(
        'Invalid exercise order',
      );
    });
  });

  describe('canAddExercise', () => {
    it('should return true when under limit', () => {
      expect(workoutPlan.canAddExercise(5)).toBe(true);
    });

    it('should return false when at limit', () => {
      // Add exercises to reach limit
      for (let i = 1; i <= 3; i++) {
        const ex = new Exercise(
          `exercise-${i}`,
          'plan-1',
          `Exercise ${i}`,
          null,
          'Muscle',
          3,
          10,
          60,
          i,
        );
        workoutPlan.addExercise(ex);
      }

      expect(workoutPlan.canAddExercise(3)).toBe(false);
    });
  });

  describe('getNextExerciseOrder', () => {
    it('should return 1 for empty plan', () => {
      expect(workoutPlan.getNextExerciseOrder()).toBe(1);
    });

    it('should return correct next order', () => {
      workoutPlan.addExercise(exercise);
      expect(workoutPlan.getNextExerciseOrder()).toBe(2);
    });
  });

  describe('update', () => {
    it('should update name and description', () => {
      const newName = 'Treino B';
      const newDescription = 'Treino de costas';

      workoutPlan.update(newName, newDescription);

      expect(workoutPlan.name).toBe(newName);
      expect(workoutPlan.description).toBe(newDescription);
    });

    it('should update updatedAt timestamp', () => {
      const initialUpdatedAt = workoutPlan.updatedAt;

      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      workoutPlan.update('New Name', 'New Description');

      expect(workoutPlan.updatedAt).not.toEqual(initialUpdatedAt);

      jest.useRealTimers();
    });
  });

  describe('activate/deactivate', () => {
    it('should deactivate workout plan', () => {
      workoutPlan.deactivate();

      expect(workoutPlan.isActive).toBe(false);
    });

    it('should activate workout plan', () => {
      workoutPlan.deactivate();
      workoutPlan.activate();

      expect(workoutPlan.isActive).toBe(true);
    });
  });

  describe('getOrderedExercises', () => {
    it('should return exercises in correct order', () => {
      const exercise2 = new Exercise(
        'exercise-2',
        'plan-1',
        'Exercise 2',
        null,
        'Muscle',
        3,
        10,
        60,
        2,
      );

      // Add in reverse order
      workoutPlan.addExercise(exercise2);
      workoutPlan.addExercise(exercise);

      const orderedExercises = workoutPlan.getOrderedExercises();

      expect(orderedExercises[0].order).toBe(1);
      expect(orderedExercises[1].order).toBe(2);
    });

    it('should return a copy of exercises array', () => {
      workoutPlan.addExercise(exercise);

      const orderedExercises = workoutPlan.getOrderedExercises();
      orderedExercises.pop();

      expect(workoutPlan.exercises).toHaveLength(1);
    });
  });
});
