import { Inject, Injectable } from '@nestjs/common';

import { WorkoutPlanRepository } from '../../domain/repositories/workout-plan.repository';
import { WorkoutLimitService } from '../../domain/services/workout-limit.service';

import { CheckPremiumStatusUseCase } from './check-premium-status.usecase';

export interface ListWorkoutPlansInput {
  userId: string;
  page?: number;
  limit?: number;
  search?: string;
  includeInactive?: boolean;
}

export interface WorkoutPlanSummary {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  exerciseCount: number;
  createdAt: Date;
  updatedAt: Date;
  estimatedDurationMinutes: number;
}

export interface ListWorkoutPlansOutput {
  plans: WorkoutPlanSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  limitsInfo: {
    current: number;
    limit: number;
    canCreateMore: boolean;
    isPremium: boolean;
  };
}

@Injectable()
export class ListWorkoutPlansUseCase {
  constructor(
    @Inject('WorkoutPlanRepository')
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    @Inject('WorkoutLimitService')
    private readonly workoutLimitService: WorkoutLimitService,
    private readonly checkPremiumStatus: CheckPremiumStatusUseCase,
  ) {}

  async execute(input: ListWorkoutPlansInput): Promise<ListWorkoutPlansOutput> {
    const { userId, page = 1, limit = 10, search, includeInactive = false } = input;

    // Validar entrada
    this.validateInput(input);

    // Verificar status premium
    const premiumStatus = await this.checkPremiumStatus.execute({ userId });
    const isPremium = premiumStatus.isPremium;

    let plans;
    let total;

    if (search && search.trim().length > 0) {
      // Busca por nome
      const searchResults = await this.workoutPlanRepository.searchByName(userId, search.trim());
      plans = searchResults;
      total = searchResults.length;
    } else {
      // Busca paginada
      const paginationResult = await this.workoutPlanRepository.findByUserIdWithPagination(
        userId,
        page,
        limit,
        includeInactive,
      );
      plans = paginationResult.plans;
      total = paginationResult.total;
    }

    // Converter para resumo
    const planSummaries: WorkoutPlanSummary[] = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      isActive: plan.isActive,
      exerciseCount: plan.exercises.length,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      estimatedDurationMinutes: this.calculateEstimatedDuration(plan.exercises),
    }));

    // Obter informações de limite
    const limits = this.workoutLimitService.getLimitsForUser(isPremium);
    const currentActiveCount = await this.workoutPlanRepository.countActiveByUserId(userId);

    return {
      plans: planSummaries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      limitsInfo: {
        current: currentActiveCount,
        limit: limits.maxWorkoutPlans,
        canCreateMore: limits.canCreateWorkoutPlan(currentActiveCount),
        isPremium,
      },
    };
  }

  private validateInput(input: ListWorkoutPlansInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID é obrigatório');
    }

    if (input.page && input.page < 1) {
      throw new Error('Página deve ser maior que 0');
    }

    if (input.limit && (input.limit < 1 || input.limit > 100)) {
      throw new Error('Limite deve ser entre 1 e 100');
    }

    if (input.search && input.search.length > 100) {
      throw new Error('Termo de busca deve ter no máximo 100 caracteres');
    }
  }

  private calculateEstimatedDuration(exercises: any[]): number {
    if (!exercises || exercises.length === 0) return 0;

    const totalSeconds = exercises.reduce((total, exercise) => {
      return total + exercise.getEstimatedDurationSeconds();
    }, 0);

    return Math.ceil(totalSeconds / 60); // Converter para minutos
  }
}
