import { Inject, Injectable } from '@nestjs/common';

import { ExerciseExecutionRepository } from '../../domain/repositories/exercise-execution.repository';
import { SetRepository } from '../../domain/repositories/set.repository';

export interface FinishExerciseExecutionInput {
  userId: string;
  exerciseExecutionId: string;
  notes?: string;
  forceComplete?: boolean; // Para finalizar mesmo sem todas as séries
}

export interface FinishExerciseExecutionOutput {
  id: string;
  exerciseId: string;
  status: string;
  completedAt: Date;
  totalDurationMs: number;
  formattedDuration: string;
  notes: string | null;
  exercise: {
    name: string;
    targetMuscleGroup: string | null;
  };
  performance: {
    totalSets: number;
    completedSets: number;
    skippedSets: number;
    completionRate: number;
    totalReps: number;
    averageWeight: number | null;
    totalVolume: number;
  };
  sets: {
    setNumber: number;
    plannedReps: number;
    actualReps: number | null;
    weight: number | null;
    isCompleted: boolean;
    formattedDescription: string;
  }[];
  recommendations: {
    nextWorkoutSuggestions: string[];
    performanceNotes: string[];
  };
}

@Injectable()
export class FinishExerciseExecutionUseCase {
  constructor(
    @Inject('ExerciseExecutionRepository')
    private readonly exerciseExecutionRepository: ExerciseExecutionRepository,
    @Inject('SetRepository')
    private readonly setRepository: SetRepository,
  ) {}

  async execute(input: FinishExerciseExecutionInput): Promise<FinishExerciseExecutionOutput> {
    const { userId, exerciseExecutionId, notes, forceComplete = false } = input;

    // Validar entrada
    this.validateInput(input);

    // Buscar a execução do exercício
    const exerciseExecution = await this.exerciseExecutionRepository.findById(exerciseExecutionId);

    if (!exerciseExecution) {
      throw new Error('Execução de exercício não encontrada');
    }

    if (!exerciseExecution.isActive()) {
      throw new Error('Execução de exercício não está ativa');
    }

    // Verificar se todas as séries foram completadas
    if (!exerciseExecution.areAllSetsCompleted() && !forceComplete) {
      const completedSets = exerciseExecution.getCompletedSetsCount();
      const totalSets = exerciseExecution.sets.length;
      throw new Error(
        `Nem todas as séries foram completadas (${completedSets}/${totalSets}). Use forceComplete=true para finalizar mesmo assim.`,
      );
    }

    // Buscar informações detalhadas das séries
    const sets = await this.setRepository.findByExerciseExecutionId(exerciseExecutionId);

    // Finalizar a execução
    exerciseExecution.complete(notes);

    // Salvar alterações
    const savedExecution = await this.exerciseExecutionRepository.save(exerciseExecution);

    // Calcular estatísticas de performance
    const completedSets = sets.filter((set) => set.isCompleted());
    const skippedSets = sets.length - completedSets.length;
    const completionRate =
      sets.length > 0 ? Math.round((completedSets.length / sets.length) * 100) : 0;

    const totalReps = completedSets.reduce((sum, set) => sum + (set.actualReps || 0), 0);

    const setsWithWeight = completedSets.filter((set) => set.weight !== null);
    const averageWeight =
      setsWithWeight.length > 0
        ? setsWithWeight.reduce((sum, set) => sum + (set.weight || 0), 0) / setsWithWeight.length
        : null;

    const totalVolume = completedSets.reduce(
      (sum, set) => sum + (set.weight || 0) * (set.actualReps || 0),
      0,
    );

    // Gerar recomendações
    const recommendations = this.generateRecommendations(sets, exerciseExecution);

    // Preparar informações das séries
    const setInfos = sets.map((set) => ({
      setNumber: set.setNumber,
      plannedReps: set.plannedReps,
      actualReps: set.actualReps,
      weight: set.weight,
      isCompleted: set.isCompleted(),
      formattedDescription: set.getFormattedDescription(),
    }));

    return {
      id: savedExecution.id,
      exerciseId: savedExecution.exerciseId,
      status: savedExecution.status,
      completedAt: savedExecution.completedAt!,
      totalDurationMs: savedExecution.getTotalDurationMs(),
      formattedDuration: savedExecution.getFormattedDuration(),
      notes: savedExecution.notes,
      exercise: {
        name: 'Exercise Name', // TODO: Buscar do repositório de exercícios
        targetMuscleGroup: null, // TODO: Buscar do repositório de exercícios
      },
      performance: {
        totalSets: sets.length,
        completedSets: completedSets.length,
        skippedSets,
        completionRate,
        totalReps,
        averageWeight,
        totalVolume,
      },
      sets: setInfos,
      recommendations,
    };
  }

  private validateInput(input: FinishExerciseExecutionInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID é obrigatório');
    }

    if (!input.exerciseExecutionId || input.exerciseExecutionId.trim().length === 0) {
      throw new Error('Exercise Execution ID é obrigatório');
    }

    if (input.notes && input.notes.length > 500) {
      throw new Error('Notas devem ter no máximo 500 caracteres');
    }
  }

  /**
   * Gera recomendações baseadas na performance
   */
  private generateRecommendations(
    sets: any[],
    execution: any,
  ): {
    nextWorkoutSuggestions: string[];
    performanceNotes: string[];
  } {
    const nextWorkoutSuggestions: string[] = [];
    const performanceNotes: string[] = [];

    const completedSets = sets.filter((set) => set.isCompleted());

    if (completedSets.length === 0) {
      performanceNotes.push('Exercício não foi executado');
      return { nextWorkoutSuggestions, performanceNotes };
    }

    // Análise de performance geral
    const averageCompletion =
      completedSets.reduce((sum, set) => sum + set.getCompletionPercentage(), 0) /
      completedSets.length;

    if (averageCompletion >= 110) {
      performanceNotes.push('Excelente performance! Superou o planejado');
      nextWorkoutSuggestions.push('Considere aumentar o peso em 5-10%');
    } else if (averageCompletion >= 100) {
      performanceNotes.push('Performance perfeita! Atingiu todas as repetições');
      nextWorkoutSuggestions.push('Mantenha o peso ou aumente levemente');
    } else if (averageCompletion >= 80) {
      performanceNotes.push('Boa performance, próximo do objetivo');
      nextWorkoutSuggestions.push('Mantenha o peso atual');
    } else {
      performanceNotes.push('Performance abaixo do esperado');
      nextWorkoutSuggestions.push('Considere reduzir o peso em 5-10%');
    }

    // Análise de progressão de peso
    const weights = completedSets.map((set) => set.weight).filter((weight) => weight !== null);

    if (weights.length > 1) {
      const weightProgression = weights[weights.length - 1]! - weights[0]!;
      if (weightProgression > 0) {
        performanceNotes.push(`Progressão de peso: +${weightProgression}kg durante o exercício`);
      }
    }

    // Análise de tempo
    const totalDurationMinutes = Math.round(execution.getTotalDurationMs() / (1000 * 60));
    if (totalDurationMinutes > 15) {
      nextWorkoutSuggestions.push('Considere reduzir o tempo de descanso');
    } else if (totalDurationMinutes < 5) {
      nextWorkoutSuggestions.push('Pode aumentar o tempo de descanso se necessário');
    }

    return {
      nextWorkoutSuggestions,
      performanceNotes,
    };
  }

  /**
   * Calcula sugestão de peso para próxima série
   */
  private calculateNextSetWeight(completedSet: any, actualReps: number): number | null {
    if (!completedSet.weight) return null;

    const plannedReps = completedSet.plannedReps;
    const repsDifference = actualReps - plannedReps;

    // Se fez mais reps que o planejado, sugerir aumento de peso
    if (repsDifference >= 2) {
      return Math.round(completedSet.weight * 1.05 * 100) / 100; // +5%
    }

    // Se fez menos reps que o planejado, sugerir diminuição
    if (repsDifference <= -2) {
      return Math.round(completedSet.weight * 0.95 * 100) / 100; // -5%
    }

    // Se fez reps próximas ao planejado, manter peso
    return completedSet.weight;
  }

  /**
   * Recomenda tempo de descanso baseado na performance
   */
  private getRestTimeRecommendation(
    actualReps: number,
    plannedReps: number,
    weight?: number,
  ): string {
    const repsDifference = actualReps - plannedReps;

    // Se teve dificuldade (menos reps), recomendar mais descanso
    if (repsDifference <= -2) {
      return 'Recomendado: descanso extra (90-120s) - série desafiadora';
    }

    // Se foi fácil (mais reps), pode descansar menos
    if (repsDifference >= 2) {
      return 'Recomendado: descanso normal (45-60s) - boa performance';
    }

    // Performance normal
    if (weight && weight > 0) {
      return 'Recomendado: descanso padrão (60-90s) - peso moderado';
    }

    return 'Recomendado: descanso padrão (60s)';
  }
}
