import { Hono } from 'hono';
import { Env } from '../worker';

const notifications = new Hono<{ Bindings: Env }>();

// Get notifications for a reservation
notifications.get('/:reservationId', async (c) => {
  const reservationId = c.req.param('reservationId');
  
  // In production, fetch from Supabase
  return c.json({
    success: true,
    data: [],
  });
});

// Send a manual notification
notifications.post('/send', async (c) => {
  const body = await c.req.json();
  
  // In production:
  // 1. Validate input
  // 2. Send email/SMS via Resend/Twilio
  // 3. Log in notifications table

  return c.json({
    success: true,
    data: {
      id: 'notif_123',
      type: body.type,
      status: 'sent',
      sentAt: new Date().toISOString(),
    },
  });
});

// Get all notifications (admin)
notifications.get('/', async (c) => {
  // In production, fetch from Supabase with pagination
  return c.json({
    success: true,
    data: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
    },
  });
});

export default notifications;
