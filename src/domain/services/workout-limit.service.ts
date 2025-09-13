import { WorkoutLimits } from '../value-objects/workout-limits.vo';
import { WorkoutPlan } from '../entities/workout-plan.entity';

export interface WorkoutLimitService {
  /**
   * Obtém os limites baseados no status premium do usuário
   */
  getLimitsForUser(isPremium: boolean): WorkoutLimits;

  /**
   * Valida se o usuário pode criar um novo plano de treino
   */
  validateCanCreateWorkoutPlan(
    currentPlansCount: number,
    isPremium: boolean,
  ): Promise<ValidationResult>;

  /**
   * Valida se o usuário pode adicionar um exercício ao plano
   */
  validateCanAddExercise(
    currentExercisesCount: number,
    isPremium: boolean,
  ): Promise<ValidationResult>;

  /**
   * Valida se o usuário pode acessar funcionalidades de treinador
   */
  validateTrainerAccess(isPremium: boolean): Promise<ValidationResult>;

  /**
   * Valida se o histórico pode ser acessado para uma data específica
   */
  validateHistoryAccess(
    date: Date,
    isPremium: boolean,
  ): Promise<ValidationResult>;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  limit?: number;
  current?: number;
}

export class WorkoutLimitServiceImpl implements WorkoutLimitService {
  getLimitsForUser(isPremium: boolean): WorkoutLimits {
    return isPremium
      ? WorkoutLimits.createPremiumLimits()
      : WorkoutLimits.createFreeTierLimits();
  }

  async validateCanCreateWorkoutPlan(
    currentPlansCount: number,
    isPremium: boolean,
  ): Promise<ValidationResult> {
    const limits = this.getLimitsForUser(isPremium);

    if (limits.canCreateWorkoutPlan(currentPlansCount)) {
      return {
        isValid: true,
        current: currentPlansCount,
        limit: limits.maxWorkoutPlans,
      };
    }

    return {
      isValid: false,
      message: `Você atingiu o limite de ${limits.maxWorkoutPlans} planos de treino. Faça upgrade para Premium para criar planos ilimitados.`,
      current: currentPlansCount,
      limit: limits.maxWorkoutPlans,
    };
  }

  async validateCanAddExercise(
    currentExercisesCount: number,
    isPremium: boolean,
  ): Promise<ValidationResult> {
    const limits = this.getLimitsForUser(isPremium);

    if (limits.canAddExercise(currentExercisesCount)) {
      return {
        isValid: true,
        current: currentExercisesCount,
        limit: limits.maxExercisesPerPlan,
      };
    }

    return {
      isValid: false,
      message: `Você atingiu o limite de ${limits.maxExercisesPerPlan} exercícios por plano. Faça upgrade para Premium para adicionar exercícios ilimitados.`,
      current: currentExercisesCount,
      limit: limits.maxExercisesPerPlan,
    };
  }

  async validateTrainerAccess(isPremium: boolean): Promise<ValidationResult> {
    const limits = this.getLimitsForUser(isPremium);

    if (limits.canAccessTrainerFeatures) {
      return {
        isValid: true,
      };
    }

    return {
      isValid: false,
      message:
        'Funcionalidades de treinador disponíveis apenas para usuários Premium.',
    };
  }

  async validateHistoryAccess(
    date: Date,
    isPremium: boolean,
  ): Promise<ValidationResult> {
    const limits = this.getLimitsForUser(isPremium);

    if (limits.shouldRetainHistory(date)) {
      return {
        isValid: true,
      };
    }

    const daysDifference = Math.floor(
      (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      isValid: false,
      message: `Histórico disponível apenas para os últimos ${limits.historyRetentionDays} dias. Esta data tem ${daysDifference} dias. Faça upgrade para Premium para acessar o histórico completo.`,
      limit: limits.historyRetentionDays,
      current: daysDifference,
    };
  }
}

/**
 * Exceção lançada quando um limite é excedido
 */
export class WorkoutLimitExceededException extends Error {
  constructor(
    public readonly validationResult: ValidationResult,
    message?: string,
  ) {
    super(message || validationResult.message);
    this.name = 'WorkoutLimitExceededException';
  }
}
