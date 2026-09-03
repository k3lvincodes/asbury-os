import { Hono } from 'hono';
import { Env } from '../worker';

const admin = new Hono<{ Bindings: Env }>();

// Get dashboard stats
admin.get('/dashboard/stats', async (c) => {
  // In production, fetch from Supabase
  return c.json({
    success: true,
    data: {
      totalReservations: 2,
      activeReservations: 1,
      totalRevenue: 62500,
      pendingPayments: 1,
    },
  });
});

// Get all reservations
admin.get('/reservations', async (c) => {
  const status = c.req.query('status');
  const paymentStatus = c.req.query('paymentStatus');
  const dateRange = c.req.query('dateRange');
  const search = c.req.query('search');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');

  // In production, fetch from Supabase with filters
  return c.json({
    success: true,
    data: [],
    pagination: {
      page,
      limit,
      total: 0,
    },
  });
});

// Get reservation by ID
admin.get('/reservations/:id', async (c) => {
  const id = c.req.param('id');
  
  // In production, fetch from Supabase with relations
  return c.json({
    success: true,
    data: {
      id,
      bookingNumber: 'AOS-2026-0001',
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      customerPhone: '+13045551234',
      deliveryAddress: '123 Main St, Charleston, WV 25301',
      packageName: '3 Days',
      startDate: '2026-09-10',
      endDate: '2026-09-13',
      pickupDate: '2026-09-13',
      basePriceCents: 40000,
      totalChargesCents: 0,
      amountDueCents: 40000,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      agreementStatus: 'signed',
      createdAt: '2026-09-03T10:00:00Z',
    },
  });
});

// Update reservation
admin.put('/reservations/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  
  // In production, update in Supabase
  return c.json({
    success: true,
    data: {
      id,
      ...body,
    },
  });
});

// Cancel reservation
admin.post('/reservations/:id/cancel', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  
  // In production:
  // 1. Update status to cancelled
  // 2. Process refund if paid
  // 3. Release dates
  // 4. Send notifications

  return c.json({
    success: true,
    data: {
      id,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      reason: body.reason,
    },
  });
});

// Process refund
admin.post('/reservations/:id/refund', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  
  // In production:
  // 1. Create Stripe refund
  // 2. Update payment status
  // 3. Update reservation status
  // 4. Send notification

  return c.json({
    success: true,
    data: {
      id,
      refundId: 're_123',
      amountCents: body.amountCents,
      status: 'refunded',
    },
  });
});

// Get calendar data
admin.get('/calendar', async (c) => {
  const month = c.req.query('month');
  const year = c.req.query('year');

  // In production, fetch from Supabase
  return c.json({
    success: true,
    data: [],
  });
});

// Get signed agreements
admin.get('/agreements', async (c) => {
  // In production, fetch from Supabase
  return c.json({
    success: true,
    data: [],
  });
});

// Get agreement by ID
admin.get('/agreements/:id', async (c) => {
  const id = c.req.param('id');
  
  // In production, fetch from Supabase
  return c.json({
    success: true,
    data: {
      id,
      reservationId: 'res_123',
      customerName: 'John Smith',
      signedAt: '2026-09-03T10:00:00Z',
      pdfUrl: 'https://res.cloudinary.com/...',
    },
  });
});

// Get all additional charges
admin.get('/charges', async (c) => {
  // In production, fetch from Supabase
  return c.json({
    success: true,
    data: [],
  });
});

// Get settings
admin.get('/settings', async (c) => {
  // In production, fetch from Supabase
  return c.json({
    success: true,
    data: {
      package24hPrice: 22500,
      package3dPrice: 40000,
      package7dPrice: 60000,
      extraDayPrice: 7500,
      extraMilePrice: 300,
      overweightPerTon: 12500,
      failedPickupFee: 7500,
      cleaningFeeMax: 10000,
      includedMiles: 50,
      bookingHoldMinutes: 15,
    },
  });
});

// Update settings
admin.put('/settings', async (c) => {
  const body = await c.req.json();
  
  // In production, update in Supabase
  return c.json({
    success: true,
    data: body,
  });
});

// Update pricing
admin.put('/settings/pricing', async (c) => {
  const body = await c.req.json();
  
  // In production, update in Supabase
  return c.json({
    success: true,
    data: body,
  });
});

export default admin;
