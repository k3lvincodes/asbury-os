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

    // 4. Check date availability
    const { data: conflicts } = await supabase
      .from('reservations')
      .select('id')
      .not('booking_status', 'in', '(cancelled,expired)')
      .lte('rental_start_date', body.rentalEndDate!)
      .gte('rental_end_date', body.rentalStartDate!)
      .limit(1);

    if (conflicts && conflicts.length > 0) {
      return c.json({ success: false, error: 'These dates are no longer available. Please choose different dates.' }, 409);
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

  if (!bookingNumber) {
    return c.json({ success: false, error: 'Missing bookingNumber' }, 400);
  }

  if (!c.env.STRIPE_SECRET_KEY) {
    return c.json({ success: false, error: 'Stripe is not configured.' }, 500);
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
      return c.json({ success: false, error: 'Reservation not found' }, 404);
    }

    // Already paid — nothing to do
    if (reservation.payment_status === 'paid') {
      return c.json({ success: true, data: { status: 'confirmed', paymentStatus: 'paid' } });
    }

    // Search Stripe for a checkout session matching this booking number
    const sessions = await stripe.checkout.sessions.list({
      limit: 5,
    });

    const session = sessions.data.find(
      (s) => s.metadata?.bookingNumber === bookingNumber || s.client_reference_id === bookingNumber
    );

    if (!session) {
      return c.json({ success: false, error: 'No Stripe session found for this booking' }, 404);
    }

    if (session.payment_status === 'paid') {
      await supabase
        .from('reservations')
        .update({
          booking_status: 'confirmed',
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservation.id);

      // Fetch full reservation data for notification
      const { data: fullReservation } = await supabase
        .from('reservations')
        .select('id, booking_number, rental_start_date, rental_end_date, delivery_address, amount_due_cents, customer:customers(full_name, email, phone), package:rental_packages(name)')
        .eq('id', reservation.id)
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
          'Asbury Outdoor Services <noreply@asburyoutdoorservices.com>',
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