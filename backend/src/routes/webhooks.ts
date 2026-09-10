import { Hono } from 'hono';
import Telnyx from 'telnyx';
import { Env } from '../worker';
import { createStripeClient } from '../config/stripe';
import { createSupabaseServiceClient } from '../config/supabase';
import { handleWebhook } from '../services/paymentService';
import { sendReservationConfirmed, sendPaymentFailed } from '../services/notificationService';

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
    if (result && typeof result === 'object' && 'bookingNumber' in result && 'status' in result) {
      const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
      const { bookingNumber, status, paymentStatus } = result as {
        bookingNumber: string;
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
        .eq('booking_number', bookingNumber);

      // Send confirmation notifications when booking is confirmed via webhook
      if (status === 'confirmed') {
        try {
          const { data: fullReservation } = await supabase
            .from('reservations')
            .select('id, booking_number, rental_start_date, rental_end_date, delivery_address, amount_due_cents, customer:customers(full_name, email, phone), package:rental_packages(name)')
            .eq('booking_number', bookingNumber)
            .single();

          if (fullReservation) {
            // Guard: skip if confirmation notifications were already sent (race with /verify)
            const { data: existingSent } = await supabase
              .from('notifications')
              .select('id')
              .eq('reservation_id', fullReservation.id)
              .eq('template', 'reservation_confirmed')
              .eq('status', 'sent')
              .limit(1);

            if (existingSent && existingSent.length > 0) {
              console.log(`[webhook] Notifications already sent for ${bookingNumber}, skipping`);
            } else {
              const customer = fullReservation.customer as any;
              const pkg = fullReservation.package as any;
              const resendApiKey = c.env.RESEND_API_KEY || process.env.RESEND_API_KEY || '';
              const fromEmail = c.env.EMAIL_FROM || 'Asbury Outdoor Services <noreply@asburyoutdoorservices.com>';
              const adminEmail = c.env.ADMIN_EMAIL || 'contact@asburyoutdoorservices.com';
              const { Resend } = await import('resend');
              const resend = new Resend(resendApiKey);
              const telnyxClient = c.env.TELNYX_API_KEY
                ? new (await import('telnyx')).default({ apiKey: c.env.TELNYX_API_KEY })
                : null;

              await sendReservationConfirmed(
                supabase,
                resend,
                telnyxClient,
                fromEmail,
                c.env.TELNYX_PHONE_NUMBER || null,
                fullReservation.id,
                customer.email,
                customer.phone,
                c.env.ADMIN_PHONE_NUMBER || null,
                {
                  bookingNumber: fullReservation.booking_number,
                  packageName: pkg?.name || 'Custom',
                  startDate: fullReservation.rental_start_date,
                  endDate: fullReservation.rental_end_date,
                  amountDue: fullReservation.amount_due_cents,
                  deliveryAddress: fullReservation.delivery_address,
                },
                adminEmail
              );
            }
          }
        } catch (notifError) {
          console.error(`[webhook] Failed to send confirmation notifications:`, notifError);
        }
      }

      // Send payment failed notification to customer
      if (status === 'payment_failed') {
        try {
          const { data: failedReservation } = await supabase
            .from('reservations')
            .select('id, booking_number, customer:customers(email)')
            .eq('booking_number', bookingNumber)
            .single();

          if (failedReservation) {
            const customer = failedReservation.customer as any;
            const resendApiKey = c.env.RESEND_API_KEY || process.env.RESEND_API_KEY || '';
            const fromEmail = c.env.EMAIL_FROM || 'Asbury Outdoor Services <noreply@asburyoutdoorservices.com>';
            const { Resend } = await import('resend');
            const resend = new Resend(resendApiKey);

            await sendPaymentFailed(
              supabase,
              resend,
              fromEmail,
              failedReservation.id,
              customer.email,
              failedReservation.booking_number
            );
            console.log(`[webhook] Payment failed notification sent for ${bookingNumber}`);
          }
        } catch (notifError) {
          console.error(`[webhook] Failed to send payment_failed notification:`, notifError);
        }
      }
    }

    return c.json({ received: true });
  } catch {
    return c.json({ error: 'Webhook signature verification failed' }, 400);
  }
});

// Telnyx webhook handler (SMS delivery status tracking)
webhooks.post('/telnyx', async (c) => {
  if (!c.env.TELNYX_API_KEY || !c.env.TELNYX_PUBLIC_KEY) {
    return c.json({ error: 'Telnyx webhook verification is not configured.' }, 500);
  }

  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
  const rawBody = await c.req.text();

  const telnyx = new Telnyx({
    apiKey: c.env.TELNYX_API_KEY,
    publicKey: c.env.TELNYX_PUBLIC_KEY,
  });

  let event: any;
  try {
    event = await telnyx.webhooks.unwrap(rawBody, { headers: c.req.header() });
  } catch (e: any) {
    console.error('[webhooks/telnyx] Signature verification failed:', e?.message || e);
    return c.json({ error: 'Unauthorized - Invalid signature' }, 401);
  }

  const eventType = event?.data?.event_type;
  const payload = event?.data?.payload;
  const messageId: string | undefined = payload?.id;
  const toRecipients = Array.isArray(payload?.to) ? payload.to : [];
  const first = toRecipients[0] || {};
  const rawStatus = first.status;

  const statusMap: Record<string, string> = {
    sent: 'sent',
    delivered: 'delivered',
    delivery_unconfirmed: 'sent',
    sending_failed: 'failed',
    delivery_failed: 'failed',
  };
  const status = statusMap[rawStatus];

  console.log(`[webhooks/telnyx] Event ${eventType}, message ${messageId}, raw status ${rawStatus}`);

  if (eventType === 'message.sent' || eventType === 'message.finalized') {
    if (!messageId || !status) {
      return c.json({ received: true });
    }

    try {
      await supabase
        .from('notifications')
        .update({
          status,
          metadata: { telnyxEvent: eventType, telnyxStatus: rawStatus },
          sent_at: status === 'failed' ? null : new Date().toISOString(),
        })
        .eq('provider_id', messageId);

      console.log(`[webhooks/telnyx] Updated notifications for ${messageId} -> ${status}`);
    } catch (err) {
      console.error('[webhooks/telnyx] Failed to update notification:', err);
    }
  }

  return c.json({ received: true });
});

export default webhooks;