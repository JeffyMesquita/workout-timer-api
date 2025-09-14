import { Injectable } from '@nestjs/common';

import { Exercise } from '../../../domain/entities/exercise.entity';
import { WorkoutPlan } from '../../../domain/entities/workout-plan.entity';
import { WorkoutPlanRepository } from '../../../domain/repositories/workout-plan.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaWorkoutPlanRepository implements WorkoutPlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<WorkoutPlan | null> {
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return plan ? this.toDomainEntity(plan) : null;
  }

  async findByIdAndUserId(id: string, userId: string): Promise<WorkoutPlan | null> {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return plan ? this.toDomainEntity(plan) : null;
  }

  async findByUserId(userId: string): Promise<WorkoutPlan[]> {
    const plans = await this.prisma.workoutPlan.findMany({
      where: { userId },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return plans.map((plan: any) => this.toDomainEntity(plan));
  }

  async findActiveByUserId(userId: string): Promise<WorkoutPlan[]> {
    const plans = await this.prisma.workoutPlan.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return plans.map((plan: any) => this.toDomainEntity(plan));
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.workoutPlan.count({
      where: { userId },
    });
  }

  async countActiveByUserId(userId: string): Promise<number> {
    return this.prisma.workoutPlan.count({
      where: {
        userId,
        isActive: true,
      },
    });
  }

  async save(workoutPlan: WorkoutPlan): Promise<WorkoutPlan> {
    const existingPlan = await this.prisma.workoutPlan.findUnique({
      where: { id: workoutPlan.id },
    });

    if (existingPlan) {
      // Update existing plan
      const updatedPlan = await this.prisma.workoutPlan.update({
        where: { id: workoutPlan.id },
        data: {
          name: workoutPlan.name,
          description: workoutPlan.description,
          isActive: workoutPlan.isActive,
          updatedAt: workoutPlan.updatedAt,
        },
        include: {
          exercises: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return this.toDomainEntity(updatedPlan);
    } else {
      // Create new plan
      const createdPlan = await this.prisma.workoutPlan.create({
        data: {
          id: workoutPlan.id,
          userId: workoutPlan.userId,
          name: workoutPlan.name,
          description: workoutPlan.description,
          isActive: workoutPlan.isActive,
          createdAt: workoutPlan.createdAt,
          updatedAt: workoutPlan.updatedAt,
        },
        include: {
          exercises: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return this.toDomainEntity(createdPlan);
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workoutPlan.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.workoutPlan.count({
      where: { id },
    });
    return count > 0;
  }

  async existsByUserIdAndName(userId: string, name: string, excludeId?: string): Promise<boolean> {
    const whereClause: any = {
      userId,
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

    const count = await this.prisma.workoutPlan.count({
      where: whereClause,
    });

    return count > 0;
  }

  async findByUserIdWithPagination(
    userId: string,
    page: number,
    limit: number,
    includeInactive: boolean = false,
  ): Promise<{
    plans: WorkoutPlan[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const whereClause: any = { userId };

    if (!includeInactive) {
      whereClause.isActive = true;
    }

    const [plans, total] = await Promise.all([
      this.prisma.workoutPlan.findMany({
        where: whereClause,
        include: {
          exercises: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.workoutPlan.count({
        where: whereClause,
      }),
    ]);

    return {
      plans: plans.map((plan: any) => this.toDomainEntity(plan)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async searchByName(userId: string, searchTerm: string): Promise<WorkoutPlan[]> {
    const plans = await this.prisma.workoutPlan.findMany({
      where: {
        userId,
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
        isActive: true,
      },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return plans.map((plan: any) => this.toDomainEntity(plan));
  }

  /**
   * Converte entidade Prisma para entidade de domínio
   */
  private toDomainEntity(prismaEntity: any): WorkoutPlan {
    const exercises =
      prismaEntity.exercises?.map(
        (exercise: any) =>
          new Exercise(
            exercise.id,
            exercise.workoutPlanId,
            exercise.name,
            exercise.description,
            exercise.targetMuscleGroup,
            exercise.sets,
            exercise.reps,
            exercise.restTimeSeconds,
            exercise.order,
            exercise.createdAt,
            exercise.updatedAt,
          ),
      ) || [];

    return new WorkoutPlan(
      prismaEntity.id,
      prismaEntity.userId,
      prismaEntity.name,
      prismaEntity.description,
      prismaEntity.isActive,
      prismaEntity.createdAt,
      prismaEntity.updatedAt,
      exercises,
    );
  }
}
