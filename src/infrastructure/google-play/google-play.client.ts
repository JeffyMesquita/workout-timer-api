import { Injectable } from '@nestjs/common';

@Injectable()
export class GooglePlayClient {
  async getSubscription(purchaseToken: string, productId: string) {
    // TODO: implementar com google-auth-library + androidpublisher.purchases.subscriptions.get
    return {};
  }
  async acknowledge(purchaseToken: string, productId: string) {
    // TODO: androidpublisher.purchases.subscriptions.acknowledge
    return;
  }
}
