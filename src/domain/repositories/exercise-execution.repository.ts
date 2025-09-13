import { ExerciseExecution } from '../entities/exercise-execution.entity';

export interface ExerciseExecutionRepository {
  /**
   * Busca uma execução por ID
   */
  findById(id: string): Promise<ExerciseExecution | null>;

  /**
   * Busca execuções por sessão de treino
   */
  findByWorkoutSessionId(
    workoutSessionId: string,
  ): Promise<ExerciseExecution[]>;

  /**
   * Busca execução específica de um exercício em uma sessão
   */
  findByWorkoutSessionIdAndExerciseId(
    workoutSessionId: string,
    exerciseId: string,
  ): Promise<ExerciseExecution | null>;

  /**
   * Busca execuções por exercício (histórico)
   */
  findByExerciseId(exerciseId: string): Promise<ExerciseExecution[]>;

  /**
   * Busca execuções ativas (em progresso)
   */
  findActiveByWorkoutSessionId(
    workoutSessionId: string,
  ): Promise<ExerciseExecution[]>;

  /**
   * Salva uma execução (create ou update)
   */
  save(execution: ExerciseExecution): Promise<ExerciseExecution>;

  /**
   * Remove uma execução
   */
  delete(id: string): Promise<void>;

  /**
   * Conta execuções por status
   */
  countByWorkoutSessionIdAndStatus(
    workoutSessionId: string,
    status: string,
  ): Promise<number>;

  /**
   * Busca última execução de um exercício específico
   */
  findLastByExerciseId(exerciseId: string): Promise<ExerciseExecution | null>;

  /**
   * Busca execuções com paginação
   */
  findByExerciseIdWithPagination(
    exerciseId: string,
    page: number,
    limit: number,
  ): Promise<{
    executions: ExerciseExecution[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Estatísticas de execução de um exercício
   */
  getExerciseStats(exerciseId: string): Promise<{
    totalExecutions: number;
    completedExecutions: number;
    averageReps: number;
    maxWeight: number | null;
    averageWeight: number | null;
    bestPerformance: {
      maxReps: number;
      maxWeight: number | null;
      date: Date;
    } | null;
  }>;
}
