import { WorkoutPlan } from '../../../domain/entities/workout-plan.entity';
import { WorkoutLimitExceededException } from '../../../domain/services/workout-limit.service';
import { WorkoutLimits } from '../../../domain/value-objects/workout-limits.vo';
import { CreateWorkoutPlanUseCase } from '../create-workout-plan.usecase';

import type { WorkoutPlanRepository } from '../../../domain/repositories/workout-plan.repository';
import type { WorkoutLimitService } from '../../../domain/services/workout-limit.service';
import type { CheckPremiumStatusUseCase } from '../check-premium-status.usecase';

describe('CreateWorkoutPlanUseCase', () => {
  let useCase: CreateWorkoutPlanUseCase;
  let mockWorkoutPlanRepository: jest.Mocked<WorkoutPlanRepository>;
  let mockWorkoutLimitService: jest.Mocked<WorkoutLimitService>;
  let mockCheckPremiumStatus: jest.Mocked<CheckPremiumStatusUseCase>;

  beforeEach(() => {
    mockWorkoutPlanRepository = {
      findById: jest.fn(),
      findByIdAndUserId: jest.fn(),
      findByUserId: jest.fn(),
      findActiveByUserId: jest.fn(),
      countByUserId: jest.fn(),
      countActiveByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      existsByUserIdAndName: jest.fn(),
      findByUserIdWithPagination: jest.fn(),
      searchByName: jest.fn(),
    };

    mockWorkoutLimitService = {
      getLimitsForUser: jest.fn(),
      validateCanCreateWorkoutPlan: jest.fn(),
      validateCanAddExercise: jest.fn(),
      validateTrainerAccess: jest.fn(),
      validateHistoryAccess: jest.fn(),
    };

    mockCheckPremiumStatus = {
      execute: jest.fn(),
    } as any;

    useCase = new CreateWorkoutPlanUseCase(
      mockWorkoutPlanRepository,
      mockWorkoutLimitService,
      mockCheckPremiumStatus,
    );

    // Setup default mocks
    mockCheckPremiumStatus.execute.mockResolvedValue({
      status: 'none',
      isPremium: false,
      expiryDate: undefined,
    });

    mockWorkoutPlanRepository.countActiveByUserId.mockResolvedValue(0);
    mockWorkoutPlanRepository.existsByUserIdAndName.mockResolvedValue(false);

    mockWorkoutLimitService.validateCanCreateWorkoutPlan.mockResolvedValue({
      isValid: true,
      current: 0,
      limit: 2,
    });

    mockWorkoutLimitService.getLimitsForUser.mockReturnValue(WorkoutLimits.createFreeTierLimits());

    mockWorkoutPlanRepository.save.mockImplementation(async (plan) => plan);
  });

  describe('execute', () => {
    const validInput = {
      userId: 'user-1',
      name: 'Treino A',
      description: 'Treino de peito e tríceps',
    };

    it('should create workout plan successfully for free tier user', async () => {
      const result = await useCase.execute(validInput);

      expect(result).toMatchObject({
        name: 'Treino A',
        description: 'Treino de peito e tríceps',
        isActive: true,
        exerciseCount: 0,
        limitsInfo: {
          current: 1,
          limit: 2,
          canCreateMore: true,
        },
      });

      expect(mockWorkoutPlanRepository.save).toHaveBeenCalledWith(expect.any(WorkoutPlan));
    });

    it('should create workout plan successfully for premium user', async () => {
      mockCheckPremiumStatus.execute.mockResolvedValue({
        status: 'active',
        isPremium: true,
        expiryDate: new Date(),
      });

      mockWorkoutLimitService.getLimitsForUser.mockReturnValue(WorkoutLimits.createPremiumLimits());

      const result = await useCase.execute(validInput);

      expect(result.limitsInfo.limit).toBe(-1);
      expect(result.limitsInfo.canCreateMore).toBe(true);
    });

    it('should throw error when limit is exceeded', async () => {
      mockWorkoutLimitService.validateCanCreateWorkoutPlan.mockResolvedValue({
        isValid: false,
        message: 'Limit exceeded',
        current: 2,
        limit: 2,
      });

      await expect(useCase.execute(validInput)).rejects.toThrow(WorkoutLimitExceededException);
    });

    it('should throw error when name already exists', async () => {
      mockWorkoutPlanRepository.existsByUserIdAndName.mockResolvedValue(true);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        'Já existe um plano de treino com o nome "Treino A"',
      );
    });

    it('should check premium status correctly', async () => {
      await useCase.execute(validInput);

      expect(mockCheckPremiumStatus.execute).toHaveBeenCalledWith({
        userId: 'user-1',
      });
    });

    it('should validate limits correctly', async () => {
      await useCase.execute(validInput);

      expect(mockWorkoutLimitService.validateCanCreateWorkoutPlan).toHaveBeenCalledWith(0, false);
    });

    it('should check for existing name correctly', async () => {
      await useCase.execute(validInput);

      expect(mockWorkoutPlanRepository.existsByUserIdAndName).toHaveBeenCalledWith(
        'user-1',
        'Treino A',
      );
    });

    it('should save workout plan with correct properties', async () => {
      await useCase.execute(validInput);

      expect(mockWorkoutPlanRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          name: 'Treino A',
          description: 'Treino de peito e tríceps',
          isActive: true,
          exercises: [],
        }),
      );
    });
  });

  describe('input validation', () => {
    it('should throw error for empty userId', async () => {
      const invalidInput = {
        userId: '',
        name: 'Treino A',
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow('User ID é obrigatório');
    });

    it('should throw error for empty name', async () => {
      const invalidInput = {
        userId: 'user-1',
        name: '',
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        'Nome do plano de treino é obrigatório',
      );
    });

    it('should throw error for name too long', async () => {
      const invalidInput = {
        userId: 'user-1',
        name: 'a'.repeat(101), // 101 characters
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        'Nome do plano de treino deve ter no máximo 100 caracteres',
      );
    });

    it('should throw error for description too long', async () => {
      const invalidInput = {
        userId: 'user-1',
        name: 'Treino A',
        description: 'a'.repeat(501), // 501 characters
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        'Descrição deve ter no máximo 500 caracteres',
      );
    });

    it('should throw error for invalid characters in name', async () => {
      const invalidInput = {
        userId: 'user-1',
        name: 'Treino A @#$%',
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        'Nome do plano pode conter apenas letras, números, espaços, hífens, sublinhados e parênteses',
      );
    });

    it('should accept valid characters in name', async () => {
      const validInput = {
        userId: 'user-1',
        name: 'Treino A-B_C (Avançado)',
      };

      await expect(useCase.execute(validInput)).resolves.toBeDefined();
    });

    it('should trim whitespace from name and description', async () => {
      const inputWithWhitespace = {
        userId: 'user-1',
        name: '  Treino A  ',
        description: '  Descrição  ',
      };

      await useCase.execute(inputWithWhitespace);

      expect(mockWorkoutPlanRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Treino A',
          description: 'Descrição',
        }),
      );
    });

    it('should handle null description', async () => {
      const inputWithNullDescription = {
        userId: 'user-1',
        name: 'Treino A',
        description: undefined,
      };

      await useCase.execute(inputWithNullDescription);

      expect(mockWorkoutPlanRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          description: null,
        }),
      );
    });
  });

  describe('edge cases', () => {
    it('should handle repository errors gracefully', async () => {
      mockWorkoutPlanRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(
        useCase.execute({
          userId: 'user-1',
          name: 'Treino A',
        }),
      ).rejects.toThrow('Database error');
    });

    it('should handle premium status check errors', async () => {
      mockCheckPremiumStatus.execute.mockRejectedValue(new Error('Premium check failed'));

      await expect(
        useCase.execute({
          userId: 'user-1',
          name: 'Treino A',
        }),
      ).rejects.toThrow('Premium check failed');
    });

    it('should generate unique IDs', async () => {
      const calls: WorkoutPlan[] = [];
      mockWorkoutPlanRepository.save.mockImplementation(async (plan) => {
        calls.push(plan);
        return plan;
      });

      await useCase.execute({ userId: 'user-1', name: 'Treino A' });
      await useCase.execute({ userId: 'user-1', name: 'Treino B' });

      expect(calls[0].id).toBeDefined();
      expect(calls[1].id).toBeDefined();
      expect(calls[0].id).not.toBe(calls[1].id);
    });
  });
});
