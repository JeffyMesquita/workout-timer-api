import { Exercise } from '../exercise.entity';

describe('Exercise', () => {
  let exercise: Exercise;

  beforeEach(() => {
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
    it('should create exercise with correct properties', () => {
      expect(exercise.id).toBe('exercise-1');
      expect(exercise.workoutPlanId).toBe('plan-1');
      expect(exercise.name).toBe('Supino reto');
      expect(exercise.description).toBe('Exercício para peitoral');
      expect(exercise.targetMuscleGroup).toBe('Peito');
      expect(exercise.sets).toBe(3);
      expect(exercise.reps).toBe(10);
      expect(exercise.restTimeSeconds).toBe(60);
      expect(exercise.order).toBe(1);
    });

    it('should create exercise with default values', () => {
      const simpleExercise = new Exercise('exercise-2', 'plan-1', 'Push-up');

      expect(simpleExercise.description).toBeNull();
      expect(simpleExercise.targetMuscleGroup).toBeNull();
      expect(simpleExercise.sets).toBe(3);
      expect(simpleExercise.reps).toBe(10);
      expect(simpleExercise.restTimeSeconds).toBe(60);
      expect(simpleExercise.order).toBe(1);
    });

    it('should validate sets on creation', () => {
      expect(
        () => new Exercise('ex-1', 'plan-1', 'Test', null, null, 0, 10, 60, 1),
      ).toThrow('Sets must be between 1 and 20');

      expect(
        () => new Exercise('ex-1', 'plan-1', 'Test', null, null, 21, 10, 60, 1),
      ).toThrow('Sets must be between 1 and 20');
    });

    it('should validate reps on creation', () => {
      expect(
        () => new Exercise('ex-1', 'plan-1', 'Test', null, null, 3, 0, 60, 1),
      ).toThrow('Reps must be between 1 and 100');

      expect(
        () => new Exercise('ex-1', 'plan-1', 'Test', null, null, 3, 101, 60, 1),
      ).toThrow('Reps must be between 1 and 100');
    });

    it('should validate rest time on creation', () => {
      expect(
        () => new Exercise('ex-1', 'plan-1', 'Test', null, null, 3, 10, -1, 1),
      ).toThrow('Rest time must be between 0 and 600 seconds');

      expect(
        () => new Exercise('ex-1', 'plan-1', 'Test', null, null, 3, 10, 601, 1),
      ).toThrow('Rest time must be between 0 and 600 seconds');
    });

    it('should validate order on creation', () => {
      expect(
        () => new Exercise('ex-1', 'plan-1', 'Test', null, null, 3, 10, 60, 0),
      ).toThrow('Exercise order must be greater than 0');
    });
  });

  describe('update', () => {
    it('should update exercise properties', () => {
      const newName = 'Supino inclinado';
      const newDescription = 'Exercício para peitoral superior';
      const newMuscleGroup = 'Peito Superior';

      exercise.update(newName, newDescription, newMuscleGroup, 4, 12, 90);

      expect(exercise.name).toBe(newName);
      expect(exercise.description).toBe(newDescription);
      expect(exercise.targetMuscleGroup).toBe(newMuscleGroup);
      expect(exercise.sets).toBe(4);
      expect(exercise.reps).toBe(12);
      expect(exercise.restTimeSeconds).toBe(90);
    });

    it('should update updatedAt timestamp', () => {
      const initialUpdatedAt = exercise.updatedAt;

      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      exercise.update('New Name', null, null, 3, 10, 60);

      expect(exercise.updatedAt).not.toEqual(initialUpdatedAt);

      jest.useRealTimers();
    });

    it('should validate updated values', () => {
      expect(() => exercise.update('Test', null, null, 0, 10, 60)).toThrow(
        'Sets must be between 1 and 20',
      );

      expect(() => exercise.update('Test', null, null, 3, 0, 60)).toThrow(
        'Reps must be between 1 and 100',
      );

      expect(() => exercise.update('Test', null, null, 3, 10, -1)).toThrow(
        'Rest time must be between 0 and 600 seconds',
      );
    });
  });

  describe('updateSetsAndReps', () => {
    it('should update sets, reps and rest time', () => {
      exercise.updateSetsAndReps(4, 8, 120);

      expect(exercise.sets).toBe(4);
      expect(exercise.reps).toBe(8);
      expect(exercise.restTimeSeconds).toBe(120);
    });

    it('should validate values', () => {
      expect(() => exercise.updateSetsAndReps(0, 10, 60)).toThrow(
        'Sets must be between 1 and 20',
      );
    });
  });

  describe('updateOrder', () => {
    it('should update exercise order', () => {
      exercise.updateOrder(5);

      expect(exercise.order).toBe(5);
    });

    it('should validate order', () => {
      expect(() => exercise.updateOrder(0)).toThrow(
        'Exercise order must be greater than 0',
      );
    });
  });

  describe('getEstimatedDurationSeconds', () => {
    it('should calculate estimated duration correctly', () => {
      // 3 sets * 30 seconds execution + 2 rest periods * 60 seconds
      const expectedDuration = 3 * 30 + 2 * 60; // 210 seconds

      expect(exercise.getEstimatedDurationSeconds()).toBe(expectedDuration);
    });

    it('should handle single set correctly', () => {
      exercise.updateSetsAndReps(1, 10, 60);

      // 1 set * 30 seconds execution + 0 rest periods
      const expectedDuration = 1 * 30; // 30 seconds

      expect(exercise.getEstimatedDurationSeconds()).toBe(expectedDuration);
    });
  });

  describe('getFormattedDescription', () => {
    it('should format description with all information', () => {
      const formatted = exercise.getFormattedDescription();

      expect(formatted).toBe(
        '3 séries x 10 repetições | Descanso: 1min | Peito',
      );
    });

    it('should format description without muscle group', () => {
      exercise = new Exercise(
        'exercise-1',
        'plan-1',
        'Push-up',
        null,
        null,
        2,
        15,
        45,
        1,
      );

      const formatted = exercise.getFormattedDescription();

      expect(formatted).toBe('2 séries x 15 repetições | Descanso: 45s');
    });

    it('should format rest time correctly', () => {
      exercise.updateSetsAndReps(3, 10, 90); // 1min 30s

      const formatted = exercise.getFormattedDescription();

      expect(formatted).toContain('Descanso: 1min 30s');
    });

    it('should format rest time in seconds only', () => {
      exercise.updateSetsAndReps(3, 10, 45);

      const formatted = exercise.getFormattedDescription();

      expect(formatted).toContain('Descanso: 45s');
    });

    it('should format rest time in minutes only', () => {
      exercise.updateSetsAndReps(3, 10, 120); // 2min

      const formatted = exercise.getFormattedDescription();

      expect(formatted).toContain('Descanso: 2min');
    });
  });

  describe('clone', () => {
    it('should create a copy with new id and workout plan id', () => {
      const cloned = exercise.clone('new-exercise-id', 'new-plan-id');

      expect(cloned.id).toBe('new-exercise-id');
      expect(cloned.workoutPlanId).toBe('new-plan-id');
      expect(cloned.name).toBe(exercise.name);
      expect(cloned.description).toBe(exercise.description);
      expect(cloned.targetMuscleGroup).toBe(exercise.targetMuscleGroup);
      expect(cloned.sets).toBe(exercise.sets);
      expect(cloned.reps).toBe(exercise.reps);
      expect(cloned.restTimeSeconds).toBe(exercise.restTimeSeconds);
      expect(cloned.order).toBe(exercise.order);
    });

    it('should create new timestamps for cloned exercise', () => {
      const cloned = exercise.clone('new-exercise-id', 'new-plan-id');

      expect(cloned.createdAt).not.toBe(exercise.createdAt);
      expect(cloned.updatedAt).not.toBe(exercise.updatedAt);
    });
  });
});
