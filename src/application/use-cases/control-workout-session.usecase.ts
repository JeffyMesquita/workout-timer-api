import { Inject, Injectable } from '@nestjs/common';

import { WorkoutPlanRepository } from '../../domain/repositories/workout-plan.repository';
import { WorkoutSessionRepository } from '../../domain/repositories/workout-session.repository';

// === PAUSE WORKOUT SESSION ===

export interface PauseWorkoutSessionInput {
  userId: string;
  sessionId: string;
}

export interface PauseWorkoutSessionOutput {
  id: string;
  status: string;
  pausedAt: Date;
  currentDuration: string;
  sessionInfo: {
    canPause: boolean;
    canResume: boolean;
    canComplete: boolean;
    canCancel: boolean;
  };
}

@Injectable()
export class PauseWorkoutSessionUseCase {
  constructor(
    @Inject('WorkoutSessionRepository')
    private readonly workoutSessionRepository: WorkoutSessionRepository,
  ) {}

  async execute(input: PauseWorkoutSessionInput): Promise<PauseWorkoutSessionOutput> {
    const { userId, sessionId } = input;

    // Validar entrada
    this.validateInput(input);

    // Buscar a sessão
    const session = await this.workoutSessionRepository.findByIdAndUserId(sessionId, userId);

    if (!session) {
      throw new Error('Sessão de treino não encontrada');
    }

    if (!session.canBePaused()) {
      throw new Error(`Não é possível pausar uma sessão com status ${session.status}`);
    }

    // Pausar a sessão
    session.pause();

    // Salvar alterações
    const savedSession = await this.workoutSessionRepository.save(session);

    return {
      id: savedSession.id,
      status: savedSession.status,
      pausedAt: savedSession.pausedAt!,
      currentDuration: savedSession.getFormattedDuration(),
      sessionInfo: {
        canPause: savedSession.canBePaused(),
        canResume: savedSession.canBeResumed(),
        canComplete: savedSession.canBeCompleted(),
        canCancel: savedSession.canBeCancelled(),
      },
    };
  }

  private validateInput(input: PauseWorkoutSessionInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID é obrigatório');
    }

    if (!input.sessionId || input.sessionId.trim().length === 0) {
      throw new Error('Session ID é obrigatório');
    }
  }
}

// === RESUME WORKOUT SESSION ===

export interface ResumeWorkoutSessionInput {
  userId: string;
  sessionId: string;
}

export interface ResumeWorkoutSessionOutput {
  id: string;
  status: string;
  resumedAt: Date;
  currentDuration: string;
  sessionInfo: {
    canPause: boolean;
    canResume: boolean;
    canComplete: boolean;
    canCancel: boolean;
  };
}

@Injectable()
export class ResumeWorkoutSessionUseCase {
  constructor(
    @Inject('WorkoutSessionRepository')
    private readonly workoutSessionRepository: WorkoutSessionRepository,
  ) {}

  async execute(input: ResumeWorkoutSessionInput): Promise<ResumeWorkoutSessionOutput> {
    const { userId, sessionId } = input;

    // Validar entrada
    this.validateInput(input);

    // Buscar a sessão
    const session = await this.workoutSessionRepository.findByIdAndUserId(sessionId, userId);

    if (!session) {
      throw new Error('Sessão de treino não encontrada');
    }

    if (!session.canBeResumed()) {
      throw new Error(`Não é possível retomar uma sessão com status ${session.status}`);
    }

    // Retomar a sessão
    session.resume();

    // Salvar alterações
    const savedSession = await this.workoutSessionRepository.save(session);

    return {
      id: savedSession.id,
      status: savedSession.status,
      resumedAt: savedSession.resumedAt!,
      currentDuration: savedSession.getFormattedDuration(),
      sessionInfo: {
        canPause: savedSession.canBePaused(),
        canResume: savedSession.canBeResumed(),
        canComplete: savedSession.canBeCompleted(),
        canCancel: savedSession.canBeCancelled(),
      },
    };
  }

  private validateInput(input: ResumeWorkoutSessionInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID é obrigatório');
    }

    if (!input.sessionId || input.sessionId.trim().length === 0) {
      throw new Error('Session ID é obrigatório');
    }
  }
}

// === COMPLETE WORKOUT SESSION ===

export interface CompleteWorkoutSessionInput {
  userId: string;
  sessionId: string;
  notes?: string;
}

export interface CompleteWorkoutSessionOutput {
  id: string;
  status: string;
  completedAt: Date;
  totalDurationMs: number;
  formattedDuration: string;
  notes: string | null;
  workoutPlan: {
    id: string;
    name: string;
  };
  summary: {
    exercisesCompleted: number;
    totalExercises: number;
    completionRate: number;
  };
}

@Injectable()
export class CompleteWorkoutSessionUseCase {
  constructor(
    @Inject('WorkoutSessionRepository')
    private readonly workoutSessionRepository: WorkoutSessionRepository,
    @Inject('WorkoutPlanRepository')
    private readonly workoutPlanRepository: WorkoutPlanRepository,
  ) {}

  async execute(input: CompleteWorkoutSessionInput): Promise<CompleteWorkoutSessionOutput> {
    const { userId, sessionId, notes } = input;

    // Validar entrada
    this.validateInput(input);

    // Buscar a sessão
    const session = await this.workoutSessionRepository.findByIdAndUserId(sessionId, userId);

    if (!session) {
      throw new Error('Sessão de treino não encontrada');
    }

    if (!session.canBeCompleted()) {
      throw new Error(`Não é possível finalizar uma sessão com status ${session.status}`);
    }

    // Buscar informações do plano
    const workoutPlan = await this.workoutPlanRepository.findById(session.workoutPlanId);

    if (!workoutPlan) {
      throw new Error('Plano de treino não encontrado');
    }

    // Finalizar a sessão
    session.complete(notes);

    // Salvar alterações
    const savedSession = await this.workoutSessionRepository.save(session);

    // TODO: Calcular exercícios completados baseado em ExerciseExecution
    // Por agora, assumindo que todos foram completados
    const exercisesCompleted = workoutPlan.exercises.length;
    const totalExercises = workoutPlan.exercises.length;
    const completionRate =
      totalExercises > 0 ? Math.round((exercisesCompleted / totalExercises) * 100) : 0;

    return {
      id: savedSession.id,
      status: savedSession.status,
      completedAt: savedSession.completedAt!,
      totalDurationMs: savedSession.totalDurationMs!,
      formattedDuration: savedSession.getFormattedDuration(),
      notes: savedSession.notes,
      workoutPlan: {
        id: workoutPlan.id,
        name: workoutPlan.name,
      },
      summary: {
        exercisesCompleted,
        totalExercises,
        completionRate,
      },
    };
  }

  private validateInput(input: CompleteWorkoutSessionInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID é obrigatório');
    }

    if (!input.sessionId || input.sessionId.trim().length === 0) {
      throw new Error('Session ID é obrigatório');
    }

    if (input.notes && input.notes.length > 500) {
      throw new Error('Notas devem ter no máximo 500 caracteres');
    }
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}

// === CANCEL WORKOUT SESSION ===

export interface CancelWorkoutSessionInput {
  userId: string;
  sessionId: string;
  reason?: string;
}

export interface CancelWorkoutSessionOutput {
  id: string;
  status: string;
  cancelledAt: Date;
  totalDurationMs: number;
  formattedDuration: string;
  notes: string | null;
  reason: string | null;
}

@Injectable()
export class CancelWorkoutSessionUseCase {
  constructor(
    @Inject('WorkoutSessionRepository')
    private readonly workoutSessionRepository: WorkoutSessionRepository,
  ) {}

  async execute(input: CancelWorkoutSessionInput): Promise<CancelWorkoutSessionOutput> {
    const { userId, sessionId, reason } = input;

    // Validar entrada
    this.validateInput(input);

    // Buscar a sessão
    const session = await this.workoutSessionRepository.findByIdAndUserId(sessionId, userId);

    if (!session) {
      throw new Error('Sessão de treino não encontrada');
    }

    if (!session.canBeCancelled()) {
      throw new Error(`Não é possível cancelar uma sessão com status ${session.status}`);
    }

    // Cancelar a sessão
    session.cancel(reason);

    // Salvar alterações
    const savedSession = await this.workoutSessionRepository.save(session);

    return {
      id: savedSession.id,
      status: savedSession.status,
      cancelledAt: savedSession.cancelledAt!,
      totalDurationMs: savedSession.totalDurationMs!,
      formattedDuration: savedSession.getFormattedDuration(),
      notes: savedSession.notes,
      reason: reason || null,
    };
  }

  private validateInput(input: CancelWorkoutSessionInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID é obrigatório');
    }

    if (!input.sessionId || input.sessionId.trim().length === 0) {
      throw new Error('Session ID é obrigatório');
    }

    if (input.reason && input.reason.length > 200) {
      throw new Error('Motivo do cancelamento deve ter no máximo 200 caracteres');
    }
  }
}
