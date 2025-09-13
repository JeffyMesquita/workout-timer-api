export class WorkoutLimits {
  constructor(
    public readonly maxWorkoutPlans: number,
    public readonly maxExercisesPerPlan: number,
    public readonly historyRetentionDays: number,
    public readonly canAccessTrainerFeatures: boolean = false,
  ) {
    this.validateLimits();
  }

  /**
   * Cria limites para usuário free tier
   */
  static createFreeTierLimits(): WorkoutLimits {
    return new WorkoutLimits(
      2, // máximo 2 planos de treino
      5, // máximo 5 exercícios por plano
      30, // histórico de 30 dias
      false, // sem funcionalidades de treinador
    );
  }

  /**
   * Cria limites para usuário premium
   */
  static createPremiumLimits(): WorkoutLimits {
    return new WorkoutLimits(
      -1, // ilimitado (-1 indica sem limite)
      -1, // ilimitado
      -1, // histórico completo
      true, // com funcionalidades de treinador
    );
  }

  /**
   * Verifica se pode criar mais planos de treino
   */
  canCreateWorkoutPlan(currentCount: number): boolean {
    if (this.maxWorkoutPlans === -1) return true; // ilimitado
    return currentCount < this.maxWorkoutPlans;
  }

  /**
   * Verifica se pode adicionar mais exercícios a um plano
   */
  canAddExercise(currentCount: number): boolean {
    if (this.maxExercisesPerPlan === -1) return true; // ilimitado
    return currentCount < this.maxExercisesPerPlan;
  }

  /**
   * Verifica se o histórico deve ser mantido para uma data específica
   */
  shouldRetainHistory(date: Date): boolean {
    if (this.historyRetentionDays === -1) return true; // retenção completa

    const daysDifference = Math.floor(
      (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    return daysDifference <= this.historyRetentionDays;
  }

  /**
   * Obtém mensagem de limite para planos de treino
   */
  getWorkoutPlanLimitMessage(): string {
    if (this.maxWorkoutPlans === -1) {
      return 'Planos de treino ilimitados';
    }
    return `Máximo de ${this.maxWorkoutPlans} planos de treino`;
  }

  /**
   * Obtém mensagem de limite para exercícios
   */
  getExerciseLimitMessage(): string {
    if (this.maxExercisesPerPlan === -1) {
      return 'Exercícios ilimitados por plano';
    }
    return `Máximo de ${this.maxExercisesPerPlan} exercícios por plano`;
  }

  /**
   * Obtém resumo dos limites
   */
  getSummary(): {
    workoutPlans: string;
    exercises: string;
    history: string;
    trainer: string;
  } {
    return {
      workoutPlans: this.getWorkoutPlanLimitMessage(),
      exercises: this.getExerciseLimitMessage(),
      history:
        this.historyRetentionDays === -1
          ? 'Histórico completo'
          : `Histórico de ${this.historyRetentionDays} dias`,
      trainer: this.canAccessTrainerFeatures
        ? 'Funcionalidades de treinador disponíveis'
        : 'Funcionalidades de treinador não disponíveis',
    };
  }

  /**
   * Verifica se é um plano premium
   */
  isPremium(): boolean {
    return this.maxWorkoutPlans === -1 && this.maxExercisesPerPlan === -1;
  }

  /**
   * Valida os limites fornecidos
   */
  private validateLimits(): void {
    if (this.maxWorkoutPlans < -1 || this.maxWorkoutPlans === 0) {
      throw new Error('Max workout plans must be -1 (unlimited) or greater than 0');
    }

    if (this.maxExercisesPerPlan < -1 || this.maxExercisesPerPlan === 0) {
      throw new Error('Max exercises per plan must be -1 (unlimited) or greater than 0');
    }

    if (this.historyRetentionDays < -1 || this.historyRetentionDays === 0) {
      throw new Error('History retention days must be -1 (unlimited) or greater than 0');
    }
  }

  /**
   * Compara com outros limites
   */
  equals(other: WorkoutLimits): boolean {
    return (
      this.maxWorkoutPlans === other.maxWorkoutPlans &&
      this.maxExercisesPerPlan === other.maxExercisesPerPlan &&
      this.historyRetentionDays === other.historyRetentionDays &&
      this.canAccessTrainerFeatures === other.canAccessTrainerFeatures
    );
  }
}
