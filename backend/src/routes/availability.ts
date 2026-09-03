import { Hono } from 'hono';
import { Env } from '../worker';

const availability = new Hono<{ Bindings: Env }>();

// Get available dates for a trailer
availability.get('/dates', async (c) => {
  const trailerId = c.req.query('trailerId');
  const month = c.req.query('month');
  const year = c.req.query('year');

  // In production, fetch from Supabase and check KV cache
  const bookedDates = [
    '2026-09-10',
    '2026-09-11',
    '2026-09-12',
    '2026-09-15',
    '2026-09-16',
  ];

  return c.json({
    success: true,
    data: {
      trailerId,
      month: parseInt(month || '9'),
      year: parseInt(year || '2026'),
      bookedDates,
    },
  });
});

// Get trailer calendar
availability.get('/calendar', async (c) => {
  const trailerId = c.req.query('trailerId');
  const month = c.req.query('month');
  const year = c.req.query('year');

  // In production, fetch from Supabase
  return c.json({
    success: true,
    data: {
      trailerId,
      month: parseInt(month || '9'),
      year: parseInt(year || '2026'),
      bookings: [],
    },
  });
});

export default availability;
