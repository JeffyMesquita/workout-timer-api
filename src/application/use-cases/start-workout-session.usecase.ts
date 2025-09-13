import { Inject, Injectable } from '@nestjs/common';
import { WorkoutPlanRepository } from '../../domain/repositories/workout-plan.repository';
import { WorkoutSessionRepository } from '../../domain/repositories/workout-session.repository';
import { WorkoutSession } from '../../domain/entities/workout-session.entity';

export interface StartWorkoutSessionInput {
  userId: string;
  workoutPlanId: string;
  notes?: string;
}

export interface StartWorkoutSessionOutput {
  id: string;
  status: string;
  startedAt: Date;
  workoutPlan: {
    id: string;
    name: string;
    description: string | null;
    exerciseCount: number;
    estimatedDurationMinutes: number;
  };
  exercises: {
    id: string;
    name: string;
    sets: number;
    reps: number;
    restTimeSeconds: number;
    order: number;
    estimatedDurationSeconds: number;
  }[];
  sessionInfo: {
    canPause: boolean;
    canComplete: boolean;
    canCancel: boolean;
    currentDuration: string;
  };
}

@Injectable()
export class StartWorkoutSessionUseCase {
  constructor(
    @Inject('WorkoutPlanRepository')
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    @Inject('WorkoutSessionRepository')
    private readonly workoutSessionRepository: WorkoutSessionRepository,
  ) {}

  async execute(
    input: StartWorkoutSessionInput,
  ): Promise<StartWorkoutSessionOutput> {
    const { userId, workoutPlanId, notes } = input;

    // Validar entrada
    this.validateInput(input);

    // Verificar se já existe sessão ativa
    const activeSession =
      await this.workoutSessionRepository.findActiveByUserId(userId);

    if (activeSession) {
      throw new Error(
        'Você já possui uma sessão de treino ativa. Finalize ou cancele a sessão atual antes de iniciar uma nova.',
      );
    }

    // Verificar se o plano de treino existe e pertence ao usuário
    const workoutPlan = await this.workoutPlanRepository.findByIdAndUserId(
      workoutPlanId,
      userId,
    );

    if (!workoutPlan) {
      throw new Error('Plano de treino não encontrado');
    }

    if (!workoutPlan.isActive) {
      throw new Error('Não é possível iniciar treino com um plano inativo');
    }

    if (workoutPlan.exercises.length === 0) {
      throw new Error(
        'Não é possível iniciar treino sem exercícios. Adicione exercícios ao plano primeiro.',
      );
    }

    // Criar a sessão de treino
    const workoutSession = new WorkoutSession(
      this.generateId(),
      userId,
      workoutPlanId,
      'IN_PROGRESS',
      new Date(),
      null,
      null,
      null,
      null,
      null,
      notes?.trim() || null,
      new Date(),
      new Date(),
    );

    // Salvar a sessão
    const savedSession = await this.workoutSessionRepository.save(
      workoutSession,
    );

    // Calcular duração estimada total
    const totalDurationSeconds = workoutPlan.exercises.reduce(
      (total, exercise) => total + exercise.getEstimatedDurationSeconds(),
      0,
    );

    // Preparar dados dos exercícios
    const exerciseData = workoutPlan.getOrderedExercises().map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      restTimeSeconds: exercise.restTimeSeconds,
      order: exercise.order,
      estimatedDurationSeconds: exercise.getEstimatedDurationSeconds(),
    }));

    return {
      id: savedSession.id,
      status: savedSession.status,
      startedAt: savedSession.startedAt,
      workoutPlan: {
        id: workoutPlan.id,
        name: workoutPlan.name,
        description: workoutPlan.description,
        exerciseCount: workoutPlan.exercises.length,
        estimatedDurationMinutes: Math.ceil(totalDurationSeconds / 60),
      },
      exercises: exerciseData,
      sessionInfo: {
        canPause: savedSession.canBePaused(),
        canComplete: savedSession.canBeCompleted(),
        canCancel: savedSession.canBeCancelled(),
        currentDuration: savedSession.getFormattedDuration(),
      },
    };
  }

  private validateInput(input: StartWorkoutSessionInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID é obrigatório');
    }

    if (!input.workoutPlanId || input.workoutPlanId.trim().length === 0) {
      throw new Error('Workout Plan ID é obrigatório');
    }

    if (input.notes && input.notes.length > 500) {
      throw new Error('Notas devem ter no máximo 500 caracteres');
    }
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}

/**
 * Exceções específicas para sessões de treino
 */
export class WorkoutSessionException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'WorkoutSessionException';
  }
}

export const WorkoutSessionErrorCodes = {
  ACTIVE_SESSION_EXISTS: 'ACTIVE_SESSION_EXISTS',
  WORKOUT_PLAN_NOT_FOUND: 'WORKOUT_PLAN_NOT_FOUND',
  WORKOUT_PLAN_INACTIVE: 'WORKOUT_PLAN_INACTIVE',
  NO_EXERCISES: 'NO_EXERCISES',
  INVALID_INPUT: 'INVALID_INPUT',
} as const;
