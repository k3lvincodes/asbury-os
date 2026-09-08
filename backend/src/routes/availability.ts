import { Hono } from 'hono';
import { Env } from '../worker';
import { createSupabaseServiceClient } from '../config/supabase';

const availability = new Hono<{ Bindings: Env }>();

// Check if a date range is available and suggest alternatives
availability.post('/check', async (c) => {
  const body = await c.req.json<{
    startDate?: string;
    endDate?: string;
    durationDays?: number;
  }>();

  if (!body.startDate || (!body.endDate && !body.durationDays)) {
    return c.json({ success: false, error: 'startDate and endDate or durationDays required' }, 400);
  }

  if (!c.env.SUPABASE_URL || !c.env.SUPABASE_SERVICE_ROLE_KEY) {
    return c.json({ success: false, error: 'Supabase is not configured.' }, 500);
  }

  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const startDate = body.startDate;
  let endDate = body.endDate;

  if (!endDate && body.durationDays) {
    const start = new Date(startDate);
    start.setDate(start.getDate() + body.durationDays - 1);
    endDate = start.toISOString().split('T')[0];
  }

  // Fetch all existing bookings that could overlap with the requested range
  // We look at a window from today to 6 months out
  const today = new Date().toISOString().split('T')[0];
  const sixMonthsOut = new Date();
  sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6);
  const futureDate = sixMonthsOut.toISOString().split('T')[0];

  const { data: reservations, error } = await supabase
    .from('reservations')
    .select('rental_start_date, rental_end_date')
    .gte('rental_end_date', today)
    .lte('rental_start_date', futureDate)
    .in('booking_status', ['confirmed', 'awaiting_payment']);

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  // Check if requested range overlaps with any booking
  const isAvailable = !(reservations || []).some(
    (r) => startDate <= r.rental_end_date && endDate! >= r.rental_start_date
  );

  if (isAvailable) {
    return c.json({
      success: true,
      data: { available: true, startDate, endDate },
    });
  }

  // Find available slots that fit the requested duration
  const durationDays = body.durationDays || Math.ceil(
    (new Date(endDate!).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const bookedRanges = (reservations || [])
    .map((r) => ({ start: r.rental_start_date, end: r.rental_end_date }))
    .sort((a, b) => a.start.localeCompare(b.start));

  const suggestions: { startDate: string; endDate: string }[] = [];

  // Helper to check if a suggested range overlaps with the originally-requested range
  const overlapsRequested = (sugStart: string, sugEnd: string) => {
    return sugStart <= endDate! && sugEnd >= startDate;
  };

  // Check before first booking
  if (bookedRanges.length > 0) {
    const firstBooked = bookedRanges[0];
    const daysBefore = Math.ceil(
      (new Date(firstBooked.start).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysBefore >= durationDays) {
      const sugEnd = new Date(firstBooked.start);
      sugEnd.setDate(sugEnd.getDate() - 1);
      const sugStartStr = today;
      const sugEndStr = sugEnd.toISOString().split('T')[0];
      if (!overlapsRequested(sugStartStr, sugEndStr)) {
        suggestions.push({
          startDate: sugStartStr,
          endDate: sugEndStr,
        });
      }
    }
  }

  // Check gaps between bookings
  for (let i = 0; i < bookedRanges.length - 1; i++) {
    const gapStart = new Date(bookedRanges[i].end);
    gapStart.setDate(gapStart.getDate() + 1);
    const gapEnd = new Date(bookedRanges[i + 1].start);
    gapEnd.setDate(gapEnd.getDate() - 1);

    const gapDays = Math.ceil(
      (gapEnd.getTime() - gapStart.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    if (gapDays >= durationDays) {
      const sugStartStr = gapStart.toISOString().split('T')[0];
      const sugEndStr = gapEnd.toISOString().split('T')[0];
      if (!overlapsRequested(sugStartStr, sugEndStr)) {
        suggestions.push({
          startDate: sugStartStr,
          endDate: sugEndStr,
        });
      }
    }
  }

  // Check after last booking
  if (bookedRanges.length > 0) {
    const lastBooked = bookedRanges[bookedRanges.length - 1];
    const afterStart = new Date(lastBooked.end);
    afterStart.setDate(afterStart.getDate() + 1);
    const maxEnd = new Date();
    maxEnd.setMonth(maxEnd.getMonth() + 6);

    const daysAfter = Math.ceil(
      (maxEnd.getTime() - afterStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysAfter >= durationDays) {
      const sugEnd = new Date(afterStart);
      sugEnd.setDate(sugEnd.getDate() + durationDays - 1);
      const sugStartStr = afterStart.toISOString().split('T')[0];
      const sugEndStr = sugEnd.toISOString().split('T')[0];
      if (!overlapsRequested(sugStartStr, sugEndStr)) {
        suggestions.push({
          startDate: sugStartStr,
          endDate: sugEndStr,
        });
      }
    }
  }

  return c.json({
    success: true,
    data: {
      available: false,
      requestedStart: startDate,
      requestedEnd: endDate,
      suggestions: suggestions.slice(0, 5),
    },
  });
});

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