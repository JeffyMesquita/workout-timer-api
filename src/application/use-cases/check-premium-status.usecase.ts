import { Inject, Injectable } from '@nestjs/common';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';

@Injectable()
export class CheckPremiumStatusUseCase {
  constructor(
    @Inject('SubscriptionRepository')
    private readonly repo: SubscriptionRepository,
  ) {}
  async execute(input: { userId: string }) {
    const sub = await this.repo.findLatestByUser(input.userId);
    if (!sub) {
      return {
        status: 'none' as const,
        isPremium: false,
        expiryDate: undefined,
      };
    }

    const isPremium = sub.isActive();
    return {
      status: sub.status,
      expiryDate: sub.expiryDate,
      isPremium,
    };
  }
}
