import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../worker';
import { createSupabaseServiceClient } from '../config/supabase';

const bookings = new Hono<{ Bindings: Env }>();

// Get all packages
bookings.get('/packages', async (c) => {
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('rental_packages')
    .select('id, name, slug, duration_hours, base_price_cents, description')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  return c.json({ success: true, data });
});

// Check availability
bookings.get('/availability/check', async (c) => {
  const startDate = c.req.query('startDate');
  const endDate = c.req.query('endDate');

  if (!startDate || !endDate) {
    return c.json({ success: false, error: 'startDate and endDate are required' }, 400);
  }

  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: conflicts, error } = await supabase
    .from('reservations')
    .select('id, booking_number')
    .not('booking_status', 'in', '(cancelled,expired)')
    .lte('rental_start_date', endDate)
    .gte('rental_end_date', startDate)
    .limit(1);

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  const available = !conflicts || conflicts.length === 0;

  return c.json({
    success: true,
    data: {
      available,
      checkedDates: { start: startDate, end: endDate },
      ...(available ? {} : { conflictingBooking: conflicts[0].booking_number }),
    },
  });
});

// Create a new booking
bookings.post('/bookings', async (c) => {
  const body = await c.req.json();

  const schema = z.object({
    packageSlug: z.string(),
    rentalStartDate: z.string(),
    customer: z.object({
      fullName: z.string(),
      email: z.string().email(),
      phone: z.string(),
      deliveryAddress: z.string(),
    }),
  });

  const result = schema.safeParse(body);
  if (!result.success) {
    return c.json({ success: false, error: 'Invalid input' }, 400);
  }

  const { packageSlug, rentalStartDate, customer } = result.data;
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  // Look up package
  const { data: pkg, error: pkgError } = await supabase
    .from('rental_packages')
    .select('id, name, slug, duration_hours, base_price_cents')
    .eq('slug', packageSlug)
    .single();

  if (pkgError || !pkg) {
    return c.json({ success: false, error: 'Invalid package' }, 400);
  }

  // Calculate dates
  const startDate = new Date(rentalStartDate);
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + pkg.duration_hours);

  const rentalEndDate = endDate.toISOString().split('T')[0];
  const pickupDate = rentalEndDate;

  // Check availability
  const { data: conflicts } = await supabase
    .from('reservations')
    .select('id')
    .not('booking_status', 'in', '(cancelled,expired)')
    .lte('rental_start_date', rentalEndDate)
    .gte('rental_end_date', rentalStartDate)
    .limit(1);

  if (conflicts && conflicts.length > 0) {
    return c.json({ success: false, error: 'These dates are no longer available. Please choose different dates.' }, 409);
  }

  // Upsert customer
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', customer.email.toLowerCase())
    .single();

  let customerId: string;

  if (existingCustomer) {
    customerId = existingCustomer.id;
    await supabase
      .from('customers')
      .update({
        full_name: customer.fullName,
        phone: customer.phone,
        delivery_address: customer.deliveryAddress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId);
  } else {
    const { data: newCustomer, error: customerError } = await supabase
      .from('customers')
      .insert({
        full_name: customer.fullName,
        email: customer.email.toLowerCase(),
        phone: customer.phone,
        delivery_address: customer.deliveryAddress,
      })
      .select('id')
      .single();

    if (customerError || !newCustomer) {
      return c.json({ success: false, error: 'Failed to create customer' }, 500);
    }
    customerId = newCustomer.id;
  }

  // Get the single trailer
  const { data: trailer } = await supabase
    .from('trailers')
    .select('id')
    .eq('is_active', true)
    .limit(1)
    .single();

  if (!trailer) {
    return c.json({ success: false, error: 'No trailers available' }, 500);
  }

  // Generate booking number
  const { count } = await supabase
    .from('reservations')
    .select('id', { count: 'exact', head: true });

  const bookingNumber = `AOS-${new Date().getFullYear()}-${String((count ?? 0) + 1).padStart(4, '0')}`;

  // Create reservation
  const { data: reservation, error: reservationError } = await supabase
    .from('reservations')
    .insert({
      booking_number: bookingNumber,
      customer_id: customerId,
      trailer_id: trailer.id,
      package_id: pkg.id,
      rental_start_date: rentalStartDate,
      rental_end_date: rentalEndDate,
      pickup_date: pickupDate,
      base_price_cents: pkg.base_price_cents,
      amount_due_cents: pkg.base_price_cents,
      delivery_address: customer.deliveryAddress,
      booking_status: 'awaiting_payment',
      payment_status: 'pending',
      agreement_status: 'not_started',
      hold_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    })
    .select('id, booking_number, hold_expires_at, rental_end_date, pickup_date, base_price_cents, amount_due_cents')
    .single();

  if (reservationError) {
    return c.json({ success: false, error: 'Failed to create reservation' }, 500);
  }

  return c.json({
    success: true,
    data: {
      bookingNumber: reservation.booking_number,
      holdExpiresAt: reservation.hold_expires_at,
      rentalEndDate: reservation.rental_end_date,
      pickupDate: reservation.pickup_date,
      basePriceCents: reservation.base_price_cents,
      totalDueCents: reservation.amount_due_cents,
      package: {
        name: pkg.name,
        durationHours: pkg.duration_hours,
      },
    },
  });
});

// Get booking by number
bookings.get('/bookings/:bookingNumber', async (c) => {
  const bookingNumber = c.req.param('bookingNumber');

  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      customer:customers(full_name, email, phone, delivery_address),
      package:rental_packages(name, duration_hours, base_price_cents)
    `)
    .eq('booking_number', bookingNumber)
    .single();

  if (error || !data) {
    return c.json({ success: false, error: 'Reservation not found' }, 404);
  }

  return c.json({
    success: true,
    data: {
      bookingNumber: data.booking_number,
      status: data.booking_status,
      paymentStatus: data.payment_status,
      customer: {
        name: data.customer?.full_name ?? '',
        email: data.customer?.email ?? '',
        phone: data.customer?.phone ?? '',
        deliveryAddress: data.customer?.delivery_address ?? data.delivery_address,
      },
      package: data.package ? {
        name: data.package.name,
        durationHours: data.package.duration_hours,
      } : null,
      rentalStartDate: data.rental_start_date,
      rentalEndDate: data.rental_end_date,
      basePriceCents: data.base_price_cents,
      deliveryAddress: data.delivery_address,
      agreementStatus: data.agreement_status,
      createdAt: data.created_at,
    },
  });
});

// Submit signed agreement
bookings.post('/bookings/:bookingNumber/agreement', async (c) => {
  const bookingNumber = c.req.param('bookingNumber');
  const body = await c.req.json();

  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: reservation, error: findError } = await supabase
    .from('reservations')
    .select('id')
    .eq('booking_number', bookingNumber)
    .single();

  if (findError || !reservation) {
    return c.json({ success: false, error: 'Reservation not found' }, 404);
  }

  // Get active agreement version
  const { data: agreement } = await supabase
    .from('agreements')
    .select('id')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Create signed agreement record
  if (agreement) {
    await supabase.from('signed_agreements').insert({
      reservation_id: reservation.id,
      agreement_id: agreement.id,
      customer_name: body.customerName || '',
      signature_data: body.signatureData || '',
      accepted_at: new Date().toISOString(),
      ip_address: c.req.header('x-forwarded-for') || '',
    });
  }

  // Update reservation agreement status
  await supabase
    .from('reservations')
    .update({
      agreement_status: 'signed',
      agreement_signed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', reservation.id);

  return c.json({
    success: true,
    data: {
      agreementSigned: true,
      signedAt: new Date().toISOString(),
    },
  });
});

export default bookings;
