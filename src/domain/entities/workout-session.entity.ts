export type WorkoutSessionStatus =
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED';

export class WorkoutSession {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly workoutPlanId: string,
    public status: WorkoutSessionStatus = 'IN_PROGRESS',
    public readonly startedAt: Date = new Date(),
    public pausedAt: Date | null = null,
    public resumedAt: Date | null = null,
    public completedAt: Date | null = null,
    public cancelledAt: Date | null = null,
    public totalDurationMs: number | null = null,
    public notes: string | null = null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  /**
   * Pausa a sessão de treino
   */
  pause(): void {
    if (this.status !== 'IN_PROGRESS') {
      throw new Error('Can only pause a workout session that is in progress');
    }

    this.status = 'PAUSED';
    this.pausedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Retoma a sessão de treino pausada
   */
  resume(): void {
    if (this.status !== 'PAUSED') {
      throw new Error('Can only resume a paused workout session');
    }

    this.status = 'IN_PROGRESS';
    this.resumedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Finaliza a sessão de treino
   */
  complete(notes?: string): void {
    if (this.status !== 'IN_PROGRESS' && this.status !== 'PAUSED') {
      throw new Error(
        'Can only complete a workout session that is in progress or paused',
      );
    }

    this.status = 'COMPLETED';
    this.completedAt = new Date();
    this.notes = notes || this.notes;
    this.totalDurationMs = this.calculateTotalDuration();
    this.updatedAt = new Date();
  }

  /**
   * Cancela a sessão de treino
   */
  cancel(reason?: string): void {
    if (this.status === 'COMPLETED' || this.status === 'CANCELLED') {
      throw new Error(
        'Cannot cancel a workout session that is already completed or cancelled',
      );
    }

    this.status = 'CANCELLED';
    this.cancelledAt = new Date();
    this.notes = reason ? `Cancelado: ${reason}` : this.notes;
    this.totalDurationMs = this.calculateTotalDuration();
    this.updatedAt = new Date();
  }

  /**
   * Adiciona ou atualiza notas da sessão
   */
  updateNotes(notes: string): void {
    this.notes = notes;
    this.updatedAt = new Date();
  }

  /**
   * Verifica se a sessão está ativa (em progresso ou pausada)
   */
  isActive(): boolean {
    return this.status === 'IN_PROGRESS' || this.status === 'PAUSED';
  }

  /**
   * Verifica se a sessão foi finalizada
   */
  isFinished(): boolean {
    return this.status === 'COMPLETED' || this.status === 'CANCELLED';
  }

  /**
   * Calcula a duração total da sessão em millisegundos
   */
  private calculateTotalDuration(): number {
    const endTime = this.completedAt || this.cancelledAt || new Date();
    let totalDuration = 0;

    if (this.pausedAt && this.resumedAt) {
      // Se houve pausa e retomada, calcular considerando o tempo pausado
      const pauseDuration = this.resumedAt.getTime() - this.pausedAt.getTime();
      totalDuration =
        endTime.getTime() - this.startedAt.getTime() - pauseDuration;
    } else if (this.pausedAt && !this.resumedAt) {
      // Se está pausado e não foi retomado, calcular até o momento da pausa
      totalDuration = this.pausedAt.getTime() - this.startedAt.getTime();
    } else {
      // Caso normal: sem pausa ou com retomada
      totalDuration = endTime.getTime() - this.startedAt.getTime();
    }

    return Math.max(0, totalDuration); // Garantir que não seja negativo
  }

  /**
   * Obtém a duração atual da sessão em millisegundos
   */
  getCurrentDuration(): number {
    if (this.totalDurationMs && this.isFinished()) {
      return this.totalDurationMs;
    }

    if (this.status === 'PAUSED' && this.pausedAt) {
      return this.pausedAt.getTime() - this.startedAt.getTime();
    }

    return new Date().getTime() - this.startedAt.getTime();
  }

  /**
   * Formata a duração em formato legível (HH:MM:SS)
   */
  getFormattedDuration(): string {
    const durationMs = this.getCurrentDuration();
    const totalSeconds = Math.floor(durationMs / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  /**
   * Obtém informações de status formatadas
   */
  getStatusInfo(): {
    status: WorkoutSessionStatus;
    duration: string;
    startedAt: Date;
    endedAt: Date | null;
  } {
    return {
      status: this.status,
      duration: this.getFormattedDuration(),
      startedAt: this.startedAt,
      endedAt: this.completedAt || this.cancelledAt,
    };
  }

  /**
   * Verifica se a sessão pode ser pausada
   */
  canBePaused(): boolean {
    return this.status === 'IN_PROGRESS';
  }

  /**
   * Verifica se a sessão pode ser retomada
   */
  canBeResumed(): boolean {
    return this.status === 'PAUSED';
  }

  /**
   * Verifica se a sessão pode ser finalizada
   */
  canBeCompleted(): boolean {
    return this.status === 'IN_PROGRESS' || this.status === 'PAUSED';
  }

  /**
   * Verifica se a sessão pode ser cancelada
   */
  canBeCancelled(): boolean {
    return this.status === 'IN_PROGRESS' || this.status === 'PAUSED';
  }
}
