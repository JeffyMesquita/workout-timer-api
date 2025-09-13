import { Injectable } from '@nestjs/common';

import { Subscription } from '../../../domain/entities/subscription.entity';
import { SubscriptionRepository } from '../../../domain/repositories/subscription.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByPurchaseToken(token: string): Promise<Subscription | null> {
    const row = await this.prisma.subscription.findUnique({ where: { purchaseToken: token } });
    return row
      ? new Subscription(
          row.id,
          row.userId,
          row.productId,
          row.purchaseToken,
          row.status,
          row.expiryDate,
          row.acknowledged,
        )
      : null;
  }

  async findLatestByUser(userId: string): Promise<Subscription | null> {
    const row = await this.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return row
      ? new Subscription(
          row.id,
          row.userId,
          row.productId,
          row.purchaseToken,
          row.status,
          row.expiryDate,
          row.acknowledged,
        )
      : null;
  }

  async upsert(sub: Subscription): Promise<Subscription> {
    const row = await this.prisma.subscription.upsert({
      where: { purchaseToken: sub.purchaseToken },
      update: {
        status: sub.status,
        expiryDate: sub.expiryDate,
        acknowledged: sub.acknowledged,
        productId: sub.productId,
        userId: sub.userId,
      },
      create: {
        id: sub.id,
        userId: sub.userId,
        productId: sub.productId,
        purchaseToken: sub.purchaseToken,
        status: sub.status,
        expiryDate: sub.expiryDate,
        acknowledged: sub.acknowledged,
      },
    });
    return new Subscription(
      row.id,
      row.userId,
      row.productId,
      row.purchaseToken,
      row.status,
      row.expiryDate,
      row.acknowledged,
    );
  }

  async appendEvent(subscriptionId: string, type: string, payload: unknown): Promise<void> {
    await this.prisma.subscriptionEvent.create({
      data: { subscriptionId, type, payload: payload as any },
    });
  }
}
