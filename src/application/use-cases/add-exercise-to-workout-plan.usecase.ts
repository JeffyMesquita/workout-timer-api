import { Inject, Injectable } from '@nestjs/common';
import { WorkoutPlanRepository } from '../../domain/repositories/workout-plan.repository';
import { ExerciseRepository } from '../../domain/repositories/exercise.repository';
import {
  WorkoutLimitService,
  WorkoutLimitExceededException,
} from '../../domain/services/workout-limit.service';
import { CheckPremiumStatusUseCase } from './check-premium-status.usecase';
import { Exercise } from '../../domain/entities/exercise.entity';

export interface AddExerciseToWorkoutPlanInput {
  userId: string;
  workoutPlanId: string;
  name: string;
  description?: string;
  targetMuscleGroup?: string;
  sets?: number;
  reps?: number;
  restTimeSeconds?: number;
}

export interface AddExerciseToWorkoutPlanOutput {
  id: string;
  name: string;
  description: string | null;
  targetMuscleGroup: string | null;
  sets: number;
  reps: number;
  restTimeSeconds: number;
  order: number;
  estimatedDurationSeconds: number;
  formattedDescription: string;
  planInfo: {
    id: string;
    name: string;
    exerciseCount: number;
    canAddMore: boolean;
  };
}

@Injectable()
export class AddExerciseToWorkoutPlanUseCase {
  constructor(
    @Inject('WorkoutPlanRepository')
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    @Inject('ExerciseRepository')
    private readonly exerciseRepository: ExerciseRepository,
    @Inject('WorkoutLimitService')
    private readonly workoutLimitService: WorkoutLimitService,
    private readonly checkPremiumStatus: CheckPremiumStatusUseCase,
  ) {}

  async execute(
    input: AddExerciseToWorkoutPlanInput,
  ): Promise<AddExerciseToWorkoutPlanOutput> {
    const {
      userId,
      workoutPlanId,
      name,
      description,
      targetMuscleGroup,
      sets = 3,
      reps = 10,
      restTimeSeconds = 60,
    } = input;

    // Validar entrada
    this.validateInput(input);

    // Verificar se o plano de treino existe e pertence ao usuário
    const workoutPlan = await this.workoutPlanRepository.findByIdAndUserId(
      workoutPlanId,
      userId,
    );

    if (!workoutPlan) {
      throw new Error('Plano de treino não encontrado');
    }

    if (!workoutPlan.isActive) {
      throw new Error('Não é possível adicionar exercícios a um plano inativo');
    }

    // Verificar status premium
    const premiumStatus = await this.checkPremiumStatus.execute({ userId });
    const isPremium = premiumStatus.isPremium;

    // Contar exercícios existentes no plano
    const currentExerciseCount =
      await this.exerciseRepository.countByWorkoutPlanId(workoutPlanId);

    // Validar limites
    const limitValidation =
      await this.workoutLimitService.validateCanAddExercise(
        currentExerciseCount,
        isPremium,
      );

    if (!limitValidation.isValid) {
      throw new WorkoutLimitExceededException(limitValidation);
    }

    // Verificar se já existe exercício com o mesmo nome no plano
    const nameExists =
      await this.exerciseRepository.existsByWorkoutPlanIdAndName(
        workoutPlanId,
        name.trim(),
      );

    if (nameExists) {
      throw new Error(
        `Já existe um exercício com o nome "${name}" neste plano de treino`,
      );
    }

    // Obter próximo número de ordem
    const nextOrder = await this.exerciseRepository.getNextOrderByWorkoutPlanId(
      workoutPlanId,
    );

    // Criar o exercício
    const exercise = new Exercise(
      this.generateId(),
      workoutPlanId,
      name.trim(),
      description?.trim() || null,
      targetMuscleGroup?.trim() || null,
      sets,
      reps,
      restTimeSeconds,
      nextOrder,
      new Date(),
      new Date(),
    );

    // Salvar o exercício
    const savedExercise = await this.exerciseRepository.save(exercise);

    // Obter informações atualizadas do plano
    const updatedPlan = await this.workoutPlanRepository.findById(
      workoutPlanId,
    );
    const newExerciseCount = currentExerciseCount + 1;
    const limits = this.workoutLimitService.getLimitsForUser(isPremium);

    return {
      id: savedExercise.id,
      name: savedExercise.name,
      description: savedExercise.description,
      targetMuscleGroup: savedExercise.targetMuscleGroup,
      sets: savedExercise.sets,
      reps: savedExercise.reps,
      restTimeSeconds: savedExercise.restTimeSeconds,
      order: savedExercise.order,
      estimatedDurationSeconds: savedExercise.getEstimatedDurationSeconds(),
      formattedDescription: savedExercise.getFormattedDescription(),
      planInfo: {
        id: workoutPlanId,
        name: updatedPlan?.name || workoutPlan.name,
        exerciseCount: newExerciseCount,
        canAddMore: limits.canAddExercise(newExerciseCount),
      },
    };
  }

  private validateInput(input: AddExerciseToWorkoutPlanInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID é obrigatório');
    }

    if (!input.workoutPlanId || input.workoutPlanId.trim().length === 0) {
      throw new Error('Workout Plan ID é obrigatório');
    }

    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Nome do exercício é obrigatório');
    }

    if (input.name.trim().length > 100) {
      throw new Error('Nome do exercício deve ter no máximo 100 caracteres');
    }

    if (input.description && input.description.length > 500) {
      throw new Error('Descrição deve ter no máximo 500 caracteres');
    }

    if (input.targetMuscleGroup && input.targetMuscleGroup.length > 50) {
      throw new Error('Grupo muscular deve ter no máximo 50 caracteres');
    }

    // Validar valores numéricos
    if (input.sets !== undefined && (input.sets < 1 || input.sets > 20)) {
      throw new Error('Número de séries deve ser entre 1 e 20');
    }

    if (input.reps !== undefined && (input.reps < 1 || input.reps > 100)) {
      throw new Error('Número de repetições deve ser entre 1 e 100');
    }

    if (
      input.restTimeSeconds !== undefined &&
      (input.restTimeSeconds < 0 || input.restTimeSeconds > 600)
    ) {
      throw new Error('Tempo de descanso deve ser entre 0 e 600 segundos');
    }

    // Validar caracteres especiais no nome
    const namePattern = /^[a-zA-ZÀ-ÿ0-9\s\-_()]+$/;
    if (!namePattern.test(input.name.trim())) {
      throw new Error(
        'Nome do exercício pode conter apenas letras, números, espaços, hífens, sublinhados e parênteses',
      );
    }
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}

/**
 * Exceção específica para adição de exercício
 */
export class AddExerciseException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'AddExerciseException';
  }
}

/**
 * Códigos de erro para adição de exercício
 */
export const AddExerciseErrorCodes = {
  INVALID_INPUT: 'INVALID_INPUT',
  WORKOUT_PLAN_NOT_FOUND: 'WORKOUT_PLAN_NOT_FOUND',
  WORKOUT_PLAN_INACTIVE: 'WORKOUT_PLAN_INACTIVE',
  DUPLICATE_NAME: 'DUPLICATE_NAME',
  EXERCISE_LIMIT_EXCEEDED: 'EXERCISE_LIMIT_EXCEEDED',
  REPOSITORY_ERROR: 'REPOSITORY_ERROR',
} as const;
