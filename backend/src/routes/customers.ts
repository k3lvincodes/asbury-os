import { Hono } from 'hono';
import { Env } from '../worker';
import { createSupabaseServiceClient } from '../config/supabase';

const customers = new Hono<{ Bindings: Env }>();

// Get all customers (admin)
customers.get('/', async (c) => {
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('customers')
    .select(`
      id,
      full_name,
      email,
      phone,
      delivery_address,
      created_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  // Enrich with reservation stats
  const enriched = await Promise.all(
    (data ?? []).map(async (customer: any) => {
      const { data: reservations } = await supabase
        .from('reservations')
        .select('amount_due_cents, total_charges_cents, total_refunded_cents, rental_start_date')
        .eq('customer_id', customer.id)
        .not('booking_status', 'in', '(cancelled,expired)');

      const totalBookings = reservations?.length ?? 0;
      const totalSpentCents = reservations?.reduce(
        (sum: number, r: any) => sum + (r.amount_due_cents ?? 0) + (r.total_charges_cents ?? 0) - (r.total_refunded_cents ?? 0),
        0
      ) ?? 0;
      const lastBookingDate = reservations?.length
        ? reservations.reduce((latest: string, r: any) =>
            r.rental_start_date > latest ? r.rental_start_date : latest, '')
        : null;

      return {
        id: customer.id,
        fullName: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        deliveryAddress: customer.delivery_address,
        totalBookings,
        totalSpentCents,
        lastBookingDate,
        createdAt: customer.created_at,
      };
    })
  );

  return c.json({ success: true, data: enriched });
});

// Get customer by ID
customers.get('/:id', async (c) => {
  const id = c.req.param('id');
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return c.json({ success: false, error: 'Customer not found' }, 404);
  }

  return c.json({
    success: true,
    data: {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      deliveryAddress: data.delivery_address,
      createdAt: data.created_at,
    },
  });
});

// Get customer reservations
customers.get('/:id/reservations', async (c) => {
  const id = c.req.param('id');
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      booking_number,
      rental_start_date,
      rental_end_date,
      base_price_cents,
      amount_due_cents,
      booking_status,
      payment_status,
      package:rental_packages(name)
    `)
    .eq('customer_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  return c.json({ success: true, data: data ?? [] });
});

export default customers;
