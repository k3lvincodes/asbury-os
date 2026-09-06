import { Hono } from 'hono';
import { Env } from '../worker';
import { createStripeClient } from '../config/stripe';
import { createSupabaseServiceClient } from '../config/supabase';
import { createCheckoutSession } from '../services/paymentService';
import { generateBookingNumber } from '../services/idGenerator';

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

    // 3. Get package
    const { data: pkg } = await supabase
      .from('rental_packages')
      .select('id')
      .eq('slug', body.packageSlug)
      .single();

    if (!pkg) {
      return c.json({ success: false, error: 'Invalid package' }, 400);
    }

    // 4. Create reservation
    const { error: reservationError } = await supabase
      .from('reservations')
      .insert({
        booking_number: bookingNumber,
        customer_id: customerId,
        trailer_id: trailer.id,
        package_id: pkg.id,
        rental_start_date: body.rentalStartDate,
        rental_end_date: body.rentalEndDate,
        pickup_date: body.rentalEndDate,
        base_price_cents: amountCents,
        amount_due_cents: amountCents,
        delivery_address: body.deliveryAddress,
        booking_status: 'awaiting_payment',
        payment_status: 'pending',
        agreement_status: 'signed',
      });

    if (reservationError) {
      return c.json({ success: false, error: `Failed to create reservation: ${reservationError.message}` }, 500);
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

// Get payment history for a reservation
payments.get('/:reservationId/history', async (c) => {
  const reservationId = c.req.param('reservationId');
  return c.json({ success: true, data: [] });
});

export default payments;