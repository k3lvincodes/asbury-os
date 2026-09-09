import { Hono } from 'hono';
import { Env } from '../worker';
import { createStripeClient } from '../config/stripe';
import { createSupabaseServiceClient } from '../config/supabase';
import { createCheckoutSession } from '../services/paymentService';
import { generateBookingNumber } from '../services/idGenerator';
import { sendReservationConfirmed } from '../services/notificationService';

const payments = new Hono<{ Bindings: Env }>();

// Create Stripe checkout session
payments.post('/create-checkout', async (c) => {
  const body = await c.req.json<{
    amountCents?: number;
    customerEmail?: string;
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    packageSlug?: string;
    rentalStartDate?: string;
    rentalEndDate?: string;
    signatureData?: string;
  }>();

  const amountCents = Number(body?.amountCents);
  const customerEmail = body?.customerEmail;

  if (!amountCents || !customerEmail || !body?.customerName || !body?.packageSlug || !body?.rentalStartDate || !body?.rentalEndDate || !body?.deliveryAddress) {
    return c.json(
      { success: false, error: 'Missing required booking fields' },
      400
    );
  }

  if (!c.env.STRIPE_SECRET_KEY) {
    return c.json(
      { success: false, error: 'Stripe is not configured. Set STRIPE_SECRET_KEY on the backend.' },
      500
    );
  }

  if (!c.env.SUPABASE_URL || !c.env.SUPABASE_SERVICE_ROLE_KEY) {
    return c.json(
      { success: false, error: 'Supabase is not configured.' },
      500
    );
  }

  const stripe = createStripeClient(c.env.STRIPE_SECRET_KEY);
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
  const bookingNumber = generateBookingNumber();

  try {
    // 1. Find or create customer
    let customerId: string;
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customerEmail)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          full_name: body.customerName,
          email: customerEmail,
          phone: body.customerPhone || '',
          delivery_address: body.deliveryAddress,
        })
        .select('id')
        .single();

      if (customerError || !newCustomer) {
        return c.json({ success: false, error: 'Failed to create customer record' }, 500);
      }
      customerId = newCustomer.id;
    }

    // 2. Get first active trailer
    const { data: trailer } = await supabase
      .from('trailers')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (!trailer) {
      return c.json({ success: false, error: 'No active trailer available' }, 500);
    }

    // 3. Get package (skip for custom packages)
    let packageId: string | null = null;
    if (body.packageSlug && body.packageSlug !== 'custom') {
      const { data: pkg } = await supabase
        .from('rental_packages')
        .select('id')
        .eq('slug', body.packageSlug)
        .single();

      if (!pkg) {
        return c.json({ success: false, error: 'Invalid package' }, 400);
      }
      packageId = pkg.id;
    }

    // 4a. First — expire any stale awaiting_payment reservations so they don't block new bookings
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    await supabase
      .from('reservations')
      .update({ booking_status: 'expired', updated_at: new Date().toISOString() })
      .eq('booking_status', 'awaiting_payment')
      .lt('created_at', tenMinAgo);

    // 4b. Check date availability against confirmed/active + fresh awaiting_payment reservations
    //     (must match what the availability calendar shows as blocked)
    const { data: conflicts } = await supabase
      .from('reservations')
      .select('id')
      .in('booking_status', ['confirmed', 'active', 'awaiting_payment'])
      .lte('rental_start_date', body.rentalEndDate!)
      .gte('rental_end_date', body.rentalStartDate!)
      .limit(1);

    if (conflicts && conflicts.length > 0) {
      return c.json({ success: false, error: 'These dates are temporarily held by another checkout in progress. Please try again in a few minutes or choose different dates.' }, 409);
    }


    // 5. Create reservation
    const { data: newReservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        booking_number: bookingNumber,
        customer_id: customerId,
        trailer_id: trailer.id,
        package_id: packageId,
        rental_start_date: body.rentalStartDate,
        rental_end_date: body.rentalEndDate,
        pickup_date: body.rentalEndDate,
        base_price_cents: amountCents,
        amount_due_cents: amountCents,
        delivery_address: body.deliveryAddress,
        booking_status: 'awaiting_payment',
        payment_status: 'pending',
        agreement_status: 'signed',
      })
      .select('id')
      .single();

    if (reservationError) {
      return c.json({ success: false, error: `Failed to create reservation: ${reservationError.message}` }, 500);
    }

    // 5. Save signed agreement if signature was provided
    if (body.signatureData && newReservation) {
      const { data: activeAgreement } = await supabase
        .from('agreements')
        .select('id')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (activeAgreement) {
        await supabase.from('signed_agreements').insert({
          reservation_id: newReservation.id,
          agreement_id: activeAgreement.id,
          customer_name: body.customerName || '',
          signature_data: body.signatureData,
          accepted_at: new Date().toISOString(),
          ip_address: c.req.header('x-forwarded-for') || '',
        });
      }
    }

    // 5. Create Stripe session with booking number in success URL
    const session = await createCheckoutSession(
      stripe,
      {
        reservationId: bookingNumber,
        bookingNumber,
        amountCents,
        customerEmail,
      },
      c.env.CLIENT_URL
    );

    // 6. Save Stripe session ID to payments table for later lookup
    await supabase.from('payments').insert({
      reservation_id: newReservation.id,
      stripe_session_id: session.sessionId,
      amount_cents: amountCents,
      currency: 'usd',
      status: 'pending',
      payment_type: 'booking',
    });

    return c.json({
      success: true,
      data: session,
    });
  } catch (err) {
    return c.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Unable to create checkout session. Please try again.',
      },
      500
    );
  }
});

// Verify payment and update reservation status
payments.post('/verify', async (c) => {
  const body = await c.req.json<{ bookingNumber?: string }>();
  const bookingNumber = body?.bookingNumber;

  console.log(`[verify] Called for booking: ${bookingNumber}`);

  if (!bookingNumber) {
    return c.json({ success: false, error: 'Missing bookingNumber' }, 400);
  }

  if (!c.env.STRIPE_SECRET_KEY) {
    console.error('[verify] STRIPE_SECRET_KEY not configured');
    return c.json({ success: false, error: 'Stripe is not configured.' }, 500);
  }

  if (!c.env.RESEND_API_KEY) {
    console.error('[verify] RESEND_API_KEY not configured — emails will not be sent');
  }

  const stripe = createStripeClient(c.env.STRIPE_SECRET_KEY);
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Look up reservation
    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .select('id, booking_number, payment_status')
      .eq('booking_number', bookingNumber)
      .single();

    if (resError || !reservation) {
      console.error(`[verify] Reservation not found for booking: ${bookingNumber}`);
      return c.json({ success: false, error: 'Reservation not found' }, 404);
    }

    console.log(`[verify] Found reservation ${reservation.id}, payment_status: ${reservation.payment_status}`);

    // Send confirmation notifications if not already sent for this reservation
    const sendNotifications = async () => {
      const { data: existingSent } = await supabase
        .from('notifications')
        .select('id')
        .eq('reservation_id', reservation.id)
        .eq('template', 'reservation_confirmed')
        .eq('status', 'sent')
        .limit(1);

      if (existingSent && existingSent.length > 0) {
        console.log(`[verify] Notifications already sent for ${reservation.id}, skipping`);
        return;
      }

      const { data: fullReservation } = await supabase
        .from('reservations')
        .select('id, booking_number, rental_start_date, rental_end_date, delivery_address, amount_due_cents, customer:customers(full_name, email, phone), package:rental_packages(name)')
        .eq('id', reservation.id)
        .single();

      if (!fullReservation) {
        console.error(`[verify] Failed to fetch full reservation ${reservation.id} for notifications`);
        return;
      }

      const customer = fullReservation.customer as any;
      const pkg = fullReservation.package as any;
      console.log(`[verify] Sending notification to ${customer.email} for booking ${fullReservation.booking_number}`);
      const resendApiKey = c.env.RESEND_API_KEY || process.env.RESEND_API_KEY || '';
      const fromEmail = c.env.EMAIL_FROM || 'Asbury Outdoor Services <noreply@asburyoutdoorservices.com>';
      const adminEmail = c.env.ADMIN_EMAIL || 'contact@asburyoutdoorservices.com';
      const { Resend } = await import('resend');
      const resend = new Resend(resendApiKey);
      const twilioClient = c.env.TWILIO_ACCOUNT_SID && c.env.TWILIO_AUTH_TOKEN
        ? (await import('twilio')).default(c.env.TWILIO_ACCOUNT_SID, c.env.TWILIO_AUTH_TOKEN)
        : null;

      try {
        await sendReservationConfirmed(
          supabase,
          resend,
          twilioClient,
          fromEmail,
          c.env.TWILIO_PHONE_NUMBER || null,
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
        console.log(`[verify] Notifications sent successfully`);
      } catch (notifError) {
        console.error(`[verify] Failed to send notifications:`, notifError);
      }
    };

    // Already paid — ensure notifications were sent (retry if they never went out)
    if (reservation.payment_status === 'paid') {
      console.log(`[verify] Already paid, ensuring notifications were sent`);
      await sendNotifications();
      return c.json({ success: true, data: { status: 'confirmed', paymentStatus: 'paid' } });
    }

    // Look up Stripe session ID from payments table (new path)
    let stripeSessionId: string | null = null;
    const { data: paymentRecord } = await supabase
      .from('payments')
      .select('stripe_session_id')
      .eq('reservation_id', reservation.id)
      .eq('payment_type', 'booking')
      .not('stripe_session_id', 'is', null)
      .limit(1)
      .single();

    if (paymentRecord?.stripe_session_id) {
      stripeSessionId = paymentRecord.stripe_session_id;
    }

    console.log(`[verify] Stripe session ID from payments table: ${stripeSessionId || '(none - using fallback)'}`);

    // Retrieve session — try direct lookup first, fall back to list for old bookings
    let session;
    if (stripeSessionId) {
      session = await stripe.checkout.sessions.retrieve(stripeSessionId);
    } else {
      // Fallback for bookings created before payment record was stored
      console.log(`[verify] Falling back to sessions.list() for old booking`);
      const sessions = await stripe.checkout.sessions.list({ limit: 100 });
      session = sessions.data.find(
        (s) => s.metadata?.bookingNumber === bookingNumber || s.client_reference_id === bookingNumber
      );
    }

    if (!session) {
      console.error(`[verify] No Stripe session found for booking: ${bookingNumber}`);
      return c.json({ success: false, error: 'No Stripe session found for this booking' }, 404);
    }

    console.log(`[verify] Stripe session ${session.id}, payment_status: ${session.payment_status}`);

    // If payment isn't confirmed yet, poll a few times with backoff
    // (Stripe may still be processing when the user returns from checkout)
    if (session.payment_status !== 'paid' && stripeSessionId) {
      const maxPolls = 4;
      for (let i = 1; i <= maxPolls; i++) {
        const delayMs = 2000 * i; // 2s, 4s, 6s, 8s
        console.log(`[verify] Payment not yet confirmed, polling attempt ${i}/${maxPolls} in ${delayMs}ms`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        session = await stripe.checkout.sessions.retrieve(stripeSessionId);
        console.log(`[verify] Poll ${i}: payment_status = ${session.payment_status}`);
        if (session.payment_status === 'paid') break;
      }
    }

    if (session.payment_status === 'paid') {
      console.log(`[verify] Payment confirmed — updating reservation and sending notifications`);
      await supabase
        .from('reservations')
        .update({
          booking_status: 'confirmed',
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservation.id);

      await sendNotifications();

      return c.json({ success: true, data: { status: 'confirmed', paymentStatus: 'paid' } });
    }

    return c.json({ success: true, data: { status: reservation.payment_status, paymentStatus: reservation.payment_status } });
  } catch (err) {
    return c.json(
      { success: false, error: err instanceof Error ? err.message : 'Verification failed' },
      500
    );
  }
});

// Get payment history for a reservation
payments.get('/:reservationId/history', async (c) => {
  const reservationId = c.req.param('reservationId');
  return c.json({ success: true, data: [] });
});

export default payments;