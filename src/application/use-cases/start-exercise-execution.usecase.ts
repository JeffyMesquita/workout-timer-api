import { Inject, Injectable } from '@nestjs/common';
import { WorkoutSessionRepository } from '../../domain/repositories/workout-session.repository';
import { ExerciseExecutionRepository } from '../../domain/repositories/exercise-execution.repository';
import { SetRepository } from '../../domain/repositories/set.repository';
import { WorkoutPlanRepository } from '../../domain/repositories/workout-plan.repository';
import { ExerciseExecution } from '../../domain/entities/exercise-execution.entity';
import { WorkoutSet } from '../../domain/entities/set.entity';

export interface StartExerciseExecutionInput {
  userId: string;
  workoutSessionId: string;
  exerciseId: string;
  startingWeight?: number;
}

export interface SetInfo {
  id: string;
  setNumber: number;
  plannedReps: number;
  actualReps: number | null;
  weight: number | null;
  isCompleted: boolean;
  formattedDescription: string;
}

export interface StartExerciseExecutionOutput {
  id: string;
  exerciseId: string;
  status: string;
  startedAt: Date;
  exercise: {
    id: string;
    name: string;
    description: string | null;
    targetMuscleGroup: string | null;
    sets: number;
    reps: number;
    restTimeSeconds: number;
  };
  sets: SetInfo[];
  suggestions: {
    recommendedWeight: number | null;
    lastWeight: number | null;
    lastReps: number | null;
  };
  executionInfo: {
    canComplete: boolean;
    canSkip: boolean;
    totalSets: number;
    completedSets: number;
  };
}

@Injectable()
export class StartExerciseExecutionUseCase {
  constructor(
    @Inject('WorkoutSessionRepository')
    private readonly workoutSessionRepository: WorkoutSessionRepository,
    @Inject('ExerciseExecutionRepository')
    private readonly exerciseExecutionRepository: ExerciseExecutionRepository,
    @Inject('SetRepository')
    private readonly setRepository: SetRepository,
    @Inject('WorkoutPlanRepository')
    private readonly workoutPlanRepository: WorkoutPlanRepository,
  ) {}

  async execute(
    input: StartExerciseExecutionInput,
  ): Promise<StartExerciseExecutionOutput> {
    const { userId, workoutSessionId, exerciseId, startingWeight } = input;

    // Validar entrada
    this.validateInput(input);

    // Verificar se a sessão existe e pertence ao usuário
    const workoutSession =
      await this.workoutSessionRepository.findByIdAndUserId(
        workoutSessionId,
        userId,
      );

    if (!workoutSession) {
      throw new Error('Sessão de treino não encontrada');
    }

    if (!workoutSession.isActive()) {
      throw new Error('Não é possível iniciar exercício em uma sessão inativa');
    }

    // Buscar o plano de treino para obter informações do exercício
    const workoutPlan = await this.workoutPlanRepository.findById(
      workoutSession.workoutPlanId,
    );

    if (!workoutPlan) {
      throw new Error('Plano de treino não encontrado');
    }

    const exercise = workoutPlan.exercises.find((ex) => ex.id === exerciseId);
    if (!exercise) {
      throw new Error('Exercício não encontrado no plano de treino');
    }

    // Verificar se já existe execução para este exercício nesta sessão
    const existingExecution =
      await this.exerciseExecutionRepository.findByWorkoutSessionIdAndExerciseId(
        workoutSessionId,
        exerciseId,
      );

    if (existingExecution) {
      throw new Error('Exercício já foi iniciado nesta sessão');
    }

    // Buscar sugestões de peso baseadas no histórico
    const lastSet = await this.setRepository.findLastByExerciseId(exerciseId);
    const recommendedWeight = startingWeight || lastSet?.weight || null;

    // Criar a execução do exercício
    const exerciseExecution = new ExerciseExecution(
      this.generateId(),
      workoutSessionId,
      exerciseId,
      'NOT_STARTED',
      null,
      null,
      null,
      new Date(),
      new Date(),
      [],
    );

    // Iniciar a execução
    exerciseExecution.start();

    // Criar as séries planejadas
    const sets: WorkoutSet[] = [];
    for (let i = 1; i <= exercise.sets; i++) {
      const set = new WorkoutSet(
        this.generateId(),
        exerciseExecution.id,
        i,
        exercise.reps,
        null,
        recommendedWeight,
        null,
        null,
        null,
        new Date(),
        new Date(),
      );
      sets.push(set);
      exerciseExecution.addSet(set);
    }

    // Salvar a execução
    const savedExecution = await this.exerciseExecutionRepository.save(
      exerciseExecution,
    );

    // Salvar as séries
    await this.setRepository.saveMany(sets);

    // Preparar resposta
    const setInfos: SetInfo[] = sets.map((set) => ({
      id: set.id,
      setNumber: set.setNumber,
      plannedReps: set.plannedReps,
      actualReps: set.actualReps,
      weight: set.weight,
      isCompleted: set.isCompleted(),
      formattedDescription: set.getFormattedDescription(),
    }));

    return {
      id: savedExecution.id,
      exerciseId: exercise.id,
      status: savedExecution.status,
      startedAt: savedExecution.startedAt!,
      exercise: {
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        targetMuscleGroup: exercise.targetMuscleGroup,
        sets: exercise.sets,
        reps: exercise.reps,
        restTimeSeconds: exercise.restTimeSeconds,
      },
      sets: setInfos,
      suggestions: {
        recommendedWeight,
        lastWeight: lastSet?.weight || null,
        lastReps: lastSet?.actualReps || null,
      },
      executionInfo: {
        canComplete: savedExecution.canBeCompleted(),
        canSkip: savedExecution.canBeSkipped(),
        totalSets: sets.length,
        completedSets: savedExecution.getCompletedSetsCount(),
      },
    };
  }

  private validateInput(input: StartExerciseExecutionInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID é obrigatório');
    }

    if (!input.workoutSessionId || input.workoutSessionId.trim().length === 0) {
      throw new Error('Workout Session ID é obrigatório');
    }

    if (!input.exerciseId || input.exerciseId.trim().length === 0) {
      throw new Error('Exercise ID é obrigatório');
    }

    if (input.startingWeight !== undefined && input.startingWeight !== null) {
      if (input.startingWeight < 0 || input.startingWeight > 1000) {
        throw new Error('Peso inicial deve ser entre 0 e 1000 kg');
      }
    }
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}
