import { Inject, Injectable } from '@nestjs/common';

import { ExerciseRepository } from '../../domain/repositories/exercise.repository';
import { WorkoutPlanRepository } from '../../domain/repositories/workout-plan.repository';

export interface ListExercisesByPlanInput {
  userId: string;
  workoutPlanId: string;
}

export interface ExerciseListItem {
  id: string;
  name: string;
  description: string | null;
  targetMuscleGroup: string | null;
  sets: number;
  reps: number;
  restTimeSeconds: number;
  order: number;
  estimatedDurationSeconds: number;
  formattedDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListExercisesByPlanOutput {
  exercises: ExerciseListItem[];
  planInfo: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    totalExercises: number;
    estimatedTotalDurationMinutes: number;
  };
  summary: {
    totalSets: number;
    averageRestTime: number;
    muscleGroups: string[];
  };
}

@Injectable()
export class ListExercisesByPlanUseCase {
  constructor(
    @Inject('WorkoutPlanRepository')
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    @Inject('ExerciseRepository')
    private readonly exerciseRepository: ExerciseRepository,
  ) {}

  async execute(input: ListExercisesByPlanInput): Promise<ListExercisesByPlanOutput> {
    const { userId, workoutPlanId } = input;

    // Validar entrada
    this.validateInput(input);

    // Verificar se o plano existe e pertence ao usuário
    const workoutPlan = await this.workoutPlanRepository.findByIdAndUserId(workoutPlanId, userId);

    if (!workoutPlan) {
      throw new Error('Plano de treino não encontrado');
    }

    // Buscar exercícios do plano
    const exercises = await this.exerciseRepository.findByWorkoutPlanId(workoutPlanId);

    // Converter para formato de lista
    const exerciseList: ExerciseListItem[] = exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      targetMuscleGroup: exercise.targetMuscleGroup,
      sets: exercise.sets,
      reps: exercise.reps,
      restTimeSeconds: exercise.restTimeSeconds,
      order: exercise.order,
      estimatedDurationSeconds: exercise.getEstimatedDurationSeconds(),
      formattedDescription: exercise.getFormattedDescription(),
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
    }));

    // Calcular estatísticas
    const totalSets = exercises.reduce((total, ex) => total + ex.sets, 0);
    const averageRestTime =
      exercises.length > 0
        ? Math.round(
            exercises.reduce((total, ex) => total + ex.restTimeSeconds, 0) / exercises.length,
          )
        : 0;

    const muscleGroups = [
      ...new Set(exercises.map((ex) => ex.targetMuscleGroup).filter((group) => group !== null)),
    ].sort();

    const totalDurationSeconds = exercises.reduce(
      (total, ex) => total + ex.getEstimatedDurationSeconds(),
      0,
    );

    return {
      exercises: exerciseList,
      planInfo: {
        id: workoutPlan.id,
        name: workoutPlan.name,
        description: workoutPlan.description,
        isActive: workoutPlan.isActive,
        totalExercises: exercises.length,
        estimatedTotalDurationMinutes: Math.ceil(totalDurationSeconds / 60),
      },
      summary: {
        totalSets,
        averageRestTime,
        muscleGroups,
      },
    };
  }

  private validateInput(input: ListExercisesByPlanInput): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('User ID é obrigatório');
    }

    if (!input.workoutPlanId || input.workoutPlanId.trim().length === 0) {
      throw new Error('Workout Plan ID é obrigatório');
    }
  }
}
