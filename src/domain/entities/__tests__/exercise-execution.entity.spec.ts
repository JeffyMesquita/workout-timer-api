import { ExerciseExecution } from '../exercise-execution.entity';
import { WorkoutSet } from '../set.entity';

describe('ExerciseExecution', () => {
  let exerciseExecution: ExerciseExecution;
  let workoutSet: WorkoutSet;

  beforeEach(() => {
    exerciseExecution = new ExerciseExecution(
      'execution-1',
      'session-1',
      'exercise-1',
      'NOT_STARTED',
      null,
      null,
      null,
      new Date('2023-01-01'),
      new Date('2023-01-01'),
      [],
    );

    workoutSet = new WorkoutSet(
      'set-1',
      'execution-1',
      1,
      10,
      null,
      null,
      null,
      null,
      null,
      new Date('2023-01-01'),
      new Date('2023-01-01'),
    );
  });

  describe('constructor', () => {
    it('should create exercise execution with correct properties', () => {
      expect(exerciseExecution.id).toBe('execution-1');
      expect(exerciseExecution.workoutSessionId).toBe('session-1');
      expect(exerciseExecution.exerciseId).toBe('exercise-1');
      expect(exerciseExecution.status).toBe('NOT_STARTED');
      expect(exerciseExecution.sets).toEqual([]);
    });
  });

  describe('start', () => {
    it('should start execution successfully', () => {
      exerciseExecution.start();

      expect(exerciseExecution.status).toBe('IN_PROGRESS');
      expect(exerciseExecution.startedAt).toBeDefined();
    });

    it('should throw error when already started', () => {
      exerciseExecution.start();

      expect(() => exerciseExecution.start()).toThrow(
        'Exercise execution has already been started',
      );
    });
  });

  describe('complete', () => {
    beforeEach(() => {
      exerciseExecution.start();
    });

    it('should complete execution successfully', () => {
      exerciseExecution.complete('Exercício finalizado');

      expect(exerciseExecution.status).toBe('COMPLETED');
      expect(exerciseExecution.completedAt).toBeDefined();
      expect(exerciseExecution.notes).toBe('Exercício finalizado');
    });

    it('should throw error when not in progress', () => {
      exerciseExecution.status = 'NOT_STARTED';

      expect(() => exerciseExecution.complete()).toThrow(
        'Can only complete an exercise execution that is in progress',
      );
    });
  });

  describe('skip', () => {
    it('should skip execution with reason', () => {
      exerciseExecution.skip('Lesão no ombro');

      expect(exerciseExecution.status).toBe('SKIPPED');
      expect(exerciseExecution.completedAt).toBeDefined();
      expect(exerciseExecution.notes).toBe('Pulado: Lesão no ombro');
    });

    it('should throw error when already completed', () => {
      exerciseExecution.start();
      exerciseExecution.complete();

      expect(() => exerciseExecution.skip()).toThrow('Cannot skip a completed exercise execution');
    });
  });

  describe('addSet', () => {
    beforeEach(() => {
      exerciseExecution.start();
    });

    it('should add set successfully', () => {
      exerciseExecution.addSet(workoutSet);

      expect(exerciseExecution.sets).toHaveLength(1);
      expect(exerciseExecution.sets[0]).toBe(workoutSet);
    });

    it('should throw error when not started', () => {
      exerciseExecution.status = 'NOT_STARTED';

      expect(() => exerciseExecution.addSet(workoutSet)).toThrow(
        'Cannot add sets before starting exercise execution',
      );
    });

    it('should throw error when completed', () => {
      exerciseExecution.complete();

      expect(() => exerciseExecution.addSet(workoutSet)).toThrow(
        'Cannot add sets to a completed or skipped exercise execution',
      );
    });

    it('should throw error for duplicate set number', () => {
      exerciseExecution.addSet(workoutSet);

      const duplicateSet = new WorkoutSet(
        'set-2',
        'execution-1',
        1, // Same set number
        10,
      );

      expect(() => exerciseExecution.addSet(duplicateSet)).toThrow('Set number 1 already exists');
    });
  });

  describe('updateSet', () => {
    beforeEach(() => {
      exerciseExecution.start();
      exerciseExecution.addSet(workoutSet);
    });

    it('should update set successfully', () => {
      exerciseExecution.updateSet(1, 12, 60, 'Boa série');

      const set = exerciseExecution.sets[0];
      expect(set.actualReps).toBe(12);
      expect(set.weight).toBe(60);
      expect(set.notes).toBe('Boa série');
    });

    it('should throw error for non-existent set', () => {
      expect(() => exerciseExecution.updateSet(2, 10)).toThrow('Set number 2 not found');
    });
  });

  describe('removeSet', () => {
    beforeEach(() => {
      exerciseExecution.start();
      exerciseExecution.addSet(workoutSet);
    });

    it('should remove set successfully', () => {
      exerciseExecution.removeSet(1);

      expect(exerciseExecution.sets).toHaveLength(0);
    });

    it('should throw error for non-existent set', () => {
      expect(() => exerciseExecution.removeSet(2)).toThrow('Set number 2 not found');
    });
  });

  describe('areAllSetsCompleted', () => {
    beforeEach(() => {
      exerciseExecution.start();
      exerciseExecution.addSet(workoutSet);
    });

    it('should return false when no sets completed', () => {
      expect(exerciseExecution.areAllSetsCompleted()).toBe(false);
    });

    it('should return true when all sets completed', () => {
      workoutSet.complete(10);

      expect(exerciseExecution.areAllSetsCompleted()).toBe(true);
    });

    it('should return false for empty sets array', () => {
      exerciseExecution.removeSet(1);

      expect(exerciseExecution.areAllSetsCompleted()).toBe(false);
    });
  });

  describe('getCompletedSetsCount', () => {
    beforeEach(() => {
      exerciseExecution.start();
    });

    it('should count completed sets correctly', () => {
      const set1 = new WorkoutSet('set-1', 'execution-1', 1, 10);
      const set2 = new WorkoutSet('set-2', 'execution-1', 2, 10);
      const set3 = new WorkoutSet('set-3', 'execution-1', 3, 10);

      exerciseExecution.addSet(set1);
      exerciseExecution.addSet(set2);
      exerciseExecution.addSet(set3);

      // Complete only first two sets
      set1.complete(10);
      set2.complete(8);

      expect(exerciseExecution.getCompletedSetsCount()).toBe(2);
    });
  });

  describe('getTotalDurationMs', () => {
    it('should return 0 when not started', () => {
      expect(exerciseExecution.getTotalDurationMs()).toBe(0);
    });

    it('should calculate duration for ongoing execution', () => {
      jest.useFakeTimers();
      const startTime = new Date();
      jest.setSystemTime(startTime);

      exerciseExecution.start();

      jest.advanceTimersByTime(5000); // 5 seconds

      expect(exerciseExecution.getTotalDurationMs()).toBe(5000);

      jest.useRealTimers();
    });

    it('should calculate duration for completed execution', () => {
      jest.useFakeTimers();
      const startTime = new Date();
      jest.setSystemTime(startTime);

      exerciseExecution.start();

      jest.advanceTimersByTime(10000); // 10 seconds
      exerciseExecution.complete();

      expect(exerciseExecution.getTotalDurationMs()).toBe(10000);

      jest.useRealTimers();
    });
  });

  describe('getFormattedDuration', () => {
    it('should format duration correctly', () => {
      jest.useFakeTimers();
      const startTime = new Date();
      jest.setSystemTime(startTime);

      exerciseExecution.start();

      jest.advanceTimersByTime(125000); // 2 minutes 5 seconds

      expect(exerciseExecution.getFormattedDuration()).toBe('02:05');

      jest.useRealTimers();
    });
  });

  describe('getSummary', () => {
    beforeEach(() => {
      exerciseExecution.start();
    });

    it('should return complete summary', () => {
      const set1 = new WorkoutSet('set-1', 'execution-1', 1, 10);
      const set2 = new WorkoutSet('set-2', 'execution-1', 2, 10);

      set1.complete(10, 50);
      set2.complete(8, 55);

      exerciseExecution.addSet(set1);
      exerciseExecution.addSet(set2);

      const summary = exerciseExecution.getSummary();

      expect(summary.status).toBe('IN_PROGRESS');
      expect(summary.completedSets).toBe(2);
      expect(summary.totalSets).toBe(2);
      expect(summary.completionRate).toBe(100);
      expect(summary.totalReps).toBe(18); // 10 + 8
      expect(summary.averageWeight).toBe(52.5); // (50 + 55) / 2
    });
  });

  describe('status checks', () => {
    it('should check if can be started', () => {
      expect(exerciseExecution.canBeStarted()).toBe(true);

      exerciseExecution.start();
      expect(exerciseExecution.canBeStarted()).toBe(false);
    });

    it('should check if can be completed', () => {
      expect(exerciseExecution.canBeCompleted()).toBe(false);

      exerciseExecution.start();
      expect(exerciseExecution.canBeCompleted()).toBe(true);

      exerciseExecution.complete();
      expect(exerciseExecution.canBeCompleted()).toBe(false);
    });

    it('should check if can be skipped', () => {
      expect(exerciseExecution.canBeSkipped()).toBe(true);

      exerciseExecution.start();
      expect(exerciseExecution.canBeSkipped()).toBe(true);

      exerciseExecution.complete();
      expect(exerciseExecution.canBeSkipped()).toBe(false);
    });

    it('should check if is active', () => {
      expect(exerciseExecution.isActive()).toBe(false);

      exerciseExecution.start();
      expect(exerciseExecution.isActive()).toBe(true);

      exerciseExecution.complete();
      expect(exerciseExecution.isActive()).toBe(false);
    });

    it('should check if is finished', () => {
      expect(exerciseExecution.isFinished()).toBe(false);

      exerciseExecution.start();
      expect(exerciseExecution.isFinished()).toBe(false);

      exerciseExecution.complete();
      expect(exerciseExecution.isFinished()).toBe(true);
    });
  });
});
