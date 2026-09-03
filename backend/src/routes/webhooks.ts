import { Hono } from 'hono';
import { Env } from '../worker';

const webhooks = new Hono<{ Bindings: Env }>();

// Stripe webhook handler
webhooks.post('/stripe', async (c) => {
  const body = await c.req.text();
  const sig = c.req.header('stripe-signature');

  // In production:
  // 1. Verify webhook signature
  // 2. Parse event
  // 3. Handle different event types:
  //    - checkout.session.completed
  //    - payment_intent.payment_failed
  //    - charge.refunded
  //    - checkout.session.expired

  // For now, return success
  return c.json({ received: true });
});

export default webhooks;
