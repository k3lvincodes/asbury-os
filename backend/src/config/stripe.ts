import Stripe from 'stripe';

export function createStripeClient(secretKey: string) {
  return new Stripe(secretKey, {
    apiVersion: '2023-10-16',
  });
}
