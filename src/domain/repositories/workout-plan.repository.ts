import { WorkoutPlan } from '../entities/workout-plan.entity';

export interface WorkoutPlanRepository {
  /**
   * Busca um plano de treino por ID
   */
  findById(id: string): Promise<WorkoutPlan | null>;

  /**
   * Busca um plano de treino por ID e usuário
   */
  findByIdAndUserId(id: string, userId: string): Promise<WorkoutPlan | null>;

  /**
   * Lista todos os planos de treino de um usuário
   */
  findByUserId(userId: string): Promise<WorkoutPlan[]>;

  /**
   * Lista planos de treino ativos de um usuário
   */
  findActiveByUserId(userId: string): Promise<WorkoutPlan[]>;

  /**
   * Conta quantos planos de treino um usuário possui
   */
  countByUserId(userId: string): Promise<number>;

  /**
   * Conta quantos planos de treino ativos um usuário possui
   */
  countActiveByUserId(userId: string): Promise<number>;

  /**
   * Salva um plano de treino (create ou update)
   */
  save(workoutPlan: WorkoutPlan): Promise<WorkoutPlan>;

  /**
   * Remove um plano de treino
   */
  delete(id: string): Promise<void>;

  /**
   * Verifica se um plano de treino existe
   */
  exists(id: string): Promise<boolean>;

  /**
   * Verifica se um usuário possui um plano com determinado nome
   */
  existsByUserIdAndName(
    userId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean>;

  /**
   * Busca planos de treino com paginação
   */
  findByUserIdWithPagination(
    userId: string,
    page: number,
    limit: number,
    includeInactive?: boolean,
  ): Promise<{
    plans: WorkoutPlan[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Busca planos de treino por nome (busca parcial)
   */
  searchByName(userId: string, searchTerm: string): Promise<WorkoutPlan[]>;
}
