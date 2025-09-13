import type { WorkoutSet } from '../entities/set.entity';

export interface SetRepository {
  /**
   * Busca uma série por ID
   */
  findById(id: string): Promise<WorkoutSet | null>;

  /**
   * Busca séries por execução de exercício
   */
  findByExerciseExecutionId(exerciseExecutionId: string): Promise<WorkoutSet[]>;

  /**
   * Busca série específica por execução e número
   */
  findByExerciseExecutionIdAndSetNumber(
    exerciseExecutionId: string,
    setNumber: number,
  ): Promise<WorkoutSet | null>;

  /**
   * Salva uma série (create ou update)
   */
  save(set: WorkoutSet): Promise<WorkoutSet>;

  /**
   * Remove uma série
   */
  delete(id: string): Promise<void>;

  /**
   * Conta séries completadas de uma execução
   */
  countCompletedByExerciseExecutionId(exerciseExecutionId: string): Promise<number>;

  /**
   * Busca séries por peso (para comparação)
   */
  findByWeightRange(
    exerciseExecutionId: string,
    minWeight: number,
    maxWeight: number,
  ): Promise<WorkoutSet[]>;

  /**
   * Busca última série de um exercício específico (para sugestão de peso)
   */
  findLastByExerciseId(exerciseId: string): Promise<WorkoutSet | null>;

  /**
   * Estatísticas de séries de um exercício
   */
  getSetStatsForExercise(exerciseId: string): Promise<{
    totalSets: number;
    completedSets: number;
    averageReps: number;
    averageWeight: number | null;
    maxWeight: number | null;
    totalVolume: number; // peso x reps total
    progressionData: {
      date: Date;
      weight: number | null;
      reps: number;
      volume: number;
    }[];
  }>;

  /**
   * Busca progressão de peso de um exercício ao longo do tempo
   */
  getWeightProgression(
    exerciseId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<
    {
      date: Date;
      weight: number | null;
      reps: number;
      volume: number;
      sessionId: string;
    }[]
  >;

  /**
   * Salva múltiplas séries em transação
   */
  saveMany(sets: WorkoutSet[]): Promise<WorkoutSet[]>;

  /**
   * Remove todas as séries de uma execução
   */
  deleteByExerciseExecutionId(exerciseExecutionId: string): Promise<void>;
}
