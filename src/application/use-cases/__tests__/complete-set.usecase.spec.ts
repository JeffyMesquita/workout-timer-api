import { CompleteSetUseCase } from '../complete-set.usecase';
import { ExerciseExecutionRepository } from '../../../domain/repositories/exercise-execution.repository';
import { SetRepository } from '../../../domain/repositories/set.repository';
import { ExerciseExecution } from '../../../domain/entities/exercise-execution.entity';
import { WorkoutSet } from '../../../domain/entities/set.entity';

describe('CompleteSetUseCase', () => {
  let useCase: CompleteSetUseCase;
  let mockExerciseExecutionRepository: jest.Mocked<ExerciseExecutionRepository>;
  let mockSetRepository: jest.Mocked<SetRepository>;

  beforeEach(() => {
    mockExerciseExecutionRepository = {
      findById: jest.fn(),
      findByWorkoutSessionId: jest.fn(),
      findByWorkoutSessionIdAndExerciseId: jest.fn(),
      findByExerciseId: jest.fn(),
      findActiveByWorkoutSessionId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      countByWorkoutSessionIdAndStatus: jest.fn(),
      findLastByExerciseId: jest.fn(),
      findByExerciseIdWithPagination: jest.fn(),
      getExerciseStats: jest.fn(),
    };

    mockSetRepository = {
      findById: jest.fn(),
      findByExerciseExecutionId: jest.fn(),
      findByExerciseExecutionIdAndSetNumber: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      countCompletedByExerciseExecutionId: jest.fn(),
      findByWeightRange: jest.fn(),
      findLastByExerciseId: jest.fn(),
      getSetStatsForExercise: jest.fn(),
      getWeightProgression: jest.fn(),
      saveMany: jest.fn(),
      deleteByExerciseExecutionId: jest.fn(),
    };

    useCase = new CompleteSetUseCase(
      mockExerciseExecutionRepository,
      mockSetRepository,
    );
  });

  describe('execute', () => {
    const validInput = {
      userId: 'user-1',
      exerciseExecutionId: 'execution-1',
      setNumber: 1,
      actualReps: 10,
      weight: 50,
      restTimeSeconds: 60,
      notes: 'Boa série',
    };

    it('should complete set successfully', async () => {
      const exerciseExecution = new ExerciseExecution(
        'execution-1',
        'session-1',
        'exercise-1',
        'IN_PROGRESS',
        new Date(),
        null,
        null,
        new Date(),
        new Date(),
        [],
      );

      const set = new WorkoutSet(
        'set-1',
        'execution-1',
        1,
        10,
        null,
        45, // Previous weight
        null,
        null,
        null,
      );

      // Add set to execution for proper testing
      exerciseExecution.addSet(set);

      mockExerciseExecutionRepository.findById.mockResolvedValue(
        exerciseExecution,
      );
      mockSetRepository.findByExerciseExecutionIdAndSetNumber.mockResolvedValue(
        set,
      );

      mockSetRepository.save.mockImplementation(async (setToSave) => setToSave);
      mockExerciseExecutionRepository.save.mockResolvedValue(exerciseExecution);

      const result = await useCase.execute(validInput);

      expect(result).toMatchObject({
        setNumber: 1,
        plannedReps: 10,
        actualReps: 10,
        weight: 50,
        performance: {
          repsDifference: 0,
          completionPercentage: 100,
          wasSuccessful: true,
        },
      });

      // Verificar que as funções foram chamadas
      expect(result.restTimeSeconds).toBeDefined();

      expect(mockSetRepository.save).toHaveBeenCalledWith(set);
      expect(mockExerciseExecutionRepository.save).toHaveBeenCalledWith(
        exerciseExecution,
      );
    });

    it('should throw error for non-existent execution', async () => {
      mockExerciseExecutionRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        'Execução de exercício não encontrada',
      );
    });

    it('should throw error for inactive execution', async () => {
      const inactiveExecution = new ExerciseExecution(
        'execution-1',
        'session-1',
        'exercise-1',
        'COMPLETED',
      );

      mockExerciseExecutionRepository.findById.mockResolvedValue(
        inactiveExecution,
      );

      await expect(useCase.execute(validInput)).rejects.toThrow(
        'Não é possível completar série de uma execução inativa',
      );
    });

    it('should throw error for non-existent set', async () => {
      const exerciseExecution = new ExerciseExecution(
        'execution-1',
        'session-1',
        'exercise-1',
        'IN_PROGRESS',
        new Date(),
      );

      mockExerciseExecutionRepository.findById.mockResolvedValue(
        exerciseExecution,
      );
      mockSetRepository.findByExerciseExecutionIdAndSetNumber.mockResolvedValue(
        null,
      );

      await expect(useCase.execute(validInput)).rejects.toThrow(
        'Série 1 não encontrada',
      );
    });

    it('should throw error for already completed set', async () => {
      const exerciseExecution = new ExerciseExecution(
        'execution-1',
        'session-1',
        'exercise-1',
        'IN_PROGRESS',
        new Date(),
      );

      const completedSet = new WorkoutSet(
        'set-1',
        'execution-1',
        1,
        10,
        10, // Already has actual reps
        50,
        null,
        new Date(), // Already completed
        null,
      );

      mockExerciseExecutionRepository.findById.mockResolvedValue(
        exerciseExecution,
      );
      mockSetRepository.findByExerciseExecutionIdAndSetNumber.mockResolvedValue(
        completedSet,
      );

      await expect(useCase.execute(validInput)).rejects.toThrow(
        'Série 1 já foi completada',
      );
    });

    it('should calculate weight suggestions correctly', async () => {
      const exerciseExecution = new ExerciseExecution(
        'execution-1',
        'session-1',
        'exercise-1',
        'IN_PROGRESS',
        new Date(),
      );

      const set1 = new WorkoutSet('set-1', 'execution-1', 1, 10, null, 50);
      const set2 = new WorkoutSet('set-2', 'execution-1', 2, 10, null, 50);

      exerciseExecution.addSet(set1);
      exerciseExecution.addSet(set2);

      mockExerciseExecutionRepository.findById.mockResolvedValue(
        exerciseExecution,
      );
      mockSetRepository.findByExerciseExecutionIdAndSetNumber.mockResolvedValue(
        set1,
      );
      mockSetRepository.save.mockResolvedValue(set1);
      mockExerciseExecutionRepository.save.mockResolvedValue(exerciseExecution);

      // Test weight increase suggestion (did more reps than planned)
      const result = await useCase.execute({
        ...validInput,
        actualReps: 12, // 2 more than planned
        weight: 50,
      });

      expect(result.suggestions.nextSetWeight).toBe(52.5); // 5% increase
      expect(result.suggestions.restTimeRecommendation).toContain('45-60s');
    });
  });

  describe('input validation', () => {
    it('should throw error for empty userId', async () => {
      const invalidInput = {
        userId: '',
        exerciseExecutionId: 'execution-1',
        setNumber: 1,
        actualReps: 10,
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        'User ID é obrigatório',
      );
    });

    it('should throw error for invalid set number', async () => {
      const invalidInput = {
        userId: 'user-1',
        exerciseExecutionId: 'execution-1',
        setNumber: 0,
        actualReps: 10,
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        'Número da série deve ser entre 1 e 20',
      );
    });

    it('should throw error for invalid actual reps', async () => {
      const invalidInput = {
        userId: 'user-1',
        exerciseExecutionId: 'execution-1',
        setNumber: 1,
        actualReps: -1,
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        'Repetições realizadas devem ser entre 0 e 100',
      );
    });

    it('should throw error for invalid weight', async () => {
      const invalidInput = {
        userId: 'user-1',
        exerciseExecutionId: 'execution-1',
        setNumber: 1,
        actualReps: 10,
        weight: -1,
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        'Peso deve ser entre 0 e 1000 kg',
      );
    });

    it('should throw error for invalid rest time', async () => {
      const invalidInput = {
        userId: 'user-1',
        exerciseExecutionId: 'execution-1',
        setNumber: 1,
        actualReps: 10,
        restTimeSeconds: -1,
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        'Tempo de descanso deve ser entre 0 e 1800 segundos',
      );
    });

    it('should throw error for notes too long', async () => {
      const invalidInput = {
        userId: 'user-1',
        exerciseExecutionId: 'execution-1',
        setNumber: 1,
        actualReps: 10,
        notes: 'a'.repeat(201),
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        'Notas devem ter no máximo 200 caracteres',
      );
    });
  });
});
