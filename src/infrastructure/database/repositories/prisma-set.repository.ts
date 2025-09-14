import { Injectable } from '@nestjs/common';

import { WorkoutSet } from '../../../domain/entities/set.entity';
import { SetRepository } from '../../../domain/repositories/set.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaSetRepository implements SetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<WorkoutSet | null> {
    const set = await this.prisma.set.findUnique({
      where: { id },
    });

    return set ? this.toDomainEntity(set) : null;
  }

  async findByExerciseExecutionId(exerciseExecutionId: string): Promise<WorkoutSet[]> {
    const sets = await this.prisma.set.findMany({
      where: { exerciseExecutionId },
      orderBy: { setNumber: 'asc' },
    });

    return sets.map((set: any) => this.toDomainEntity(set));
  }

  async findByExerciseExecutionIdAndSetNumber(
    exerciseExecutionId: string,
    setNumber: number,
  ): Promise<WorkoutSet | null> {
    const set = await this.prisma.set.findFirst({
      where: {
        exerciseExecutionId,
        setNumber,
      },
    });

    return set ? this.toDomainEntity(set) : null;
  }

  async save(set: WorkoutSet): Promise<WorkoutSet> {
    const existingSet = await this.prisma.set.findUnique({
      where: { id: set.id },
    });

    if (existingSet) {
      // Update existing set
      const updatedSet = await this.prisma.set.update({
        where: { id: set.id },
        data: {
          actualReps: set.actualReps,
          weight: set.weight,
          restTimeSeconds: set.restTimeSeconds,
          completedAt: set.completedAt,
          notes: set.notes,
          updatedAt: set.updatedAt,
        },
      });

      return this.toDomainEntity(updatedSet);
    } else {
      // Create new set
      const createdSet = await this.prisma.set.create({
        data: {
          id: set.id,
          exerciseExecutionId: set.exerciseExecutionId,
          setNumber: set.setNumber,
          plannedReps: set.plannedReps,
          actualReps: set.actualReps,
          weight: set.weight,
          restTimeSeconds: set.restTimeSeconds,
          completedAt: set.completedAt,
          notes: set.notes,
          createdAt: set.createdAt,
          updatedAt: set.updatedAt,
        },
      });

      return this.toDomainEntity(createdSet);
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.set.delete({
      where: { id },
    });
  }

  async countCompletedByExerciseExecutionId(exerciseExecutionId: string): Promise<number> {
    return this.prisma.set.count({
      where: {
        exerciseExecutionId,
        completedAt: { not: null },
      },
    });
  }

  async findByWeightRange(
    exerciseExecutionId: string,
    minWeight: number,
    maxWeight: number,
  ): Promise<WorkoutSet[]> {
    const sets = await this.prisma.set.findMany({
      where: {
        exerciseExecutionId,
        weight: {
          gte: minWeight,
          lte: maxWeight,
        },
      },
      orderBy: { setNumber: 'asc' },
    });

    return sets.map((set: any) => this.toDomainEntity(set));
  }

  async findLastByExerciseId(exerciseId: string): Promise<WorkoutSet | null> {
    const set = await this.prisma.set.findFirst({
      where: {
        exerciseExecution: {
          exerciseId,
          status: 'COMPLETED',
        },
        completedAt: { not: null },
      },
      orderBy: {
        exerciseExecution: {
          completedAt: 'desc',
        },
      },
    });

    return set ? this.toDomainEntity(set) : null;
  }

  async getSetStatsForExercise(exerciseId: string): Promise<{
    totalSets: number;
    completedSets: number;
    averageReps: number;
    averageWeight: number | null;
    maxWeight: number | null;
    totalVolume: number;
    progressionData: {
      date: Date;
      weight: number | null;
      reps: number;
      volume: number;
    }[];
  }> {
    const [counts, stats, progressionSets] = await Promise.all([
      this.prisma.set.groupBy({
        by: ['exerciseExecutionId'],
        where: {
          exerciseExecution: { exerciseId },
        },
        _count: {
          id: true,
        },
      }),
      this.prisma.set.aggregate({
        where: {
          exerciseExecution: {
            exerciseId,
            status: 'COMPLETED',
          },
          completedAt: { not: null },
        },
        _avg: {
          actualReps: true,
          weight: true,
        },
        _max: {
          weight: true,
        },
        _sum: {
          actualReps: true,
        },
      }),
      this.prisma.set.findMany({
        where: {
          exerciseExecution: {
            exerciseId,
            status: 'COMPLETED',
          },
          completedAt: { not: null },
        },
        include: {
          exerciseExecution: true,
        },
        orderBy: {
          exerciseExecution: {
            completedAt: 'asc',
          },
        },
      }),
    ]);

    const totalSets = counts.reduce((sum: any, group: any) => sum + group._count.id, 0);
    const completedSets = await this.prisma.set.count({
      where: {
        exerciseExecution: { exerciseId },
        completedAt: { not: null },
      },
    });

    // Calcular volume total
    const totalVolume = progressionSets.reduce(
      (sum: any, set: any) => sum + (set.weight || 0) * (set.actualReps || 0),
      0,
    );

    // Preparar dados de progressão
    const progressionData = progressionSets.map((set: any) => ({
      date: set.exerciseExecution.completedAt || set.createdAt,
      weight: set.weight,
      reps: set.actualReps || 0,
      volume: (set.weight || 0) * (set.actualReps || 0),
    }));

    return {
      totalSets,
      completedSets,
      averageReps: Math.round(stats._avg.actualReps || 0),
      averageWeight: stats._avg.weight ? Math.round(stats._avg.weight * 100) / 100 : null,
      maxWeight: stats._max.weight,
      totalVolume,
      progressionData,
    };
  }

  async getWeightProgression(
    exerciseId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<
    {
      date: Date;
      weight: number | null;
      reps: number;
      volume: number;
      sessionId: string;
    }[]
  > {
    const whereClause: any = {
      exerciseExecution: {
        exerciseId,
        status: 'COMPLETED',
      },
      completedAt: { not: null },
    };

    if (startDate || endDate) {
      whereClause.exerciseExecution.completedAt = {};
      if (startDate) whereClause.exerciseExecution.completedAt.gte = startDate;
      if (endDate) whereClause.exerciseExecution.completedAt.lte = endDate;
    }

    const sets = await this.prisma.set.findMany({
      where: whereClause,
      include: {
        exerciseExecution: {
          include: {
            workoutSession: true,
          },
        },
      },
      orderBy: {
        exerciseExecution: {
          completedAt: 'asc',
        },
      },
    });

    return sets.map((set: any) => ({
      date: set.exerciseExecution.completedAt || set.createdAt,
      weight: set.weight,
      reps: set.actualReps || 0,
      volume: (set.weight || 0) * (set.actualReps || 0),
      sessionId: set.exerciseExecution.workoutSessionId,
    }));
  }

  async saveMany(sets: WorkoutSet[]): Promise<WorkoutSet[]> {
    const savedSets: WorkoutSet[] = [];

    // Usar transação para garantir consistência
    await this.prisma.$transaction(async (tx: any) => {
      for (const set of sets) {
        const savedSet = await tx.set.create({
          data: {
            id: set.id,
            exerciseExecutionId: set.exerciseExecutionId,
            setNumber: set.setNumber,
            plannedReps: set.plannedReps,
            actualReps: set.actualReps,
            weight: set.weight,
            restTimeSeconds: set.restTimeSeconds,
            completedAt: set.completedAt,
            notes: set.notes,
            createdAt: set.createdAt,
            updatedAt: set.updatedAt,
          },
        });
        savedSets.push(this.toDomainEntity(savedSet));
      }
    });

    return savedSets;
  }

  async deleteByExerciseExecutionId(exerciseExecutionId: string): Promise<void> {
    await this.prisma.set.deleteMany({
      where: { exerciseExecutionId },
    });
  }

  /**
   * Converte entidade Prisma para entidade de domínio
   */
  private toDomainEntity(prismaEntity: any): WorkoutSet {
    return new WorkoutSet(
      prismaEntity.id,
      prismaEntity.exerciseExecutionId,
      prismaEntity.setNumber,
      prismaEntity.plannedReps,
      prismaEntity.actualReps,
      prismaEntity.weight,
      prismaEntity.restTimeSeconds,
      prismaEntity.completedAt,
      prismaEntity.notes,
      prismaEntity.createdAt,
      prismaEntity.updatedAt,
    );
  }
}
