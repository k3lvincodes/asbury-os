import { Hono } from 'hono';
import { Env } from '../worker';
import { createSupabaseServiceClient } from '../config/supabase';

const admin = new Hono<{ Bindings: Env }>();

// Get dashboard stats
admin.get('/dashboard/stats', async (c) => {
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const [totalRes, activeRes, revenueRes, pendingRes] = await Promise.all([
    supabase.from('reservations').select('id', { count: 'exact', head: true }),
    supabase.from('reservations').select('id', { count: 'exact', head: true }).in('booking_status', ['confirmed', 'active']),
    supabase.from('reservations').select('amount_due_cents, total_charges_cents, total_refunded_cents').not('booking_status', 'in', '(cancelled,expired)'),
    supabase.from('reservations').select('id', { count: 'exact', head: true }).eq('payment_status', 'pending'),
  ]);

  const totalRevenue = revenueRes.data?.reduce(
    (sum, r) => sum + (r.amount_due_cents ?? 0) + (r.total_charges_cents ?? 0) - (r.total_refunded_cents ?? 0),
    0
  ) ?? 0;

  return c.json({
    success: true,
    data: {
      totalReservations: totalRes.count ?? 0,
      activeReservations: activeRes.count ?? 0,
      totalRevenue,
      pendingPayments: pendingRes.count ?? 0,
    },
  });
});

// Get all reservations
admin.get('/reservations', async (c) => {
  const status = c.req.query('status');
  const paymentStatus = c.req.query('paymentStatus');
  const search = c.req.query('search');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  let query = supabase
    .from('reservations')
    .select(`
      id,
      booking_number,
      rental_start_date,
      rental_end_date,
      base_price_cents,
      total_charges_cents,
      amount_due_cents,
      booking_status,
      payment_status,
      created_at,
      customer:customers(full_name, email, phone),
      package:rental_packages(name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('booking_status', status);
  }
  if (paymentStatus) {
    query = query.eq('payment_status', paymentStatus);
  }
  if (search) {
    query = query.or(`booking_number.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  const reservations = (data ?? []).map((r: any) => ({
    id: r.id,
    bookingNumber: r.booking_number,
    customerName: r.customer?.full_name ?? '',
    customerEmail: r.customer?.email ?? '',
    packageName: r.package?.name ?? '',
    startDate: r.rental_start_date,
    endDate: r.rental_end_date,
    basePriceCents: r.base_price_cents,
    totalChargesCents: r.total_charges_cents,
    amountDueCents: r.amount_due_cents,
    status: r.booking_status,
    paymentStatus: r.payment_status,
    createdAt: r.created_at,
  }));

  return c.json({
    success: true,
    data: reservations,
    pagination: {
      page,
      limit,
      total: count ?? 0,
    },
  });
});

// Get reservation by ID
admin.get('/reservations/:id', async (c) => {
  const id = c.req.param('id');
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      customer:customers(full_name, email, phone, delivery_address),
      package:rental_packages(name, duration_hours, base_price_cents)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return c.json({ success: false, error: 'Reservation not found' }, 404);
  }

  return c.json({
    success: true,
    data: {
      id: data.id,
      bookingNumber: data.booking_number,
      customerName: data.customer?.full_name ?? '',
      customerEmail: data.customer?.email ?? '',
      customerPhone: data.customer?.phone ?? '',
      deliveryAddress: data.customer?.delivery_address ?? data.delivery_address,
      packageName: data.package?.name ?? '',
      startDate: data.rental_start_date,
      endDate: data.rental_end_date,
      pickupDate: data.pickup_date,
      basePriceCents: data.base_price_cents,
      totalChargesCents: data.total_charges_cents,
      amountDueCents: data.amount_due_cents,
      bookingStatus: data.booking_status,
      paymentStatus: data.payment_status,
      agreementStatus: data.agreement_status,
      createdAt: data.created_at,
    },
  });
});

// Update reservation
admin.put('/reservations/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('reservations')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  return c.json({ success: true, data });
});

// Cancel reservation
admin.post('/reservations/:id/cancel', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('reservations')
    .update({
      booking_status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  await supabase.from('booking_history').insert({
    reservation_id: id,
    action: 'cancelled',
    old_value: data.booking_status,
    new_value: 'cancelled',
    notes: body.reason,
  });

  return c.json({
    success: true,
    data: { id, status: 'cancelled', cancelledAt: new Date().toISOString(), reason: body.reason },
  });
});

// Process refund
admin.post('/reservations/:id/refund', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { error } = await supabase
    .from('reservations')
    .update({
      payment_status: 'refunded',
      total_refunded_cents: body.amountCents,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  return c.json({
    success: true,
    data: { id, refundId: `re_${Date.now()}`, amountCents: body.amountCents, status: 'refunded' },
  });
});

// Get calendar data
admin.get('/calendar', async (c) => {
  const month = c.req.query('month');
  const year = c.req.query('year');
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  let query = supabase
    .from('reservations')
    .select(`
      id,
      booking_number,
      rental_start_date,
      rental_end_date,
      booking_status,
      customer:customers(full_name),
      package:rental_packages(name)
    `)
    .not('booking_status', 'in', '(cancelled,expired)');

  if (month && year) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
    const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
    query = query.overlaps('rental_start_date', 'rental_end_date', `[${startDate},${endDate})`);
  }

  const { data, error } = await query;

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  const bookings = (data ?? []).map((r: any) => ({
    id: r.id,
    bookingNumber: r.booking_number,
    customerName: r.customer?.full_name ?? '',
    startDate: r.rental_start_date,
    endDate: r.rental_end_date,
    status: r.booking_status,
  }));

  return c.json({ success: true, data: bookings });
});

// Get signed agreements
admin.get('/agreements', async (c) => {
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('signed_agreements')
    .select(`
      id,
      reservation_id,
      customer_name,
      accepted_at,
      pdf_url,
      created_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  return c.json({ success: true, data: data ?? [] });
});

// Get agreement by ID
admin.get('/agreements/:id', async (c) => {
  const id = c.req.param('id');
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('signed_agreements')
    .select(`
      id,
      reservation_id,
      customer_name,
      accepted_at,
      pdf_url,
      created_at
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return c.json({ success: false, error: 'Agreement not found' }, 404);
  }

  return c.json({ success: true, data });
});

// Get all additional charges
admin.get('/charges', async (c) => {
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('additional_charges')
    .select(`
      id,
      reservation_id,
      charge_type,
      description,
      quantity,
      unit_price_cents,
      total_cents,
      status,
      created_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  return c.json({ success: true, data: data ?? [] });
});

// Get settings
admin.get('/settings', async (c) => {
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase.from('settings').select('key, value');

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  const settings: Record<string, any> = {};
  (data ?? []).forEach((row: any) => {
    settings[row.key] = row.value;
  });

  return c.json({ success: true, data: settings });
});

// Update settings
admin.put('/settings', async (c) => {
  const body = await c.req.json();
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const updates = Object.entries(body).map(([key, value]) =>
    supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() })
  );

  await Promise.all(updates);

  return c.json({ success: true, data: body });
});

// Update pricing
admin.put('/settings/pricing', async (c) => {
  const body = await c.req.json();
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const pricingKeys = [
    'package_24h_price', 'package_3d_price', 'package_7d_price',
    'extra_day_price', 'extra_mile_price', 'overweight_per_ton',
    'failed_pickup_fee', 'cleaning_fee_max', 'included_miles',
  ];

  const updates = Object.entries(body)
    .filter(([key]) => pricingKeys.includes(key))
    .map(([key, value]) =>
      supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() })
    );

  await Promise.all(updates);

  return c.json({ success: true, data: body });
});

export default admin;
