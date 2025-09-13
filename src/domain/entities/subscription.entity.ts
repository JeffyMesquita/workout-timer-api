export type SubscriptionStatus = 'active' | 'expired' | 'canceled' | 'pending';

export class Subscription {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly productId: string,
    public readonly purchaseToken: string,
    public status: SubscriptionStatus,
    public expiryDate: Date,
    public acknowledged = false,
  ) {}
  isActive(now = new Date()): boolean {
    return this.status === 'active' && this.expiryDate > now;
  }
}
