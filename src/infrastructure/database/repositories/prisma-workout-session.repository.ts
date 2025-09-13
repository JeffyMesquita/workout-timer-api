import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WorkoutSessionRepository } from '../../../domain/repositories/workout-session.repository';
import { WorkoutSession } from '../../../domain/entities/workout-session.entity';

@Injectable()
export class PrismaWorkoutSessionRepository
  implements WorkoutSessionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<WorkoutSession | null> {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id },
    });

    return session ? this.toDomainEntity(session) : null;
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<WorkoutSession | null> {
    const session = await this.prisma.workoutSession.findFirst({
      where: {
        id,
        userId,
      },
    });

    return session ? this.toDomainEntity(session) : null;
  }

  async findByUserId(userId: string): Promise<WorkoutSession[]> {
    const sessions = await this.prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
    });

    return sessions.map((session) => this.toDomainEntity(session));
  }

  async findActiveByUserId(userId: string): Promise<WorkoutSession | null> {
    const session = await this.prisma.workoutSession.findFirst({
      where: {
        userId,
        status: {
          in: ['IN_PROGRESS', 'PAUSED'],
        },
      },
    });

    return session ? this.toDomainEntity(session) : null;
  }

  async findByWorkoutPlanId(workoutPlanId: string): Promise<WorkoutSession[]> {
    const sessions = await this.prisma.workoutSession.findMany({
      where: { workoutPlanId },
      orderBy: { startedAt: 'desc' },
    });

    return sessions.map((session) => this.toDomainEntity(session));
  }

  async findByUserIdWithPagination(
    userId: string,
    page: number,
    limit: number,
    status?: string[],
  ): Promise<{
    sessions: WorkoutSession[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const whereClause: any = { userId };

    if (status && status.length > 0) {
      whereClause.status = {
        in: status,
      };
    }

    const [sessions, total] = await Promise.all([
      this.prisma.workoutSession.findMany({
        where: whereClause,
        orderBy: { startedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.workoutSession.count({
        where: whereClause,
      }),
    ]);

    return {
      sessions: sessions.map((session) => this.toDomainEntity(session)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async countByUserIdAndStatus(
    userId: string,
    status: string,
  ): Promise<number> {
    return this.prisma.workoutSession.count({
      where: {
        userId,
        status: status as any, // Cast para resolver problema de tipos do Prisma
      },
    });
  }

  async save(session: WorkoutSession): Promise<WorkoutSession> {
    const existingSession = await this.prisma.workoutSession.findUnique({
      where: { id: session.id },
    });

    if (existingSession) {
      // Update existing session
      const updatedSession = await this.prisma.workoutSession.update({
        where: { id: session.id },
        data: {
          status: session.status,
          pausedAt: session.pausedAt,
          resumedAt: session.resumedAt,
          completedAt: session.completedAt,
          cancelledAt: session.cancelledAt,
          totalDurationMs: session.totalDurationMs,
          notes: session.notes,
          updatedAt: session.updatedAt,
        },
      });

      return this.toDomainEntity(updatedSession);
    } else {
      // Create new session
      const createdSession = await this.prisma.workoutSession.create({
        data: {
          id: session.id,
          userId: session.userId,
          workoutPlanId: session.workoutPlanId,
          status: session.status,
          startedAt: session.startedAt,
          pausedAt: session.pausedAt,
          resumedAt: session.resumedAt,
          completedAt: session.completedAt,
          cancelledAt: session.cancelledAt,
          totalDurationMs: session.totalDurationMs,
          notes: session.notes,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        },
      });

      return this.toDomainEntity(createdSession);
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workoutSession.delete({
      where: { id },
    });
  }

  async hasActiveSession(userId: string): Promise<boolean> {
    const count = await this.prisma.workoutSession.count({
      where: {
        userId,
        status: {
          in: ['IN_PROGRESS', 'PAUSED'],
        },
      },
    });

    return count > 0;
  }

  async findLastByWorkoutPlanId(
    workoutPlanId: string,
  ): Promise<WorkoutSession | null> {
    const session = await this.prisma.workoutSession.findFirst({
      where: { workoutPlanId },
      orderBy: { startedAt: 'desc' },
    });

    return session ? this.toDomainEntity(session) : null;
  }

  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<WorkoutSession[]> {
    const sessions = await this.prisma.workoutSession.findMany({
      where: {
        userId,
        startedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    return sessions.map((session) => this.toDomainEntity(session));
  }

  async getSessionStats(userId: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    averageDurationMinutes: number;
    totalWorkoutTimeMinutes: number;
  }> {
    const [totalSessions, completedSessions, cancelledSessions, avgDuration] =
      await Promise.all([
        this.prisma.workoutSession.count({ where: { userId } }),
        this.prisma.workoutSession.count({
          where: { userId, status: 'COMPLETED' },
        }),
        this.prisma.workoutSession.count({
          where: { userId, status: 'CANCELLED' },
        }),
        this.prisma.workoutSession.aggregate({
          where: {
            userId,
            status: 'COMPLETED',
            totalDurationMs: { not: null },
          },
          _avg: {
            totalDurationMs: true,
          },
          _sum: {
            totalDurationMs: true,
          },
        }),
      ]);

    const averageDurationMinutes = avgDuration._avg.totalDurationMs
      ? Math.round(avgDuration._avg.totalDurationMs / (1000 * 60))
      : 0;

    const totalWorkoutTimeMinutes = avgDuration._sum.totalDurationMs
      ? Math.round(avgDuration._sum.totalDurationMs / (1000 * 60))
      : 0;

    return {
      totalSessions,
      completedSessions,
      cancelledSessions,
      averageDurationMinutes,
      totalWorkoutTimeMinutes,
    };
  }

  /**
   * Converte entidade Prisma para entidade de domínio
   */
  private toDomainEntity(prismaEntity: any): WorkoutSession {
    return new WorkoutSession(
      prismaEntity.id,
      prismaEntity.userId,
      prismaEntity.workoutPlanId,
      prismaEntity.status,
      prismaEntity.startedAt,
      prismaEntity.pausedAt,
      prismaEntity.resumedAt,
      prismaEntity.completedAt,
      prismaEntity.cancelledAt,
      prismaEntity.totalDurationMs,
      prismaEntity.notes,
      prismaEntity.createdAt,
      prismaEntity.updatedAt,
    );
  }
}
