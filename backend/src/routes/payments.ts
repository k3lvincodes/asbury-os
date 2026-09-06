import { Hono } from 'hono';
import { Env } from '../worker';
import { createStripeClient } from '../config/stripe';
import { createCheckoutSession } from '../services/paymentService';
import { generateBookingNumber } from '../services/idGenerator';

const payments = new Hono<{ Bindings: Env }>();

// Create Stripe checkout session
payments.post('/create-checkout', async (c) => {
  const body = await c.req.json<{
    amountCents?: number;
    customerEmail?: string;
    reservationId?: string;
  }>();

  const amountCents = Number(body?.amountCents);
  const customerEmail = body?.customerEmail;

  if (!amountCents || !customerEmail) {
    return c.json(
      { success: false, error: 'amountCents and customerEmail are required' },
      400
    );
  }

  const stripe = createStripeClient(c.env.STRIPE_SECRET_KEY);
  const bookingNumber = generateBookingNumber();

  try {
    const session = await createCheckoutSession(
      stripe,
      {
        reservationId: body.reservationId || bookingNumber,
        bookingNumber,
        amountCents,
        customerEmail,
      },
      c.env.CLIENT_URL
    );

    return c.json({
      success: true,
      data: session,
    });
  } catch (err) {
    return c.json(
      {
        success: false,
        error: 'Unable to create checkout session. Please try again.',
      },
      500
    );
  }
});

// Get payment history for a reservation
payments.get('/:reservationId/history', async (c) => {
  const reservationId = c.req.param('reservationId');

  // In production, fetch from Supabase
  return c.json({
    success: true,
    data: [],
  });
});

export default payments;