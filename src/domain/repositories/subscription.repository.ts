import { Subscription } from '../entities/subscription.entity';

export interface SubscriptionRepository {
  findByPurchaseToken(token: string): Promise<Subscription | null>;
  findLatestByUser(userId: string): Promise<Subscription | null>;
  upsert(sub: Subscription): Promise<Subscription>;
  appendEvent(subscriptionId: string, type: string, payload: unknown): Promise<void>;
}
