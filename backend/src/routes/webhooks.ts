import { Hono } from 'hono';
import { Env } from '../worker';
import { createStripeClient } from '../config/stripe';
import { createSupabaseServiceClient } from '../config/supabase';
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

    // If the webhook returned a reservation update, apply it to Supabase
    if (result && typeof result === 'object' && 'reservationId' in result && 'status' in result) {
      const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
      const { reservationId, status, paymentStatus } = result as {
        reservationId: string;
        status: string;
        paymentStatus: string;
      };

      await supabase
        .from('reservations')
        .update({
          booking_status: status,
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('booking_number', reservationId);
    }

    return c.json({ received: true });
  } catch {
    return c.json({ error: 'Webhook signature verification failed' }, 400);
  }
});

export default webhooks;