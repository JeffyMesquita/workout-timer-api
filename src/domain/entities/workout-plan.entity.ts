import type { Exercise } from './exercise.entity';

export class WorkoutPlan {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public name: string,
    public description: string | null = null,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public exercises: Exercise[] = [],
  ) {}

  /**
   * Adiciona um exercício ao plano de treino
   */
  addExercise(exercise: Exercise): void {
    if (this.exercises.find((e) => e.id === exercise.id)) {
      throw new Error('Exercise already exists in this workout plan');
    }

    exercise.order = this.exercises.length + 1;
    this.exercises.push(exercise);
    this.updatedAt = new Date();
  }

  /**
   * Remove um exercício do plano de treino
   */
  removeExercise(exerciseId: string): void {
    const index = this.exercises.findIndex((e) => e.id === exerciseId);
    if (index === -1) {
      throw new Error('Exercise not found in this workout plan');
    }

    this.exercises.splice(index, 1);
    this.reorderExercises();
    this.updatedAt = new Date();
  }

  /**
   * Reordena os exercícios após remoção
   */
  private reorderExercises(): void {
    this.exercises.forEach((exercise, index) => {
      exercise.order = index + 1;
    });
  }

  /**
   * Atualiza a ordem dos exercícios
   */
  updateExerciseOrder(exerciseId: string, newOrder: number): void {
    const exercise = this.exercises.find((e) => e.id === exerciseId);
    if (!exercise) {
      throw new Error('Exercise not found in this workout plan');
    }

    if (newOrder < 1 || newOrder > this.exercises.length) {
      throw new Error('Invalid exercise order');
    }

    // Remove o exercício da posição atual
    const currentIndex = this.exercises.findIndex((e) => e.id === exerciseId);
    this.exercises.splice(currentIndex, 1);

    // Insere na nova posição
    this.exercises.splice(newOrder - 1, 0, exercise);

    // Reordena todos os exercícios
    this.reorderExercises();
    this.updatedAt = new Date();
  }

  /**
   * Verifica se o plano pode adicionar mais exercícios baseado no limite
   */
  canAddExercise(maxExercises: number): boolean {
    return this.exercises.length < maxExercises;
  }

  /**
   * Obtém o próximo número de ordem para um novo exercício
   */
  getNextExerciseOrder(): number {
    return this.exercises.length + 1;
  }

  /**
   * Atualiza informações básicas do plano
   */
  update(name: string, description: string | null): void {
    this.name = name;
    this.description = description;
    this.updatedAt = new Date();
  }

  /**
   * Desativa o plano de treino
   */
  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Ativa o plano de treino
   */
  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Obtém exercícios ordenados
   */
  getOrderedExercises(): Exercise[] {
    return [...this.exercises].sort((a, b) => a.order - b.order);
  }
}
