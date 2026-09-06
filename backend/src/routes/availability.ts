import { Hono } from 'hono';
import { Env } from '../worker';
import { createSupabaseServiceClient } from '../config/supabase';

const availability = new Hono<{ Bindings: Env }>();

// Get available dates for a trailer
availability.get('/dates', async (c) => {
  const trailerId = c.req.query('trailerId');
  const month = c.req.query('month');
  const year = c.req.query('year');

  if (!c.env.SUPABASE_URL || !c.env.SUPABASE_SERVICE_ROLE_KEY) {
    return c.json({ success: false, error: 'Supabase is not configured.' }, 500);
  }

  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const monthNum = parseInt(month || String(new Date().getMonth() + 1));
  const yearNum = parseInt(year || String(new Date().getFullYear()));

  const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
  const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
  const nextYear = monthNum === 12 ? yearNum + 1 : yearNum;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

  let query = supabase
    .from('reservations')
    .select('rental_start_date, rental_end_date')
    .gte('rental_end_date', startDate)
    .lt('rental_start_date', endDate)
    .in('booking_status', ['confirmed', 'awaiting_payment']);

  if (trailerId) {
    query = query.eq('trailer_id', trailerId);
  }

  const { data: reservations, error } = await query;

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  // Expand each reservation into individual booked dates
  const bookedDates = new Set<string>();
  for (const res of reservations || []) {
    const start = new Date(res.rental_start_date);
    const end = new Date(res.rental_end_date);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      bookedDates.add(d.toISOString().split('T')[0]);
    }
  }

  return c.json({
    success: true,
    data: {
      trailerId,
      month: monthNum,
      year: yearNum,
      bookedDates: Array.from(bookedDates).sort(),
    },
  });
});

// Get trailer calendar
availability.get('/calendar', async (c) => {
  const trailerId = c.req.query('trailerId');
  const month = c.req.query('month');
  const year = c.req.query('year');

  if (!c.env.SUPABASE_URL || !c.env.SUPABASE_SERVICE_ROLE_KEY) {
    return c.json({ success: false, error: 'Supabase is not configured.' }, 500);
  }

  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const monthNum = parseInt(month || String(new Date().getMonth() + 1));
  const yearNum = parseInt(year || String(new Date().getFullYear()));

  const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
  const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
  const nextYear = monthNum === 12 ? yearNum + 1 : yearNum;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

  let query = supabase
    .from('reservations')
    .select('booking_number, rental_start_date, rental_end_date, booking_status')
    .gte('rental_end_date', startDate)
    .lt('rental_start_date', endDate)
    .in('booking_status', ['confirmed', 'awaiting_payment']);

  if (trailerId) {
    query = query.eq('trailer_id', trailerId);
  }

  const { data: bookings, error } = await query;

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  return c.json({
    success: true,
    data: {
      trailerId,
      month: monthNum,
      year: yearNum,
      bookings: bookings || [],
    },
  });
});

export default availability;