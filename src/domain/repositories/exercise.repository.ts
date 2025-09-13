import type { Exercise } from '../entities/exercise.entity';

export interface ExerciseRepository {
  /**
   * Busca um exercício por ID
   */
  findById(id: string): Promise<Exercise | null>;

  /**
   * Busca exercícios por plano de treino
   */
  findByWorkoutPlanId(workoutPlanId: string): Promise<Exercise[]>;

  /**
   * Conta exercícios de um plano de treino
   */
  countByWorkoutPlanId(workoutPlanId: string): Promise<number>;

  /**
   * Salva um exercício (create ou update)
   */
  save(exercise: Exercise): Promise<Exercise>;

  /**
   * Remove um exercício
   */
  delete(id: string): Promise<void>;

  /**
   * Verifica se um exercício existe
   */
  exists(id: string): Promise<boolean>;

  /**
   * Verifica se existe exercício com determinado nome no plano
   */
  existsByWorkoutPlanIdAndName(
    workoutPlanId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean>;

  /**
   * Busca exercícios por grupo muscular
   */
  findByMuscleGroup(workoutPlanId: string, muscleGroup: string): Promise<Exercise[]>;

  /**
   * Obtém o próximo número de ordem para um exercício no plano
   */
  getNextOrderByWorkoutPlanId(workoutPlanId: string): Promise<number>;

  /**
   * Atualiza a ordem de múltiplos exercícios
   */
  updateOrders(exercises: { id: string; order: number }[]): Promise<void>;
}
