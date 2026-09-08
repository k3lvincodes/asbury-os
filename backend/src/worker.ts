import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { requireAuth } from './middleware/auth';
import auth from './routes/auth';
import bookings from './routes/bookings';
import availability from './routes/availability';
import payments from './routes/payments';
import webhooks from './routes/webhooks';
import agreements from './routes/agreements';
import charges from './routes/charges';
import notifications from './routes/notifications';
import customers from './routes/customers';
import admin from './routes/admin';
import settings from './routes/settings';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  CLIENT_URL: string;
  ADMIN_URL: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  ADMIN_PHONE_NUMBER: string;
  JWT_SECRET: string;
  ENVIRONMENT: string;
}

const app = new Hono<{ Bindings: Env }>();

// Middleware to inject environment variables into c.env (Node.js compatibility)
app.use('*', async (c, next) => {
  c.env = {
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    CLIENT_URL: process.env.CLIENT_URL || '',
    ADMIN_URL: process.env.ADMIN_URL || '',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    EMAIL_FROM: process.env.EMAIL_FROM || '',
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
    ADMIN_PHONE_NUMBER: process.env.ADMIN_PHONE_NUMBER || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    ENVIRONMENT: process.env.NODE_ENV || 'development',
  } as Env;
  await next();
});

// Middleware
app.use('*', cors());
app.use('*', logger());

// Public routes
app.route('/api/v1', bookings);
app.route('/api/v1/availability', availability);
app.route('/api/v1/payments', payments);

// Public pricing endpoint (must be before agreements catch-all)
app.get('/api/v1/pricing-config', async (c) => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return c.json({ success: false, error: 'Supabase not configured' }, 500);
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const pricingKeys = [
    'package_24h_price', 'package_3d_price', 'package_7d_price',
    'extra_day_price', 'extra_mile_price', 'overweight_per_ton',
    'failed_pickup_fee', 'cleaning_fee_max', 'included_miles',
    'booking_hold_minutes',
  ];

  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', pricingKeys);

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  const result: Record<string, number> = {};
  (data ?? []).forEach((row: any) => {
    result[row.key] = row.value;
  });

  return c.json({ success: true, data: result });
});

app.route('/api/v1', agreements);

// Webhook routes (no auth)
app.route('/api/v1/webhooks', webhooks);

// Auth routes (public — signup/login)
app.route('/api/v1', auth);

// Protected admin routes (require auth)
app.use('/api/v1/admin/*', requireAuth);
app.route('/api/v1/admin', admin);
app.route('/api/v1/admin', charges);
app.route('/api/v1/admin', notifications);
app.route('/api/v1/admin', customers);
app.route('/api/v1/admin', settings);

// Health check
app.get('/', (c) => {
  return c.json({ message: 'Asbury Outdoor Services API' });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Node.js server
const port = parseInt(process.env.PORT || '8787', 10);

console.log(`Server starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
