import { Inject, Injectable } from '@nestjs/common';
import { WorkoutPlan } from '../../domain/entities/workout-plan.entity';
import { WorkoutPlanRepository } from '../../domain/repositories/workout-plan.repository';
import {
  WorkoutLimitService,
  WorkoutLimitExceededException,
} from '../../domain/services/workout-limit.service';
import { CheckPremiumStatusUseCase } from './check-premium-status.usecase';

export interface CreateWorkoutPlanInput {
  userId: string;
  name: string;
  description?: string;
}

export interface CreateWorkoutPlanOutput {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  exerciseCount: number;
  limitsInfo: {
    current: number;
    limit: number;
    canCreateMore: boolean;
  };
}

@Injectable()
export class CreateWorkoutPlanUseCase {
  constructor(
    @Inject('WorkoutPlanRepository')
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    @Inject('WorkoutLimitService')
    private readonly workoutLimitService: WorkoutLimitService,
    private readonly checkPremiumStatus: CheckPremiumStatusUseCase,
  ) {}

  async execute(
    input: CreateWorkoutPlanInput,
  ): Promise<CreateWorkoutPlanOutput> {
    const { userId, name, description } = input;

    // Validar entrada
    this.validateInput(input);

    // Verificar status premium do usuário
    const premiumStatus = await this.checkPremiumStatus.execute({ userId });
    const isPremium = premiumStatus.isPremium;

    // Contar planos existentes
    const currentPlansCount =
      await this.workoutPlanRepository.countActiveByUserId(userId);

    // Validar limites
    const limitValidation =
      await this.workoutLimitService.validateCanCreateWorkoutPlan(
        currentPlansCount,
        isPremium,
      );

    if (!limitValidation.isValid) {
      throw new WorkoutLimitExceededException(limitValidation);
    }

    // Verificar se já existe um plano com o mesmo nome
    const nameExists = await this.workoutPlanRepository.existsByUserIdAndName(
      userId,
      name,
    );
    if (nameExists) {
      throw new Error(`Já existe um plano de treino com o nome "${name}"`);
    }

    // Criar o plano de treino
    const workoutPlan = new WorkoutPlan(
      this.generateId(),
      userId,
      name.trim(),
      description?.trim() || null,
      true,
      new Date(),
      new Date(),
      [],
    );

    // Salvar no repositório
    const savedPlan = await this.workoutPlanRepository.save(workoutPlan);

    // Calcular informações de limite atualizadas
    const newCount = currentPlansCount + 1;
    const limits = this.workoutLimitService.getLimitsForUser(isPremium);

    return {
      id: savedPlan.id,
      name: savedPlan.name,
      description: savedPlan.description,
      isActive: savedPlan.isActive,
      createdAt: savedPlan.createdAt,
      exerciseCount: savedPlan.exercises.length,
      limitsInfo: {
        current: newCount,
        limit: limits.maxWorkoutPlans,
        canCreateMore: limits.canCreateWorkoutPlan(newCount),
      },
    };
  }

  private validateInput(input: CreateWorkoutPlanInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID é obrigatório');
    }

    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Nome do plano de treino é obrigatório');
    }

    if (input.name.trim().length > 100) {
      throw new Error(
        'Nome do plano de treino deve ter no máximo 100 caracteres',
      );
    }

    if (input.description && input.description.length > 500) {
      throw new Error('Descrição deve ter no máximo 500 caracteres');
    }

    // Validar caracteres especiais no nome
    const namePattern = /^[a-zA-ZÀ-ÿ0-9\s\-_()]+$/;
    if (!namePattern.test(input.name.trim())) {
      throw new Error(
        'Nome do plano pode conter apenas letras, números, espaços, hífens, sublinhados e parênteses',
      );
    }
  }

  private generateId(): string {
    // Em um cenário real, usaríamos um serviço de geração de ID
    // Por simplicidade, usando crypto.randomUUID() ou similar
    return crypto.randomUUID();
  }
}

/**
 * Exceção específica para criação de plano de treino
 */
export class CreateWorkoutPlanException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'CreateWorkoutPlanException';
  }
}

/**
 * Códigos de erro para criação de plano de treino
 */
export const CreateWorkoutPlanErrorCodes = {
  INVALID_INPUT: 'INVALID_INPUT',
  DUPLICATE_NAME: 'DUPLICATE_NAME',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  REPOSITORY_ERROR: 'REPOSITORY_ERROR',
} as const;
