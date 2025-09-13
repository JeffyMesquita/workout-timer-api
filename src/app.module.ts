import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './infrastructure/database/prisma.service';
import { SubscriptionController } from './presentation/subscription.controller';
import { AuthController } from './presentation/auth.controller';
import { GooglePlayClient } from './infrastructure/google-play/google-play.client';
import { GooglePlayService } from './infrastructure/google-play/google-play.service';
import { JwtServiceLocal } from './infrastructure/auth/jwt.service';
import { GoogleIdTokenVerifier } from './infrastructure/auth/google.strategy';
import { AppleIdTokenVerifier } from './infrastructure/auth/apple.strategy';
import { PrismaSubscriptionRepository } from './infrastructure/database/repositories/prisma-subscription.repository';
import { ActivateSubscriptionUseCase } from './application/use-cases/activate-subscription.usecase';
import { RestoreSubscriptionUseCase } from './application/use-cases/restore-subscription.usecase';
import { CheckPremiumStatusUseCase } from './application/use-cases/check-premium-status.usecase';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ScheduleModule.forRoot()],
  controllers: [SubscriptionController, AuthController],
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
    ActivateSubscriptionUseCase,
    RestoreSubscriptionUseCase,
    CheckPremiumStatusUseCase,
  ],
})
export class AppModule {}
