import { WorkoutSession } from '../entities/workout-session.entity';

export interface WorkoutSessionRepository {
  /**
   * Busca uma sessão de treino por ID
   */
  findById(id: string): Promise<WorkoutSession | null>;

  /**
   * Busca uma sessão por ID e usuário
   */
  findByIdAndUserId(id: string, userId: string): Promise<WorkoutSession | null>;

  /**
   * Busca sessões de treino de um usuário
   */
  findByUserId(userId: string): Promise<WorkoutSession[]>;

  /**
   * Busca sessão ativa de um usuário (se houver)
   */
  findActiveByUserId(userId: string): Promise<WorkoutSession | null>;

  /**
   * Busca sessões de um plano de treino específico
   */
  findByWorkoutPlanId(workoutPlanId: string): Promise<WorkoutSession[]>;

  /**
   * Busca histórico de sessões com paginação
   */
  findByUserIdWithPagination(
    userId: string,
    page: number,
    limit: number,
    status?: string[],
  ): Promise<{
    sessions: WorkoutSession[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Conta sessões por status
   */
  countByUserIdAndStatus(userId: string, status: string): Promise<number>;

  /**
   * Salva uma sessão de treino (create ou update)
   */
  save(session: WorkoutSession): Promise<WorkoutSession>;

  /**
   * Remove uma sessão de treino
   */
  delete(id: string): Promise<void>;

  /**
   * Verifica se existe sessão ativa para o usuário
   */
  hasActiveSession(userId: string): Promise<boolean>;

  /**
   * Busca última sessão de um plano específico
   */
  findLastByWorkoutPlanId(
    workoutPlanId: string,
  ): Promise<WorkoutSession | null>;

  /**
   * Busca sessões dentro de um período
   */
  findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<WorkoutSession[]>;

  /**
   * Estatísticas de sessões
   */
  getSessionStats(userId: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    averageDurationMinutes: number;
    totalWorkoutTimeMinutes: number;
  }>;
}
