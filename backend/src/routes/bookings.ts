import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../worker';

const bookings = new Hono<{ Bindings: Env }>();

// Get all packages
bookings.get('/packages', async (c) => {
  // In production, fetch from Supabase
  const packages = [
    {
      id: '1',
      name: '24 Hours',
      slug: '24h',
      durationHours: 24,
      basePriceCents: 22500,
      description: 'Perfect for small projects',
    },
    {
      id: '2',
      name: '3 Days',
      slug: '3d',
      durationHours: 72,
      basePriceCents: 40000,
      description: 'Great for medium-sized jobs',
    },
    {
      id: '3',
      name: '7 Days',
      slug: '7d',
      durationHours: 168,
      basePriceCents: 60000,
      description: 'Best for large projects',
    },
  ];

  return c.json({ success: true, data: packages });
});

// Check availability
bookings.get('/availability/check', async (c) => {
  const trailerId = c.req.query('trailerId');
  const startDate = c.req.query('startDate');
  const endDate = c.req.query('endDate');

  // In production, check against database and KV cache
  return c.json({
    success: true,
    data: {
      available: true,
      trailerId,
      checkedDates: { start: startDate, end: endDate },
    },
  });
});

// Create a new booking
bookings.post('/bookings', async (c) => {
  const body = await c.req.json();
  
  // Validate input
  const schema = z.object({
    packageSlug: z.string(),
    trailerId: z.string(),
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

  // In production:
  // 1. Check availability
  // 2. Create customer record
  // 3. Create reservation with hold
  // 4. Store hold in KV with TTL
  // 5. Return booking details

  const bookingNumber = `AOS-2026-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

  return c.json({
    success: true,
    data: {
      bookingNumber,
      holdExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      rentalEndDate: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      pickupDate: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      basePriceCents: 40000,
      totalDueCents: 40000,
      package: {
        name: '3 Days',
        durationHours: 72,
      },
    },
  });
});

// Get booking by number
bookings.get('/bookings/:bookingNumber', async (c) => {
  const bookingNumber = c.req.param('bookingNumber');
  
  // In production, fetch from Supabase
  return c.json({
    success: true,
    data: {
      bookingNumber,
      status: 'confirmed',
      customer: {
        name: 'John Smith',
        email: 'john@example.com',
      },
    },
  });
});

// Submit signed agreement
bookings.post('/bookings/:bookingNumber/agreement', async (c) => {
  const bookingNumber = c.req.param('bookingNumber');
  const body = await c.req.json();
  
  // In production:
  // 1. Store signature data
  // 2. Generate PDF
  // 3. Upload to Cloudinary
  // 4. Update reservation status

  return c.json({
    success: true,
    data: {
      agreementSigned: true,
      signedAt: new Date().toISOString(),
    },
  });
});

export default bookings;
