import { Inject, Injectable } from '@nestjs/common';
import { ExerciseExecutionRepository } from '../../domain/repositories/exercise-execution.repository';
import { SetRepository } from '../../domain/repositories/set.repository';

export interface CompleteSetInput {
  userId: string;
  exerciseExecutionId: string;
  setNumber: number;
  actualReps: number;
  weight?: number;
  restTimeSeconds?: number;
  notes?: string;
}

export interface CompleteSetOutput {
  setId: string;
  setNumber: number;
  plannedReps: number;
  actualReps: number;
  weight: number | null;
  restTimeSeconds: number | null;
  completedAt: Date;
  formattedDescription: string;
  performance: {
    repsDifference: number;
    completionPercentage: number;
    volume: number;
    wasSuccessful: boolean;
  };
  executionInfo: {
    totalSets: number;
    completedSets: number;
    remainingSets: number;
    canCompleteExercise: boolean;
    nextSetNumber: number | null;
  };
  suggestions: {
    nextSetWeight: number | null;
    restTimeRecommendation: string;
  };
}

@Injectable()
export class CompleteSetUseCase {
  constructor(
    @Inject('ExerciseExecutionRepository')
    private readonly exerciseExecutionRepository: ExerciseExecutionRepository,
    @Inject('SetRepository')
    private readonly setRepository: SetRepository,
  ) {}

  async execute(input: CompleteSetInput): Promise<CompleteSetOutput> {
    const {
      userId,
      exerciseExecutionId,
      setNumber,
      actualReps,
      weight,
      restTimeSeconds,
      notes,
    } = input;

    // Validar entrada
    this.validateInput(input);

    // Buscar a execução do exercício
    const exerciseExecution = await this.exerciseExecutionRepository.findById(
      exerciseExecutionId,
    );

    if (!exerciseExecution) {
      throw new Error('Execução de exercício não encontrada');
    }

    if (!exerciseExecution.isActive()) {
      throw new Error('Não é possível completar série de uma execução inativa');
    }

    // Buscar a série específica
    const set = await this.setRepository.findByExerciseExecutionIdAndSetNumber(
      exerciseExecutionId,
      setNumber,
    );

    if (!set) {
      throw new Error(`Série ${setNumber} não encontrada`);
    }

    if (set.isCompleted()) {
      throw new Error(`Série ${setNumber} já foi completada`);
    }

    // Completar a série
    set.complete(actualReps, weight, notes, restTimeSeconds);

    // Salvar a série
    const savedSet = await this.setRepository.save(set);

    // Atualizar a execução do exercício
    exerciseExecution.updateSet(setNumber, actualReps, weight, notes);
    await this.exerciseExecutionRepository.save(exerciseExecution);

    // Calcular informações da execução
    const completedSets = exerciseExecution.getCompletedSetsCount();
    const totalSets = exerciseExecution.sets.length;
    const remainingSets = totalSets - completedSets;
    const canCompleteExercise = exerciseExecution.areAllSetsCompleted();

    // Encontrar próxima série
    const nextSet = exerciseExecution.sets.find((s) => !s.isCompleted());
    const nextSetNumber = nextSet?.setNumber || null;

    // Sugestões para próxima série
    const nextSetWeight = this.calculateNextSetWeight(savedSet, actualReps);
    const restTimeRecommendation = this.getRestTimeRecommendation(
      actualReps,
      set.plannedReps,
      weight,
    );

    // Calcular performance
    const stats = savedSet.getStats();

    return {
      setId: savedSet.id,
      setNumber: savedSet.setNumber,
      plannedReps: savedSet.plannedReps,
      actualReps: savedSet.actualReps!,
      weight: savedSet.weight,
      restTimeSeconds: savedSet.restTimeSeconds,
      completedAt: savedSet.completedAt!,
      formattedDescription: savedSet.getFormattedDescription(),
      performance: {
        repsDifference: stats.repsDifference,
        completionPercentage: stats.completionPercentage,
        volume: stats.volume,
        wasSuccessful: stats.wasSuccessful,
      },
      executionInfo: {
        totalSets,
        completedSets,
        remainingSets,
        canCompleteExercise,
        nextSetNumber,
      },
      suggestions: {
        nextSetWeight,
        restTimeRecommendation,
      },
    };
  }

  private validateInput(input: CompleteSetInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID é obrigatório');
    }

    if (
      !input.exerciseExecutionId ||
      input.exerciseExecutionId.trim().length === 0
    ) {
      throw new Error('Exercise Execution ID é obrigatório');
    }

    if (!input.setNumber || input.setNumber < 1 || input.setNumber > 20) {
      throw new Error('Número da série deve ser entre 1 e 20');
    }

    if (input.actualReps < 0 || input.actualReps > 100) {
      throw new Error('Repetições realizadas devem ser entre 0 e 100');
    }

    if (input.weight !== undefined && input.weight !== null) {
      if (input.weight < 0 || input.weight > 1000) {
        throw new Error('Peso deve ser entre 0 e 1000 kg');
      }
    }

    if (input.restTimeSeconds !== undefined && input.restTimeSeconds !== null) {
      if (input.restTimeSeconds < 0 || input.restTimeSeconds > 1800) {
        throw new Error('Tempo de descanso deve ser entre 0 e 1800 segundos');
      }
    }

    if (input.notes && input.notes.length > 200) {
      throw new Error('Notas devem ter no máximo 200 caracteres');
    }
  }

  /**
   * Calcula sugestão de peso para próxima série
   */
  private calculateNextSetWeight(
    completedSet: import('../../domain/entities/set.entity').WorkoutSet,
    actualReps: number,
  ): number | null {
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
