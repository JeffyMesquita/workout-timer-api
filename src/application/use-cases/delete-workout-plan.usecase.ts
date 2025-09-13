import { Inject, Injectable } from '@nestjs/common';

import { WorkoutPlanRepository } from '../../domain/repositories/workout-plan.repository';

export interface DeleteWorkoutPlanInput {
  userId: string;
  planId: string;
  force?: boolean; // Para forçar exclusão mesmo com sessões de treino
}

export interface DeleteWorkoutPlanOutput {
  success: boolean;
  message: string;
  deletedPlanName: string;
}

@Injectable()
export class DeleteWorkoutPlanUseCase {
  constructor(
    @Inject('WorkoutPlanRepository')
    private readonly workoutPlanRepository: WorkoutPlanRepository,
  ) {}

  async execute(input: DeleteWorkoutPlanInput): Promise<DeleteWorkoutPlanOutput> {
    const { userId, planId, force = false } = input;

    // Validar entrada
    this.validateInput(input);

    // Buscar o plano de treino
    const workoutPlan = await this.workoutPlanRepository.findByIdAndUserId(planId, userId);

    if (!workoutPlan) {
      throw new Error('Plano de treino não encontrado');
    }

    // TODO: Verificar se existem sessões de treino ativas
    // Para agora, vamos apenas verificar se tem exercícios
    if (workoutPlan.exercises.length > 0 && !force) {
      throw new Error(
        'Não é possível excluir um plano de treino que possui exercícios. Use force=true para forçar a exclusão.',
      );
    }

    const planName = workoutPlan.name;

    // Realizar a exclusão
    await this.workoutPlanRepository.delete(planId);

    return {
      success: true,
      message: `Plano de treino "${planName}" foi excluído com sucesso`,
      deletedPlanName: planName,
    };
  }

  private validateInput(input: DeleteWorkoutPlanInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID é obrigatório');
    }

    if (!input.planId || input.planId.trim().length === 0) {
      throw new Error('Plan ID é obrigatório');
    }
  }
}

/**
 * Exceção específica para exclusão de plano de treino
 */
export class DeleteWorkoutPlanException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'DeleteWorkoutPlanException';
  }
}

/**
 * Códigos de erro para exclusão
 */
export const DeleteWorkoutPlanErrorCodes = {
  PLAN_NOT_FOUND: 'PLAN_NOT_FOUND',
  PLAN_HAS_EXERCISES: 'PLAN_HAS_EXERCISES',
  PLAN_HAS_ACTIVE_SESSIONS: 'PLAN_HAS_ACTIVE_SESSIONS',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;
