export interface GooglePlayPort {
  verifySubscription(args: { purchaseToken: string; productId: string }): Promise<{
    status: 'active' | 'expired' | 'canceled' | 'pending';
    expiryDate: Date;
    acknowledged: boolean;
  }>;

  acknowledge(args: { purchaseToken: string; productId: string }): Promise<void>;
}
