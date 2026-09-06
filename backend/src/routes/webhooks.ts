import { Hono } from 'hono';
import { Env } from '../worker';
import { createStripeClient } from '../config/stripe';
import { handleWebhook } from '../services/paymentService';

const webhooks = new Hono<{ Bindings: Env }>();

// Stripe webhook handler
webhooks.post('/stripe', async (c) => {
  const payload = await c.req.text();
  const signature = c.req.header('stripe-signature');

  if (!c.env.STRIPE_WEBHOOK_SECRET) {
    return c.json(
      { error: 'STRIPE_WEBHOOK_SECRET is not configured. Set it on the backend.' },
      500
    );
  }

  if (!signature) {
    return c.json({ error: 'Missing stripe-signature header' }, 400);
  }

  const stripe = createStripeClient(c.env.STRIPE_SECRET_KEY);

  try {
    const result = await handleWebhook(
      stripe,
      payload,
      signature,
      c.env.STRIPE_WEBHOOK_SECRET
    );
    return c.json(result);
  } catch {
    return c.json({ error: 'Webhook signature verification failed' }, 400);
  }
});

export default webhooks;