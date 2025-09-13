import { WorkoutLimitServiceImpl, WorkoutLimitExceededException } from '../workout-limit.service';

describe('WorkoutLimitServiceImpl', () => {
  let service: WorkoutLimitServiceImpl;

  beforeEach(() => {
    service = new WorkoutLimitServiceImpl();
  });

  describe('getLimitsForUser', () => {
    it('should return free tier limits for non-premium user', () => {
      const limits = service.getLimitsForUser(false);

      expect(limits.maxWorkoutPlans).toBe(2);
      expect(limits.maxExercisesPerPlan).toBe(5);
      expect(limits.historyRetentionDays).toBe(30);
      expect(limits.canAccessTrainerFeatures).toBe(false);
    });

    it('should return premium limits for premium user', () => {
      const limits = service.getLimitsForUser(true);

      expect(limits.maxWorkoutPlans).toBe(-1);
      expect(limits.maxExercisesPerPlan).toBe(-1);
      expect(limits.historyRetentionDays).toBe(-1);
      expect(limits.canAccessTrainerFeatures).toBe(true);
    });
  });

  describe('validateCanCreateWorkoutPlan', () => {
    it('should return valid result when under free tier limit', async () => {
      const result = await service.validateCanCreateWorkoutPlan(1, false);

      expect(result.isValid).toBe(true);
      expect(result.current).toBe(1);
      expect(result.limit).toBe(2);
    });

    it('should return invalid result when at free tier limit', async () => {
      const result = await service.validateCanCreateWorkoutPlan(2, false);

      expect(result.isValid).toBe(false);
      expect(result.current).toBe(2);
      expect(result.limit).toBe(2);
      expect(result.message).toContain('Você atingiu o limite de 2 planos de treino');
      expect(result.message).toContain('upgrade para Premium');
    });

    it('should return valid result for premium user regardless of count', async () => {
      const result = await service.validateCanCreateWorkoutPlan(100, true);

      expect(result.isValid).toBe(true);
      expect(result.current).toBe(100);
      expect(result.limit).toBe(-1);
    });
  });

  describe('validateCanAddExercise', () => {
    it('should return valid result when under free tier limit', async () => {
      const result = await service.validateCanAddExercise(3, false);

      expect(result.isValid).toBe(true);
      expect(result.current).toBe(3);
      expect(result.limit).toBe(5);
    });

    it('should return invalid result when at free tier limit', async () => {
      const result = await service.validateCanAddExercise(5, false);

      expect(result.isValid).toBe(false);
      expect(result.current).toBe(5);
      expect(result.limit).toBe(5);
      expect(result.message).toContain('Você atingiu o limite de 5 exercícios por plano');
      expect(result.message).toContain('upgrade para Premium');
    });

    it('should return valid result for premium user regardless of count', async () => {
      const result = await service.validateCanAddExercise(100, true);

      expect(result.isValid).toBe(true);
      expect(result.current).toBe(100);
      expect(result.limit).toBe(-1);
    });
  });

  describe('validateTrainerAccess', () => {
    it('should return invalid result for non-premium user', async () => {
      const result = await service.validateTrainerAccess(false);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe(
        'Funcionalidades de treinador disponíveis apenas para usuários Premium.',
      );
    });

    it('should return valid result for premium user', async () => {
      const result = await service.validateTrainerAccess(true);

      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
    });
  });

  describe('validateHistoryAccess', () => {
    it('should return valid result for recent date (free tier)', async () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10); // 10 days ago

      const result = await service.validateHistoryAccess(recentDate, false);

      expect(result.isValid).toBe(true);
    });

    it('should return invalid result for old date (free tier)', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 40); // 40 days ago

      const result = await service.validateHistoryAccess(oldDate, false);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('últimos 30 dias');
      expect(result.message).toContain('Esta data tem 40 dias');
      expect(result.message).toContain('upgrade para Premium');
      expect(result.limit).toBe(30);
      expect(result.current).toBe(40);
    });

    it('should return valid result for any date (premium)', async () => {
      const veryOldDate = new Date();
      veryOldDate.setFullYear(veryOldDate.getFullYear() - 1); // 1 year ago

      const result = await service.validateHistoryAccess(veryOldDate, true);

      expect(result.isValid).toBe(true);
    });
  });
});

describe('WorkoutLimitExceededException', () => {
  it('should create exception with validation result', () => {
    const validationResult = {
      isValid: false,
      message: 'Limit exceeded',
      current: 5,
      limit: 3,
    };

    const exception = new WorkoutLimitExceededException(validationResult);

    expect(exception.name).toBe('WorkoutLimitExceededException');
    expect(exception.message).toBe('Limit exceeded');
    expect(exception.validationResult).toBe(validationResult);
  });

  it('should create exception with custom message', () => {
    const validationResult = {
      isValid: false,
      message: 'Default message',
    };

    const exception = new WorkoutLimitExceededException(validationResult, 'Custom message');

    expect(exception.message).toBe('Custom message');
    expect(exception.validationResult).toBe(validationResult);
  });

  it('should use validation result message when no custom message provided', () => {
    const validationResult = {
      isValid: false,
      message: 'Validation message',
    };

    const exception = new WorkoutLimitExceededException(validationResult);

    expect(exception.message).toBe('Validation message');
  });
});
