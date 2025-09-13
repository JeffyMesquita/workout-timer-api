import type { WorkoutSet } from './set.entity';

export type ExecutionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

export class ExerciseExecution {
  constructor(
    public readonly id: string,
    public readonly workoutSessionId: string,
    public readonly exerciseId: string,
    public status: ExecutionStatus = 'NOT_STARTED',
    public startedAt: Date | null = null,
    public completedAt: Date | null = null,
    public notes: string | null = null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public sets: WorkoutSet[] = [],
  ) {}

  /**
   * Inicia a execução do exercício
   */
  start(): void {
    if (this.status !== 'NOT_STARTED') {
      throw new Error('Exercise execution has already been started');
    }

    this.status = 'IN_PROGRESS';
    this.startedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Finaliza a execução do exercício
   */
  complete(notes?: string): void {
    if (this.status !== 'IN_PROGRESS') {
      throw new Error('Can only complete an exercise execution that is in progress');
    }

    this.status = 'COMPLETED';
    this.completedAt = new Date();
    this.notes = notes || this.notes;
    this.updatedAt = new Date();
  }

  /**
   * Pula a execução do exercício
   */
  skip(reason?: string): void {
    if (this.status === 'COMPLETED') {
      throw new Error('Cannot skip a completed exercise execution');
    }

    this.status = 'SKIPPED';
    this.completedAt = new Date();
    this.notes = reason ? `Pulado: ${reason}` : this.notes;
    this.updatedAt = new Date();
  }

  /**
   * Adiciona uma série à execução
   */
  addSet(set: WorkoutSet): void {
    if (this.status === 'NOT_STARTED') {
      throw new Error('Cannot add sets before starting exercise execution');
    }

    if (this.status === 'COMPLETED' || this.status === 'SKIPPED') {
      throw new Error('Cannot add sets to a completed or skipped exercise execution');
    }

    // Verificar se já existe série com o mesmo número
    if (this.sets.find((s) => s.setNumber === set.setNumber)) {
      throw new Error(`Set number ${set.setNumber} already exists`);
    }

    this.sets.push(set);
    this.updatedAt = new Date();
  }

  /**
   * Atualiza uma série específica
   */
  updateSet(setNumber: number, actualReps: number, weight?: number, notes?: string): void {
    const set = this.sets.find((s) => s.setNumber === setNumber);
    if (!set) {
      throw new Error(`Set number ${setNumber} not found`);
    }

    set.complete(actualReps, weight, notes);
    this.updatedAt = new Date();
  }

  /**
   * Remove uma série
   */
  removeSet(setNumber: number): void {
    const index = this.sets.findIndex((s) => s.setNumber === setNumber);
    if (index === -1) {
      throw new Error(`Set number ${setNumber} not found`);
    }

    this.sets.splice(index, 1);
    this.updatedAt = new Date();
  }

  /**
   * Obtém séries ordenadas por número
   */
  getOrderedSets(): WorkoutSet[] {
    return [...this.sets].sort((a, b) => a.setNumber - b.setNumber);
  }

  /**
   * Verifica se todas as séries foram completadas
   */
  areAllSetsCompleted(): boolean {
    return this.sets.length > 0 && this.sets.every((set) => set.isCompleted());
  }

  /**
   * Conta séries completadas
   */
  getCompletedSetsCount(): number {
    return this.sets.filter((set) => set.isCompleted()).length;
  }

  /**
   * Calcula duração total da execução
   */
  getTotalDurationMs(): number {
    if (!this.startedAt) return 0;

    const endTime = this.completedAt || new Date();
    return endTime.getTime() - this.startedAt.getTime();
  }

  /**
   * Formata duração em formato legível
   */
  getFormattedDuration(): string {
    const durationMs = this.getTotalDurationMs();
    const totalSeconds = Math.floor(durationMs / 1000);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Obtém resumo da execução
   */
  getSummary(): {
    status: ExecutionStatus;
    duration: string;
    completedSets: number;
    totalSets: number;
    completionRate: number;
    averageWeight: number | null;
    totalReps: number;
  } {
    const completedSets = this.getCompletedSetsCount();
    const totalSets = this.sets.length;
    const completionRate = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

    const setsWithWeight = this.sets.filter((set) => set.weight !== null && set.isCompleted());
    const averageWeight =
      setsWithWeight.length > 0
        ? setsWithWeight.reduce((sum, set) => sum + (set.weight || 0), 0) / setsWithWeight.length
        : null;

    const totalReps = this.sets
      .filter((set) => set.isCompleted())
      .reduce((sum, set) => sum + (set.actualReps || 0), 0);

    return {
      status: this.status,
      duration: this.getFormattedDuration(),
      completedSets,
      totalSets,
      completionRate,
      averageWeight,
      totalReps,
    };
  }

  /**
   * Verifica se pode ser iniciada
   */
  canBeStarted(): boolean {
    return this.status === 'NOT_STARTED';
  }

  /**
   * Verifica se pode ser finalizada
   */
  canBeCompleted(): boolean {
    return this.status === 'IN_PROGRESS';
  }

  /**
   * Verifica se pode ser pulada
   */
  canBeSkipped(): boolean {
    return this.status === 'NOT_STARTED' || this.status === 'IN_PROGRESS';
  }

  /**
   * Verifica se está ativa
   */
  isActive(): boolean {
    return this.status === 'IN_PROGRESS';
  }

  /**
   * Verifica se foi finalizada
   */
  isFinished(): boolean {
    return this.status === 'COMPLETED' || this.status === 'SKIPPED';
  }
}
