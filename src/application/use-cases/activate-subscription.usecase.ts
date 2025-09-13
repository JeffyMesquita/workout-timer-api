import { Inject, Injectable } from '@nestjs/common';

import { Subscription } from '../../domain/entities/subscription.entity';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';
import { GooglePlayPort } from '../../domain/services/google-play.port';

@Injectable()
export class ActivateSubscriptionUseCase {
  constructor(
    @Inject('SubscriptionRepository') private readonly repo: SubscriptionRepository,
    @Inject('GooglePlayPort') private readonly google: GooglePlayPort,
  ) {}

  async execute(input: { userId: string; productId: string; purchaseToken: string }) {
    const { userId, productId, purchaseToken } = input;
    const verification = await this.google.verifySubscription({ purchaseToken, productId });

    let sub = await this.repo.findByPurchaseToken(purchaseToken);
    if (!sub) {
      sub = new Subscription(
        crypto.randomUUID(),
        userId,
        productId,
        purchaseToken,
        verification.status,
        verification.expiryDate,
        verification.acknowledged,
      );
    } else {
      sub.status = verification.status;
      sub.expiryDate = verification.expiryDate;
      sub.acknowledged = verification.acknowledged;
    }
    await this.repo.upsert(sub);
    await this.repo.appendEvent(sub.id, 'activated', { verification });
    if (!verification.acknowledged && verification.status === 'active') {
      await this.google.acknowledge({ purchaseToken, productId });
    }
    return { status: sub.status, expiryDate: sub.expiryDate };
  }
}
