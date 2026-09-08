import { Hono } from 'hono';
import { Env } from '../worker';
import { createSupabaseServiceClient } from '../config/supabase';

const notifications = new Hono<{ Bindings: Env }>();

// Get notifications for a reservation
notifications.get('/:reservationId', async (c) => {
  const reservationId = c.req.param('reservationId');

  if (!c.env.SUPABASE_URL || !c.env.SUPABASE_SERVICE_ROLE_KEY) {
    return c.json({ success: false, error: 'Supabase is not configured.' }, 500);
  }

  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('notifications')
    .select('*, reservations!inner(booking_number)')
    .eq('reservation_id', reservationId)
    .order('created_at', { ascending: false });

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  return c.json({
    success: true,
    data: data || [],
  });
});

// Get all notifications (admin)
notifications.get('/', async (c) => {
  if (!c.env.SUPABASE_URL || !c.env.SUPABASE_SERVICE_ROLE_KEY) {
    return c.json({ success: false, error: 'Supabase is not configured.' }, 500);
  }

  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true });

  const { data, error } = await supabase
    .from('notifications')
    .select('*, reservations!inner(booking_number)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  return c.json({
    success: true,
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
    },
  });
});

// Send a manual notification (placeholder for future use)
notifications.post('/send', async (c) => {
  const body = await c.req.json();

  if (!c.env.SUPABASE_URL || !c.env.SUPABASE_SERVICE_ROLE_KEY) {
    return c.json({ success: false, error: 'Supabase is not configured.' }, 500);
  }

  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      reservation_id: body.reservationId,
      type: body.type || 'email',
      template: body.template || 'manual',
      recipient: body.recipient,
      subject: body.subject || null,
      status: 'queued',
      metadata: body.metadata || null,
    })
    .select()
    .single();

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  return c.json({
    success: true,
    data: {
      id: data.id,
      type: data.type,
      status: data.status,
      sentAt: data.sent_at,
    },
  });
});

export default notifications;
