import { WorkoutSet } from '../set.entity';

describe('WorkoutSet', () => {
  let workoutSet: WorkoutSet;

  beforeEach(() => {
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
    it('should create workout set with correct properties', () => {
      expect(workoutSet.id).toBe('set-1');
      expect(workoutSet.exerciseExecutionId).toBe('execution-1');
      expect(workoutSet.setNumber).toBe(1);
      expect(workoutSet.plannedReps).toBe(10);
      expect(workoutSet.actualReps).toBeNull();
      expect(workoutSet.weight).toBeNull();
      expect(workoutSet.isCompleted()).toBe(false);
    });

    it('should validate set number on creation', () => {
      expect(() => new WorkoutSet('set-1', 'exec-1', 0, 10)).toThrow(
        'Set number must be between 1 and 20',
      );

      expect(() => new WorkoutSet('set-1', 'exec-1', 21, 10)).toThrow(
        'Set number must be between 1 and 20',
      );
    });

    it('should validate planned reps on creation', () => {
      expect(() => new WorkoutSet('set-1', 'exec-1', 1, 0)).toThrow(
        'Planned reps must be between 1 and 100',
      );

      expect(() => new WorkoutSet('set-1', 'exec-1', 1, 101)).toThrow(
        'Planned reps must be between 1 and 100',
      );
    });
  });

  describe('complete', () => {
    it('should complete set with actual reps only', () => {
      workoutSet.complete(8);

      expect(workoutSet.actualReps).toBe(8);
      expect(workoutSet.weight).toBeNull();
      expect(workoutSet.isCompleted()).toBe(true);
      expect(workoutSet.completedAt).toBeDefined();
    });

    it('should complete set with weight and reps', () => {
      workoutSet.complete(10, 50, 'Boa série!', 90);

      expect(workoutSet.actualReps).toBe(10);
      expect(workoutSet.weight).toBe(50);
      expect(workoutSet.notes).toBe('Boa série!');
      expect(workoutSet.restTimeSeconds).toBe(90);
      expect(workoutSet.isCompleted()).toBe(true);
    });

    it('should validate actual reps', () => {
      expect(() => workoutSet.complete(-1)).toThrow('Actual reps must be between 0 and 100');

      expect(() => workoutSet.complete(101)).toThrow('Actual reps must be between 0 and 100');
    });

    it('should validate weight', () => {
      expect(() => workoutSet.complete(10, -1)).toThrow('Weight must be between 0 and 1000 kg');

      expect(() => workoutSet.complete(10, 1001)).toThrow('Weight must be between 0 and 1000 kg');
    });

    it('should validate rest time', () => {
      expect(() => workoutSet.complete(10, 50, '', -1)).toThrow(
        'Rest time must be between 0 and 1800 seconds',
      );

      expect(() => workoutSet.complete(10, 50, '', 1801)).toThrow(
        'Rest time must be between 0 and 1800 seconds',
      );
    });
  });

  describe('updateWeight', () => {
    it('should update weight', () => {
      workoutSet.updateWeight(75);

      expect(workoutSet.weight).toBe(75);
    });

    it('should validate weight', () => {
      expect(() => workoutSet.updateWeight(-1)).toThrow('Weight must be between 0 and 1000 kg');
    });
  });

  describe('updateReps', () => {
    it('should update actual reps', () => {
      workoutSet.updateReps(12);

      expect(workoutSet.actualReps).toBe(12);
    });

    it('should validate reps', () => {
      expect(() => workoutSet.updateReps(-1)).toThrow('Actual reps must be between 0 and 100');
    });
  });

  describe('isCompleted', () => {
    it('should return false for incomplete set', () => {
      expect(workoutSet.isCompleted()).toBe(false);
    });

    it('should return true for completed set', () => {
      workoutSet.complete(10);

      expect(workoutSet.isCompleted()).toBe(true);
    });

    it('should require both actualReps and completedAt', () => {
      workoutSet.actualReps = 10;
      // completedAt still null

      expect(workoutSet.isCompleted()).toBe(false);
    });
  });

  describe('wasSuccessful', () => {
    it('should return true for completed set with reps > 0', () => {
      workoutSet.complete(5);

      expect(workoutSet.wasSuccessful()).toBe(true);
    });

    it('should return false for completed set with 0 reps', () => {
      workoutSet.complete(0);

      expect(workoutSet.wasSuccessful()).toBe(false);
    });

    it('should return false for incomplete set', () => {
      expect(workoutSet.wasSuccessful()).toBe(false);
    });
  });

  describe('getRepsDifference', () => {
    it('should calculate positive difference', () => {
      workoutSet.complete(12); // 12 - 10 = +2

      expect(workoutSet.getRepsDifference()).toBe(2);
    });

    it('should calculate negative difference', () => {
      workoutSet.complete(8); // 8 - 10 = -2

      expect(workoutSet.getRepsDifference()).toBe(-2);
    });

    it('should return 0 for incomplete set', () => {
      expect(workoutSet.getRepsDifference()).toBe(0);
    });
  });

  describe('getCompletionPercentage', () => {
    it('should calculate completion percentage', () => {
      workoutSet.complete(8); // 8/10 = 80%

      expect(workoutSet.getCompletionPercentage()).toBe(80);
    });

    it('should handle over-completion', () => {
      workoutSet.complete(12); // 12/10 = 120%

      expect(workoutSet.getCompletionPercentage()).toBe(120);
    });

    it('should return 0 for incomplete set', () => {
      expect(workoutSet.getCompletionPercentage()).toBe(0);
    });
  });

  describe('getFormattedWeight', () => {
    it('should format weight with comma', () => {
      workoutSet.weight = 22.5;

      expect(workoutSet.getFormattedWeight()).toBe('22,5 kg');
    });

    it('should return body weight message for null weight', () => {
      expect(workoutSet.getFormattedWeight()).toBe('Peso corporal');
    });
  });

  describe('getFormattedRestTime', () => {
    it('should format seconds only', () => {
      workoutSet.restTimeSeconds = 45;

      expect(workoutSet.getFormattedRestTime()).toBe('45s');
    });

    it('should format minutes only', () => {
      workoutSet.restTimeSeconds = 120;

      expect(workoutSet.getFormattedRestTime()).toBe('2min');
    });

    it('should format minutes and seconds', () => {
      workoutSet.restTimeSeconds = 90;

      expect(workoutSet.getFormattedRestTime()).toBe('1min 30s');
    });

    it('should return not informed for null', () => {
      expect(workoutSet.getFormattedRestTime()).toBe('Não informado');
    });
  });

  describe('getFormattedDescription', () => {
    it('should format incomplete set', () => {
      const description = workoutSet.getFormattedDescription();

      expect(description).toBe('Série 1: 10 reps planejadas');
    });

    it('should format completed set with all info', () => {
      workoutSet.complete(10, 50, '', 60);

      const description = workoutSet.getFormattedDescription();

      expect(description).toBe('Série 1: 10/10 reps | 50 kg | Descanso: 1min');
    });

    it('should format completed set without weight', () => {
      workoutSet.complete(8);

      const description = workoutSet.getFormattedDescription();

      expect(description).toBe('Série 1: 8/10 reps');
    });
  });

  describe('compareWith', () => {
    let previousSet: WorkoutSet;

    beforeEach(() => {
      previousSet = new WorkoutSet(
        'set-prev',
        'execution-1',
        1,
        10,
        10,
        50,
        null,
        new Date(),
        null,
        new Date(),
        new Date(),
      );
    });

    it('should detect improvement in weight', () => {
      workoutSet.complete(10, 55); // Same reps, more weight

      const comparison = workoutSet.compareWith(previousSet);

      expect(comparison.weightImprovement).toBe(5);
      expect(comparison.repsImprovement).toBe(0);
      expect(comparison.overallImprovement).toBe('better');
    });

    it('should detect improvement in reps', () => {
      workoutSet.complete(12, 50); // More reps, same weight

      const comparison = workoutSet.compareWith(previousSet);

      expect(comparison.weightImprovement).toBe(0);
      expect(comparison.repsImprovement).toBe(2);
      expect(comparison.overallImprovement).toBe('better');
    });

    it('should detect worse performance', () => {
      workoutSet.complete(8, 45); // Less reps, less weight

      const comparison = workoutSet.compareWith(previousSet);

      expect(comparison.weightImprovement).toBe(-5);
      expect(comparison.repsImprovement).toBe(-2);
      expect(comparison.overallImprovement).toBe('worse');
    });

    it('should detect same performance', () => {
      workoutSet.complete(10, 50); // Same reps, same weight

      const comparison = workoutSet.compareWith(previousSet);

      expect(comparison.weightImprovement).toBe(0);
      expect(comparison.repsImprovement).toBe(0);
      expect(comparison.overallImprovement).toBe('same');
    });
  });

  describe('getStats', () => {
    it('should return stats for completed set', () => {
      workoutSet.complete(12, 60);

      const stats = workoutSet.getStats();

      expect(stats.isCompleted).toBe(true);
      expect(stats.wasSuccessful).toBe(true);
      expect(stats.repsDifference).toBe(2);
      expect(stats.completionPercentage).toBe(120);
      expect(stats.volume).toBe(720); // 60kg * 12 reps
    });

    it('should return stats for incomplete set', () => {
      const stats = workoutSet.getStats();

      expect(stats.isCompleted).toBe(false);
      expect(stats.wasSuccessful).toBe(false);
      expect(stats.repsDifference).toBe(0);
      expect(stats.completionPercentage).toBe(0);
      expect(stats.volume).toBe(0);
    });
  });

  describe('clone', () => {
    it('should create a copy with new IDs', () => {
      workoutSet.weight = 50;

      const cloned = workoutSet.clone('new-set-id', 'new-execution-id');

      expect(cloned.id).toBe('new-set-id');
      expect(cloned.exerciseExecutionId).toBe('new-execution-id');
      expect(cloned.setNumber).toBe(workoutSet.setNumber);
      expect(cloned.plannedReps).toBe(workoutSet.plannedReps);
      expect(cloned.weight).toBe(50); // Keep previous weight
      expect(cloned.actualReps).toBeNull(); // Reset actual values
      expect(cloned.completedAt).toBeNull();
    });
  });
});
