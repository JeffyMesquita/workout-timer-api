import { Inject, Injectable } from '@nestjs/common';

import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';
import { GooglePlayPort } from '../../domain/services/google-play.port';

@Injectable()
export class RestoreSubscriptionUseCase {
  constructor(
    @Inject('SubscriptionRepository') private readonly repo: SubscriptionRepository,
    @Inject('GooglePlayPort') private readonly google: GooglePlayPort,
  ) {}

  async execute(input: { userId: string }) {
    const current = await this.repo.findLatestByUser(input.userId);
    if (!current) return { status: 'none' } as const;
    const verification = await this.google.verifySubscription({
      purchaseToken: current.purchaseToken,
      productId: current.productId,
    });
    current.status = verification.status;
    current.expiryDate = verification.expiryDate;
    current.acknowledged = verification.acknowledged;
    await this.repo.upsert(current);
    await this.repo.appendEvent(current.id, 'restored', { verification });
    return { status: current.status, expiryDate: current.expiryDate };
  }
}
