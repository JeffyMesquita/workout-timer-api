export class Exercise {
  constructor(
    public readonly id: string,
    public readonly workoutPlanId: string,
    public name: string,
    public description: string | null = null,
    public targetMuscleGroup: string | null = null,
    public sets: number = 3,
    public reps: number = 10,
    public restTimeSeconds: number = 60,
    public order: number = 1,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {
    this.validateSets();
    this.validateReps();
    this.validateRestTime();
    this.validateOrder();
  }

  /**
   * Atualiza as informações do exercício
   */
  update(
    name: string,
    description: string | null,
    targetMuscleGroup: string | null,
    sets: number,
    reps: number,
    restTimeSeconds: number,
  ): void {
    this.name = name;
    this.description = description;
    this.targetMuscleGroup = targetMuscleGroup;
    this.sets = sets;
    this.reps = reps;
    this.restTimeSeconds = restTimeSeconds;
    this.updatedAt = new Date();

    this.validateSets();
    this.validateReps();
    this.validateRestTime();
  }

  /**
   * Atualiza apenas a configuração de séries e repetições
   */
  updateSetsAndReps(sets: number, reps: number, restTimeSeconds: number): void {
    this.sets = sets;
    this.reps = reps;
    this.restTimeSeconds = restTimeSeconds;
    this.updatedAt = new Date();

    this.validateSets();
    this.validateReps();
    this.validateRestTime();
  }

  /**
   * Atualiza a ordem do exercício
   */
  updateOrder(newOrder: number): void {
    this.validateOrder(newOrder);
    this.order = newOrder;
    this.updatedAt = new Date();
  }

  /**
   * Calcula o tempo total estimado do exercício (incluindo descanso)
   */
  getEstimatedDurationSeconds(): number {
    // Tempo estimado: 30 segundos por série + tempo de descanso entre séries
    const executionTimePerSet = 30; // segundos
    const totalExecutionTime = this.sets * executionTimePerSet;
    const totalRestTime = (this.sets - 1) * this.restTimeSeconds; // sem descanso após a última série

    return totalExecutionTime + totalRestTime;
  }

  /**
   * Obtém uma descrição formatada do exercício
   */
  getFormattedDescription(): string {
    const setsReps = `${this.sets} séries x ${this.reps} repetições`;
    const restTime = `Descanso: ${this.formatRestTime()}`;
    const muscle = this.targetMuscleGroup ? ` | ${this.targetMuscleGroup}` : '';

    return `${setsReps} | ${restTime}${muscle}`;
  }

  /**
   * Formata o tempo de descanso em formato legível
   */
  private formatRestTime(): string {
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
   * Valida o número de séries
   */
  private validateSets(sets?: number): void {
    const setsToValidate = sets ?? this.sets;
    if (setsToValidate < 1 || setsToValidate > 20) {
      throw new Error('Sets must be between 1 and 20');
    }
  }

  /**
   * Valida o número de repetições
   */
  private validateReps(reps?: number): void {
    const repsToValidate = reps ?? this.reps;
    if (repsToValidate < 1 || repsToValidate > 100) {
      throw new Error('Reps must be between 1 and 100');
    }
  }

  /**
   * Valida o tempo de descanso
   */
  private validateRestTime(restTime?: number): void {
    const restTimeToValidate = restTime ?? this.restTimeSeconds;
    if (restTimeToValidate < 0 || restTimeToValidate > 600) {
      // máximo 10 minutos
      throw new Error('Rest time must be between 0 and 600 seconds');
    }
  }

  /**
   * Valida a ordem do exercício
   */
  private validateOrder(order?: number): void {
    const orderToValidate = order ?? this.order;
    if (orderToValidate < 1) {
      throw new Error('Exercise order must be greater than 0');
    }
  }

  /**
   * Cria uma cópia do exercício com novos valores
   */
  clone(newId: string, newWorkoutPlanId: string): Exercise {
    return new Exercise(
      newId,
      newWorkoutPlanId,
      this.name,
      this.description,
      this.targetMuscleGroup,
      this.sets,
      this.reps,
      this.restTimeSeconds,
      this.order,
      new Date(),
      new Date(),
    );
  }
}
