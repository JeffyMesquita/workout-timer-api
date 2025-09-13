export class WorkoutSet {
  constructor(
    public readonly id: string,
    public readonly exerciseExecutionId: string,
    public readonly setNumber: number,
    public readonly plannedReps: number,
    public actualReps: number | null = null,
    public weight: number | null = null,
    public restTimeSeconds: number | null = null,
    public completedAt: Date | null = null,
    public notes: string | null = null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {
    this.validateSetNumber();
    this.validatePlannedReps();
  }

  /**
   * Marca a série como completa com os dados reais
   */
  complete(actualReps: number, weight?: number, notes?: string, restTimeSeconds?: number): void {
    this.validateActualReps(actualReps);
    this.validateWeight(weight);
    this.validateRestTime(restTimeSeconds);

    this.actualReps = actualReps;
    this.weight = weight || null;
    this.notes = notes || null;
    this.restTimeSeconds = restTimeSeconds || null;
    this.completedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Atualiza apenas o peso da série
   */
  updateWeight(weight: number): void {
    this.validateWeight(weight);
    this.weight = weight;
    this.updatedAt = new Date();
  }

  /**
   * Atualiza apenas as repetições
   */
  updateReps(actualReps: number): void {
    this.validateActualReps(actualReps);
    this.actualReps = actualReps;
    this.updatedAt = new Date();
  }

  /**
   * Atualiza o tempo de descanso real
   */
  updateRestTime(restTimeSeconds: number): void {
    this.validateRestTime(restTimeSeconds);
    this.restTimeSeconds = restTimeSeconds;
    this.updatedAt = new Date();
  }

  /**
   * Adiciona ou atualiza notas da série
   */
  updateNotes(notes: string): void {
    if (notes.length > 200) {
      throw new Error('Notes must be 200 characters or less');
    }

    this.notes = notes;
    this.updatedAt = new Date();
  }

  /**
   * Verifica se a série foi completada
   */
  isCompleted(): boolean {
    return this.completedAt !== null && this.actualReps !== null;
  }

  /**
   * Verifica se a série foi executada com sucesso (reps > 0)
   */
  wasSuccessful(): boolean {
    return this.isCompleted() && (this.actualReps || 0) > 0;
  }

  /**
   * Calcula a diferença entre reps planejadas e realizadas
   */
  getRepsDifference(): number {
    if (!this.isCompleted()) return 0;
    return (this.actualReps || 0) - this.plannedReps;
  }

  /**
   * Obtém porcentagem de conclusão das reps
   */
  getCompletionPercentage(): number {
    if (!this.isCompleted()) return 0;
    if (this.plannedReps === 0) return 100;

    return Math.round(((this.actualReps || 0) / this.plannedReps) * 100);
  }

  /**
   * Formata o peso para exibição
   */
  getFormattedWeight(): string {
    if (this.weight === null) return 'Peso corporal';

    // Formatação brasileira com vírgula
    return `${this.weight.toString().replace('.', ',')} kg`;
  }

  /**
   * Formata o tempo de descanso
   */
  getFormattedRestTime(): string {
    if (this.restTimeSeconds === null) return 'Não informado';

    if (this.restTimeSeconds < 60) {
      return `${this.restTimeSeconds}s`;
    }

    const minutes = Math.floor(this.restTimeSeconds / 60);
    const seconds = this.restTimeSeconds % 60;

    if (seconds === 0) {
      return `${minutes}min`;
    }

    return `${minutes}min ${seconds}s`;
  }

  /**
   * Obtém descrição formatada da série
   */
  getFormattedDescription(): string {
    if (!this.isCompleted()) {
      return `Série ${this.setNumber}: ${this.plannedReps} reps planejadas`;
    }

    const repsText = `${this.actualReps}/${this.plannedReps} reps`;
    const weightText = this.weight ? ` | ${this.getFormattedWeight()}` : '';
    const restText = this.restTimeSeconds ? ` | Descanso: ${this.getFormattedRestTime()}` : '';

    return `Série ${this.setNumber}: ${repsText}${weightText}${restText}`;
  }

  /**
   * Compara performance com série anterior
   */
  compareWith(previousSet: WorkoutSet): {
    repsImprovement: number;
    weightImprovement: number;
    overallImprovement: 'better' | 'same' | 'worse';
  } {
    const repsImprovement = (this.actualReps || 0) - (previousSet.actualReps || 0);
    const weightImprovement = (this.weight || 0) - (previousSet.weight || 0);

    let overallImprovement: 'better' | 'same' | 'worse' = 'same';

    if (weightImprovement > 0 || (weightImprovement === 0 && repsImprovement > 0)) {
      overallImprovement = 'better';
    } else if (weightImprovement < 0 || (weightImprovement === 0 && repsImprovement < 0)) {
      overallImprovement = 'worse';
    }

    return {
      repsImprovement,
      weightImprovement,
      overallImprovement,
    };
  }

  /**
   * Cria uma cópia da série para novo exercício
   */
  clone(newId: string, newExerciseExecutionId: string): WorkoutSet {
    return new WorkoutSet(
      newId,
      newExerciseExecutionId,
      this.setNumber,
      this.plannedReps,
      null, // Reset actual values for new execution
      this.weight, // Keep previous weight as starting point
      null,
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  /**
   * Validações privadas
   */
  private validateSetNumber(setNumber?: number): void {
    const numberToValidate = setNumber ?? this.setNumber;
    if (numberToValidate < 1 || numberToValidate > 20) {
      throw new Error('Set number must be between 1 and 20');
    }
  }

  private validatePlannedReps(reps?: number): void {
    const repsToValidate = reps ?? this.plannedReps;
    if (repsToValidate < 1 || repsToValidate > 100) {
      throw new Error('Planned reps must be between 1 and 100');
    }
  }

  private validateActualReps(reps?: number): void {
    if (reps !== undefined && reps !== null) {
      if (reps < 0 || reps > 100) {
        throw new Error('Actual reps must be between 0 and 100');
      }
    }
  }

  private validateWeight(weight?: number): void {
    if (weight !== undefined && weight !== null) {
      if (weight < 0 || weight > 1000) {
        throw new Error('Weight must be between 0 and 1000 kg');
      }
    }
  }

  private validateRestTime(restTime?: number): void {
    if (restTime !== undefined && restTime !== null) {
      if (restTime < 0 || restTime > 1800) {
        // máximo 30 minutos
        throw new Error('Rest time must be between 0 and 1800 seconds');
      }
    }
  }

  /**
   * Obtém estatísticas da série
   */
  getStats(): {
    isCompleted: boolean;
    wasSuccessful: boolean;
    repsDifference: number;
    completionPercentage: number;
    volume: number; // peso x reps
  } {
    const volume = this.isCompleted() && this.weight ? this.weight * (this.actualReps || 0) : 0;

    return {
      isCompleted: this.isCompleted(),
      wasSuccessful: this.wasSuccessful(),
      repsDifference: this.getRepsDifference(),
      completionPercentage: this.getCompletionPercentage(),
      volume,
    };
  }
}
