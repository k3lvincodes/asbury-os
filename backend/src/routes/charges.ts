import { Hono } from 'hono';
import { Env } from '../worker';

const charges = new Hono<{ Bindings: Env }>();

// Get charges for a reservation
charges.get('/reservation/:reservationId', async (c) => {
  const reservationId = c.req.param('reservationId');
  
  // In production, fetch from Supabase
  return c.json({
    success: true,
    data: [],
  });
});

// Create a new charge
charges.post('/reservation/:reservationId', async (c) => {
  const reservationId = c.req.param('reservationId');
  const body = await c.req.json();
  
  // In production:
  // 1. Validate input
  // 2. Create charge in Supabase
  // 3. Update reservation total
  // 4. Send notification

  return c.json({
    success: true,
    data: {
      id: 'charge_123',
      reservationId,
      ...body,
      status: 'draft',
    },
  });
});

// Update a charge
charges.put('/:id', async (c) => {
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

// Waive a charge
charges.put('/:id/waive', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  
  // In production:
  // 1. Update charge status to 'waived'
  // 2. Update reservation total
  // 3. Log in audit trail

  return c.json({
    success: true,
    data: {
      id,
      status: 'waived',
      waivedBy: body.adminId,
      waivedAt: new Date().toISOString(),
    },
  });
});

export default charges;
