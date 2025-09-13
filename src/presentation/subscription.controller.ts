import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { ActivateSubscriptionUseCase } from '../application/use-cases/activate-subscription.usecase';
import { CheckPremiumStatusUseCase } from '../application/use-cases/check-premium-status.usecase';
import { RestoreSubscriptionUseCase } from '../application/use-cases/restore-subscription.usecase';
import { JwtAuthGuard } from '../infrastructure/auth/jwt.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(
    private readonly activate: ActivateSubscriptionUseCase,
    private readonly restore: RestoreSubscriptionUseCase,
    private readonly check: CheckPremiumStatusUseCase,
  ) {}

  @Post('activate')
  async activateEndpoint(
    @Req() req: any,
    @Body() body: { productId: string; purchaseToken: string },
  ) {
    const userId = req.user.id;
    return this.activate.execute({ userId, ...body });
  }

  @Post('restore')
  async restoreEndpoint(@Req() req: any) {
    const userId = req.user.id;
    return this.restore.execute({ userId });
  }

  @Get('status')
  async statusEndpoint(@Req() req: any) {
    const userId = req.user.id;
    return this.check.execute({ userId });
  }
}
