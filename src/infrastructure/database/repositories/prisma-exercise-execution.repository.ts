import { Injectable } from '@nestjs/common';

import { ExerciseExecution } from '../../../domain/entities/exercise-execution.entity';
import { WorkoutSet } from '../../../domain/entities/set.entity';
import { ExerciseExecutionRepository } from '../../../domain/repositories/exercise-execution.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaExerciseExecutionRepository implements ExerciseExecutionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ExerciseExecution | null> {
    const execution = await this.prisma.exerciseExecution.findUnique({
      where: { id },
      include: {
        sets: {
          orderBy: { setNumber: 'asc' },
        },
      },
    });

    return execution ? this.toDomainEntity(execution) : null;
  }

  async findByWorkoutSessionId(workoutSessionId: string): Promise<ExerciseExecution[]> {
    const executions = await this.prisma.exerciseExecution.findMany({
      where: { workoutSessionId },
      include: {
        sets: {
          orderBy: { setNumber: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return executions.map((execution) => this.toDomainEntity(execution));
  }

  async findByWorkoutSessionIdAndExerciseId(
    workoutSessionId: string,
    exerciseId: string,
  ): Promise<ExerciseExecution | null> {
    const execution = await this.prisma.exerciseExecution.findFirst({
      where: {
        workoutSessionId,
        exerciseId,
      },
      include: {
        sets: {
          orderBy: { setNumber: 'asc' },
        },
      },
    });

    return execution ? this.toDomainEntity(execution) : null;
  }

  async findByExerciseId(exerciseId: string): Promise<ExerciseExecution[]> {
    const executions = await this.prisma.exerciseExecution.findMany({
      where: { exerciseId },
      include: {
        sets: {
          orderBy: { setNumber: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return executions.map((execution) => this.toDomainEntity(execution));
  }

  async findActiveByWorkoutSessionId(workoutSessionId: string): Promise<ExerciseExecution[]> {
    const executions = await this.prisma.exerciseExecution.findMany({
      where: {
        workoutSessionId,
        status: 'IN_PROGRESS',
      },
      include: {
        sets: {
          orderBy: { setNumber: 'asc' },
        },
      },
    });

    return executions.map((execution) => this.toDomainEntity(execution));
  }

  async save(execution: ExerciseExecution): Promise<ExerciseExecution> {
    const existingExecution = await this.prisma.exerciseExecution.findUnique({
      where: { id: execution.id },
    });

    if (existingExecution) {
      // Update existing execution
      const updatedExecution = await this.prisma.exerciseExecution.update({
        where: { id: execution.id },
        data: {
          status: execution.status,
          startedAt: execution.startedAt,
          completedAt: execution.completedAt,
          notes: execution.notes,
          updatedAt: execution.updatedAt,
        },
        include: {
          sets: {
            orderBy: { setNumber: 'asc' },
          },
        },
      });

      return this.toDomainEntity(updatedExecution);
    } else {
      // Create new execution
      const createdExecution = await this.prisma.exerciseExecution.create({
        data: {
          id: execution.id,
          workoutSessionId: execution.workoutSessionId,
          exerciseId: execution.exerciseId,
          status: execution.status,
          startedAt: execution.startedAt,
          completedAt: execution.completedAt,
          notes: execution.notes,
          createdAt: execution.createdAt,
          updatedAt: execution.updatedAt,
        },
        include: {
          sets: {
            orderBy: { setNumber: 'asc' },
          },
        },
      });

      return this.toDomainEntity(createdExecution);
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.exerciseExecution.delete({
      where: { id },
    });
  }

  async countByWorkoutSessionIdAndStatus(
    workoutSessionId: string,
    status: string,
  ): Promise<number> {
    return this.prisma.exerciseExecution.count({
      where: {
        workoutSessionId,
        status: status as any,
      },
    });
  }

  async findLastByExerciseId(exerciseId: string): Promise<ExerciseExecution | null> {
    const execution = await this.prisma.exerciseExecution.findFirst({
      where: {
        exerciseId,
        status: 'COMPLETED',
      },
      include: {
        sets: {
          orderBy: { setNumber: 'asc' },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    return execution ? this.toDomainEntity(execution) : null;
  }

  async findByExerciseIdWithPagination(
    exerciseId: string,
    page: number,
    limit: number,
  ): Promise<{
    executions: ExerciseExecution[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [executions, total] = await Promise.all([
      this.prisma.exerciseExecution.findMany({
        where: { exerciseId },
        include: {
          sets: {
            orderBy: { setNumber: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.exerciseExecution.count({
        where: { exerciseId },
      }),
    ]);

    return {
      executions: executions.map((execution) => this.toDomainEntity(execution)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getExerciseStats(exerciseId: string): Promise<{
    totalExecutions: number;
    completedExecutions: number;
    averageReps: number;
    maxWeight: number | null;
    averageWeight: number | null;
    bestPerformance: {
      maxReps: number;
      maxWeight: number | null;
      date: Date;
    } | null;
  }> {
    const [totalExecutions, completedExecutions, setStats] = await Promise.all([
      this.prisma.exerciseExecution.count({
        where: { exerciseId },
      }),
      this.prisma.exerciseExecution.count({
        where: {
          exerciseId,
          status: 'COMPLETED',
        },
      }),
      this.prisma.set.aggregate({
        where: {
          exerciseExecution: {
            exerciseId,
            status: 'COMPLETED',
          },
          actualReps: { not: null },
        },
        _avg: {
          actualReps: true,
          weight: true,
        },
        _max: {
          actualReps: true,
          weight: true,
        },
      }),
    ]);

    // Buscar melhor performance
    const bestPerformanceSet = await this.prisma.set.findFirst({
      where: {
        exerciseExecution: {
          exerciseId,
          status: 'COMPLETED',
        },
        actualReps: { not: null },
      },
      include: {
        exerciseExecution: true,
      },
      orderBy: [{ weight: 'desc' }, { actualReps: 'desc' }],
    });

    const bestPerformance = bestPerformanceSet
      ? {
          maxReps: bestPerformanceSet.actualReps || 0,
          maxWeight: bestPerformanceSet.weight,
          date: bestPerformanceSet.exerciseExecution.completedAt || bestPerformanceSet.createdAt,
        }
      : null;

    return {
      totalExecutions,
      completedExecutions,
      averageReps: Math.round(setStats._avg.actualReps || 0),
      maxWeight: setStats._max.weight,
      averageWeight: setStats._avg.weight ? Math.round(setStats._avg.weight * 100) / 100 : null,
      bestPerformance,
    };
  }

  /**
   * Converte entidade Prisma para entidade de domínio
   */
  private toDomainEntity(prismaEntity: any): ExerciseExecution {
    const sets =
      prismaEntity.sets?.map(
        (set: any) =>
          new WorkoutSet(
            set.id,
            set.exerciseExecutionId,
            set.setNumber,
            set.plannedReps,
            set.actualReps,
            set.weight,
            set.restTimeSeconds,
            set.completedAt,
            set.notes,
            set.createdAt,
            set.updatedAt,
          ),
      ) || [];

    return new ExerciseExecution(
      prismaEntity.id,
      prismaEntity.workoutSessionId,
      prismaEntity.exerciseId,
      prismaEntity.status,
      prismaEntity.startedAt,
      prismaEntity.completedAt,
      prismaEntity.notes,
      prismaEntity.createdAt,
      prismaEntity.updatedAt,
      sets,
    );
  }
}
