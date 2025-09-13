import { WorkoutLimits } from '../workout-limits.vo';

describe('WorkoutLimits', () => {
  describe('constructor', () => {
    it('should create workout limits with valid values', () => {
      const limits = new WorkoutLimits(2, 5, 30, false);

      expect(limits.maxWorkoutPlans).toBe(2);
      expect(limits.maxExercisesPerPlan).toBe(5);
      expect(limits.historyRetentionDays).toBe(30);
      expect(limits.canAccessTrainerFeatures).toBe(false);
    });

    it('should validate max workout plans', () => {
      expect(() => new WorkoutLimits(-2, 5, 30, false)).toThrow(
        'Max workout plans must be -1 (unlimited) or greater than 0',
      );

      expect(() => new WorkoutLimits(0, 5, 30, false)).toThrow(
        'Max workout plans must be -1 (unlimited) or greater than 0',
      );
    });

    it('should validate max exercises per plan', () => {
      expect(() => new WorkoutLimits(2, -2, 30, false)).toThrow(
        'Max exercises per plan must be -1 (unlimited) or greater than 0',
      );

      expect(() => new WorkoutLimits(2, 0, 30, false)).toThrow(
        'Max exercises per plan must be -1 (unlimited) or greater than 0',
      );
    });

    it('should validate history retention days', () => {
      expect(() => new WorkoutLimits(2, 5, -2, false)).toThrow(
        'History retention days must be -1 (unlimited) or greater than 0',
      );

      expect(() => new WorkoutLimits(2, 5, 0, false)).toThrow(
        'History retention days must be -1 (unlimited) or greater than 0',
      );
    });

    it('should allow -1 for unlimited values', () => {
      const limits = new WorkoutLimits(-1, -1, -1, true);

      expect(limits.maxWorkoutPlans).toBe(-1);
      expect(limits.maxExercisesPerPlan).toBe(-1);
      expect(limits.historyRetentionDays).toBe(-1);
    });
  });

  describe('createFreeTierLimits', () => {
    it('should create correct free tier limits', () => {
      const limits = WorkoutLimits.createFreeTierLimits();

      expect(limits.maxWorkoutPlans).toBe(2);
      expect(limits.maxExercisesPerPlan).toBe(5);
      expect(limits.historyRetentionDays).toBe(30);
      expect(limits.canAccessTrainerFeatures).toBe(false);
    });
  });

  describe('createPremiumLimits', () => {
    it('should create correct premium limits', () => {
      const limits = WorkoutLimits.createPremiumLimits();

      expect(limits.maxWorkoutPlans).toBe(-1);
      expect(limits.maxExercisesPerPlan).toBe(-1);
      expect(limits.historyRetentionDays).toBe(-1);
      expect(limits.canAccessTrainerFeatures).toBe(true);
    });
  });

  describe('canCreateWorkoutPlan', () => {
    it('should return true when under limit', () => {
      const limits = WorkoutLimits.createFreeTierLimits();

      expect(limits.canCreateWorkoutPlan(0)).toBe(true);
      expect(limits.canCreateWorkoutPlan(1)).toBe(true);
    });

    it('should return false when at or over limit', () => {
      const limits = WorkoutLimits.createFreeTierLimits();

      expect(limits.canCreateWorkoutPlan(2)).toBe(false);
      expect(limits.canCreateWorkoutPlan(3)).toBe(false);
    });

    it('should return true for unlimited (premium)', () => {
      const limits = WorkoutLimits.createPremiumLimits();

      expect(limits.canCreateWorkoutPlan(100)).toBe(true);
      expect(limits.canCreateWorkoutPlan(1000)).toBe(true);
    });
  });

  describe('canAddExercise', () => {
    it('should return true when under limit', () => {
      const limits = WorkoutLimits.createFreeTierLimits();

      expect(limits.canAddExercise(0)).toBe(true);
      expect(limits.canAddExercise(4)).toBe(true);
    });

    it('should return false when at or over limit', () => {
      const limits = WorkoutLimits.createFreeTierLimits();

      expect(limits.canAddExercise(5)).toBe(false);
      expect(limits.canAddExercise(6)).toBe(false);
    });

    it('should return true for unlimited (premium)', () => {
      const limits = WorkoutLimits.createPremiumLimits();

      expect(limits.canAddExercise(100)).toBe(true);
      expect(limits.canAddExercise(1000)).toBe(true);
    });
  });

  describe('shouldRetainHistory', () => {
    let limits: WorkoutLimits;

    beforeEach(() => {
      limits = WorkoutLimits.createFreeTierLimits(); // 30 days retention
    });

    it('should return true for recent dates', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10); // 10 days ago

      expect(limits.shouldRetainHistory(recentDate)).toBe(true);
    });

    it('should return false for old dates', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 40); // 40 days ago

      expect(limits.shouldRetainHistory(oldDate)).toBe(false);
    });

    it('should return true for date exactly at limit', () => {
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - 30); // exactly 30 days ago

      expect(limits.shouldRetainHistory(limitDate)).toBe(true);
    });

    it('should return true for unlimited retention (premium)', () => {
      const premiumLimits = WorkoutLimits.createPremiumLimits();
      const veryOldDate = new Date();
      veryOldDate.setFullYear(veryOldDate.getFullYear() - 1); // 1 year ago

      expect(premiumLimits.shouldRetainHistory(veryOldDate)).toBe(true);
    });
  });

  describe('getWorkoutPlanLimitMessage', () => {
    it('should return correct message for limited plans', () => {
      const limits = WorkoutLimits.createFreeTierLimits();

      expect(limits.getWorkoutPlanLimitMessage()).toBe('Máximo de 2 planos de treino');
    });

    it('should return correct message for unlimited plans', () => {
      const limits = WorkoutLimits.createPremiumLimits();

      expect(limits.getWorkoutPlanLimitMessage()).toBe('Planos de treino ilimitados');
    });
  });

  describe('getExerciseLimitMessage', () => {
    it('should return correct message for limited exercises', () => {
      const limits = WorkoutLimits.createFreeTierLimits();

      expect(limits.getExerciseLimitMessage()).toBe('Máximo de 5 exercícios por plano');
    });

    it('should return correct message for unlimited exercises', () => {
      const limits = WorkoutLimits.createPremiumLimits();

      expect(limits.getExerciseLimitMessage()).toBe('Exercícios ilimitados por plano');
    });
  });

  describe('getSummary', () => {
    it('should return correct summary for free tier', () => {
      const limits = WorkoutLimits.createFreeTierLimits();
      const summary = limits.getSummary();

      expect(summary.workoutPlans).toBe('Máximo de 2 planos de treino');
      expect(summary.exercises).toBe('Máximo de 5 exercícios por plano');
      expect(summary.history).toBe('Histórico de 30 dias');
      expect(summary.trainer).toBe('Funcionalidades de treinador não disponíveis');
    });

    it('should return correct summary for premium', () => {
      const limits = WorkoutLimits.createPremiumLimits();
      const summary = limits.getSummary();

      expect(summary.workoutPlans).toBe('Planos de treino ilimitados');
      expect(summary.exercises).toBe('Exercícios ilimitados por plano');
      expect(summary.history).toBe('Histórico completo');
      expect(summary.trainer).toBe('Funcionalidades de treinador disponíveis');
    });
  });

  describe('isPremium', () => {
    it('should return false for free tier', () => {
      const limits = WorkoutLimits.createFreeTierLimits();

      expect(limits.isPremium()).toBe(false);
    });

    it('should return true for premium', () => {
      const limits = WorkoutLimits.createPremiumLimits();

      expect(limits.isPremium()).toBe(true);
    });

    it('should return false for mixed limits', () => {
      const limits = new WorkoutLimits(-1, 5, 30, false); // unlimited plans but limited exercises

      expect(limits.isPremium()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for identical limits', () => {
      const limits1 = WorkoutLimits.createFreeTierLimits();
      const limits2 = WorkoutLimits.createFreeTierLimits();

      expect(limits1.equals(limits2)).toBe(true);
    });

    it('should return false for different limits', () => {
      const freeLimits = WorkoutLimits.createFreeTierLimits();
      const premiumLimits = WorkoutLimits.createPremiumLimits();

      expect(freeLimits.equals(premiumLimits)).toBe(false);
    });

    it('should return false for partially different limits', () => {
      const limits1 = new WorkoutLimits(2, 5, 30, false);
      const limits2 = new WorkoutLimits(2, 5, 30, true); // different trainer access

      expect(limits1.equals(limits2)).toBe(false);
    });
  });
});
