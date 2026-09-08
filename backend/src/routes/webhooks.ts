import { Hono } from 'hono';
import { Env } from '../worker';
import { createStripeClient } from '../config/stripe';
import { createSupabaseServiceClient } from '../config/supabase';
import { handleWebhook } from '../services/paymentService';
import { sendReservationConfirmed } from '../services/notificationService';

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

      // Send confirmation email when booking is confirmed via webhook
      if (status === 'confirmed') {
        const { data: fullReservation } = await supabase
          .from('reservations')
          .select('id, booking_number, rental_start_date, rental_end_date, delivery_address, amount_due_cents, customer:customers(full_name, email, phone), package:rental_packages(name)')
          .eq('booking_number', reservationId)
          .single();

        if (fullReservation) {
          const customer = fullReservation.customer as any;
          const pkg = fullReservation.package as any;
          const { Resend } = await import('resend');
          const resend = new Resend(c.env.RESEND_API_KEY);
          const twilioClient = c.env.TWILIO_ACCOUNT_SID && c.env.TWILIO_AUTH_TOKEN
            ? (await import('twilio')).default(c.env.TWILIO_ACCOUNT_SID, c.env.TWILIO_AUTH_TOKEN)
            : null;

          await sendReservationConfirmed(
            supabase,
            resend,
            twilioClient,
            c.env.EMAIL_FROM || 'Asbury Outdoor Services <noreply@asburyoutdoorservices.com>',
            c.env.TWILIO_PHONE_NUMBER || null,
            fullReservation.id,
            customer.email,
            customer.phone,
            c.env.ADMIN_PHONE_NUMBER || null,
            {
              bookingNumber: fullReservation.booking_number,
              packageName: pkg.name,
              startDate: fullReservation.rental_start_date,
              endDate: fullReservation.rental_end_date,
              amountDue: fullReservation.amount_due_cents,
              deliveryAddress: fullReservation.delivery_address,
            }
          );
        }
      }
    }

    return c.json({ received: true });
  } catch {
    return c.json({ error: 'Webhook signature verification failed' }, 400);
  }
});

export default webhooks;