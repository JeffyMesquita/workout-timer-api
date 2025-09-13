import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './infrastructure/database/prisma.service';
import { SubscriptionController } from './presentation/subscription.controller';
import { AuthController } from './presentation/auth.controller';
import { WorkoutPlanController } from './presentation/workout-plan.controller';
import { GooglePlayClient } from './infrastructure/google-play/google-play.client';
import { GooglePlayService } from './infrastructure/google-play/google-play.service';
import { JwtServiceLocal } from './infrastructure/auth/jwt.service';
import { GoogleIdTokenVerifier } from './infrastructure/auth/google.strategy';
import { AppleIdTokenVerifier } from './infrastructure/auth/apple.strategy';
import { PrismaSubscriptionRepository } from './infrastructure/database/repositories/prisma-subscription.repository';
import { PrismaWorkoutPlanRepository } from './infrastructure/database/repositories/prisma-workout-plan.repository';
import { ActivateSubscriptionUseCase } from './application/use-cases/activate-subscription.usecase';
import { RestoreSubscriptionUseCase } from './application/use-cases/restore-subscription.usecase';
import { CheckPremiumStatusUseCase } from './application/use-cases/check-premium-status.usecase';
import { CreateWorkoutPlanUseCase } from './application/use-cases/create-workout-plan.usecase';
import { ListWorkoutPlansUseCase } from './application/use-cases/list-workout-plans.usecase';
import { GetWorkoutPlanByIdUseCase } from './application/use-cases/get-workout-plan-by-id.usecase';
import { UpdateWorkoutPlanUseCase } from './application/use-cases/update-workout-plan.usecase';
import { DeleteWorkoutPlanUseCase } from './application/use-cases/delete-workout-plan.usecase';
import { AddExerciseToWorkoutPlanUseCase } from './application/use-cases/add-exercise-to-workout-plan.usecase';
import { PrismaExerciseRepository } from './infrastructure/database/repositories/prisma-exercise.repository';
import { WorkoutLimitServiceImpl } from './domain/services/workout-limit.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ScheduleModule.forRoot()],
  controllers: [SubscriptionController, AuthController, WorkoutPlanController],
  providers: [
    PrismaService,
    JwtServiceLocal,
    GoogleIdTokenVerifier,
    AppleIdTokenVerifier,
    GooglePlayClient,
    { provide: 'GooglePlayPort', useClass: GooglePlayService },
    {
      provide: 'SubscriptionRepository',
      useClass: PrismaSubscriptionRepository,
    },
    {
      provide: 'WorkoutPlanRepository',
      useClass: PrismaWorkoutPlanRepository,
    },
    {
      provide: 'ExerciseRepository',
      useClass: PrismaExerciseRepository,
    },
    {
      provide: 'WorkoutLimitService',
      useClass: WorkoutLimitServiceImpl,
    },
    ActivateSubscriptionUseCase,
    RestoreSubscriptionUseCase,
    CheckPremiumStatusUseCase,
    CreateWorkoutPlanUseCase,
    ListWorkoutPlansUseCase,
    GetWorkoutPlanByIdUseCase,
    UpdateWorkoutPlanUseCase,
    DeleteWorkoutPlanUseCase,
    AddExerciseToWorkoutPlanUseCase,
  ],
})
export class AppModule {}
