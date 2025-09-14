import { Injectable } from '@nestjs/common';

import { Exercise } from '../../../domain/entities/exercise.entity';
import { ExerciseRepository } from '../../../domain/repositories/exercise.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaExerciseRepository implements ExerciseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Exercise | null> {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
    });

    return exercise ? this.toDomainEntity(exercise) : null;
  }

  async findByWorkoutPlanId(workoutPlanId: string): Promise<Exercise[]> {
    const exercises = await this.prisma.exercise.findMany({
      where: { workoutPlanId },
      orderBy: { order: 'asc' },
    });

    return exercises.map((exercise: any) => this.toDomainEntity(exercise));
  }

  async countByWorkoutPlanId(workoutPlanId: string): Promise<number> {
    return this.prisma.exercise.count({
      where: { workoutPlanId },
    });
  }

  async save(exercise: Exercise): Promise<Exercise> {
    const existingExercise = await this.prisma.exercise.findUnique({
      where: { id: exercise.id },
    });

    if (existingExercise) {
      // Update existing exercise
      const updatedExercise = await this.prisma.exercise.update({
        where: { id: exercise.id },
        data: {
          name: exercise.name,
          description: exercise.description,
          targetMuscleGroup: exercise.targetMuscleGroup,
          sets: exercise.sets,
          reps: exercise.reps,
          restTimeSeconds: exercise.restTimeSeconds,
          order: exercise.order,
          updatedAt: exercise.updatedAt,
        },
      });

      return this.toDomainEntity(updatedExercise);
    } else {
      // Create new exercise
      const createdExercise = await this.prisma.exercise.create({
        data: {
          id: exercise.id,
          workoutPlanId: exercise.workoutPlanId,
          name: exercise.name,
          description: exercise.description,
          targetMuscleGroup: exercise.targetMuscleGroup,
          sets: exercise.sets,
          reps: exercise.reps,
          restTimeSeconds: exercise.restTimeSeconds,
          order: exercise.order,
          createdAt: exercise.createdAt,
          updatedAt: exercise.updatedAt,
        },
      });

      return this.toDomainEntity(createdExercise);
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.exercise.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.exercise.count({
      where: { id },
    });
    return count > 0;
  }

  async existsByWorkoutPlanIdAndName(
    workoutPlanId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean> {
    const whereClause: any = {
      workoutPlanId,
      name: {
        equals: name,
        mode: 'insensitive',
      },
    };

    if (excludeId) {
      whereClause.id = {
        not: excludeId,
      };
    }

    const count = await this.prisma.exercise.count({
      where: whereClause,
    });

    return count > 0;
  }

  async findByMuscleGroup(workoutPlanId: string, muscleGroup: string): Promise<Exercise[]> {
    const exercises = await this.prisma.exercise.findMany({
      where: {
        workoutPlanId,
        targetMuscleGroup: {
          equals: muscleGroup,
          mode: 'insensitive',
        },
      },
      orderBy: { order: 'asc' },
    });

    return exercises.map((exercise: any) => this.toDomainEntity(exercise));
  }

  async getNextOrderByWorkoutPlanId(workoutPlanId: string): Promise<number> {
    const maxOrder = await this.prisma.exercise.aggregate({
      where: { workoutPlanId },
      _max: {
        order: true,
      },
    });

    return (maxOrder._max.order || 0) + 1;
  }

  async updateOrders(exercises: { id: string; order: number }[]): Promise<void> {
    // Usar transação para garantir consistência
    await this.prisma.$transaction(
      exercises.map((exercise) =>
        this.prisma.exercise.update({
          where: { id: exercise.id },
          data: {
            order: exercise.order,
            updatedAt: new Date(),
          },
        }),
      ),
    );
  }

  /**
   * Converte entidade Prisma para entidade de domínio
   */
  private toDomainEntity(prismaEntity: any): Exercise {
    return new Exercise(
      prismaEntity.id,
      prismaEntity.workoutPlanId,
      prismaEntity.name,
      prismaEntity.description,
      prismaEntity.targetMuscleGroup,
      prismaEntity.sets,
      prismaEntity.reps,
      prismaEntity.restTimeSeconds,
      prismaEntity.order,
      prismaEntity.createdAt,
      prismaEntity.updatedAt,
    );
  }
}
