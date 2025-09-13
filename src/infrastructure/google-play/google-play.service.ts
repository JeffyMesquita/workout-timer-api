import { Injectable } from '@nestjs/common';
import { GooglePlayPort } from '../../domain/services/google-play.port';
import { GooglePlayClient } from './google-play.client';

@Injectable()
export class GooglePlayService implements GooglePlayPort {
  constructor(private readonly client: GooglePlayClient) {}
  async verifySubscription({ purchaseToken, productId }: { purchaseToken: string; productId: string }) {
    const raw: any = await this.client.getSubscription(purchaseToken, productId);
    // TODO: mapear payload oficial -> status/expiry/acknowledged
    return { status: 'active' as const, expiryDate: new Date(Date.now()+30*24*3600*1000), acknowledged: false };
  }
  acknowledge({ purchaseToken, productId }: { purchaseToken: string; productId: string }) {
    return this.client.acknowledge(purchaseToken, productId);
  }
}
