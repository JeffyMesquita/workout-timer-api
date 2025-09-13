import { Inject, Injectable } from '@nestjs/common';
import { WorkoutPlanRepository } from '../../domain/repositories/workout-plan.repository';
import { WorkoutLimitService } from '../../domain/services/workout-limit.service';
import { CheckPremiumStatusUseCase } from './check-premium-status.usecase';

export interface GetWorkoutPlanByIdInput {
  userId: string;
  planId: string;
}

export interface ExerciseDetails {
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
}

export interface GetWorkoutPlanByIdOutput {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  exerciseCount: number;
  createdAt: Date;
  updatedAt: Date;
  exercises: ExerciseDetails[];
  estimatedTotalDurationMinutes: number;
  limitsInfo: {
    canAddMoreExercises: boolean;
    exerciseLimit: number;
    currentExerciseCount: number;
    isPremium: boolean;
  };
}

@Injectable()
export class GetWorkoutPlanByIdUseCase {
  constructor(
    @Inject('WorkoutPlanRepository')
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    @Inject('WorkoutLimitService')
    private readonly workoutLimitService: WorkoutLimitService,
    private readonly checkPremiumStatus: CheckPremiumStatusUseCase,
  ) {}

  async execute(
    input: GetWorkoutPlanByIdInput,
  ): Promise<GetWorkoutPlanByIdOutput> {
    const { userId, planId } = input;

    // Validar entrada
    this.validateInput(input);

    // Buscar o plano de treino
    const workoutPlan = await this.workoutPlanRepository.findByIdAndUserId(
      planId,
      userId,
    );

    if (!workoutPlan) {
      throw new Error('Plano de treino não encontrado');
    }

    // Verificar status premium
    const premiumStatus = await this.checkPremiumStatus.execute({ userId });
    const isPremium = premiumStatus.isPremium;

    // Obter limites
    const limits = this.workoutLimitService.getLimitsForUser(isPremium);

    // Converter exercícios para detalhes
    const exerciseDetails: ExerciseDetails[] = workoutPlan
      .getOrderedExercises()
      .map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        targetMuscleGroup: exercise.targetMuscleGroup,
        sets: exercise.sets,
        reps: exercise.reps,
        restTimeSeconds: exercise.restTimeSeconds,
        order: exercise.order,
        estimatedDurationSeconds: exercise.getEstimatedDurationSeconds(),
        formattedDescription: exercise.getFormattedDescription(),
      }));

    // Calcular duração total estimada
    const totalDurationSeconds = exerciseDetails.reduce(
      (total, exercise) => total + exercise.estimatedDurationSeconds,
      0,
    );

    return {
      id: workoutPlan.id,
      name: workoutPlan.name,
      description: workoutPlan.description,
      isActive: workoutPlan.isActive,
      exerciseCount: workoutPlan.exercises.length,
      createdAt: workoutPlan.createdAt,
      updatedAt: workoutPlan.updatedAt,
      exercises: exerciseDetails,
      estimatedTotalDurationMinutes: Math.ceil(totalDurationSeconds / 60),
      limitsInfo: {
        canAddMoreExercises: limits.canAddExercise(
          workoutPlan.exercises.length,
        ),
        exerciseLimit: limits.maxExercisesPerPlan,
        currentExerciseCount: workoutPlan.exercises.length,
        isPremium,
      },
    };
  }

  private validateInput(input: GetWorkoutPlanByIdInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID é obrigatório');
    }

    if (!input.planId || input.planId.trim().length === 0) {
      throw new Error('Plan ID é obrigatório');
    }
  }
}

/**
 * Exceção específica para busca de plano de treino
 */
export class WorkoutPlanNotFoundException extends Error {
  constructor(planId: string, userId: string) {
    super(`Plano de treino ${planId} não encontrado para o usuário ${userId}`);
    this.name = 'WorkoutPlanNotFoundException';
  }
}
