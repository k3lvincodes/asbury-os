import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
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
  BOOKING_HOLDS: KVNamespace;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  CLIENT_URL: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  RESEND_API_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  JWT_SECRET: string;
  ENVIRONMENT: string;
}

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Public routes
app.route('/api/v1', bookings);
app.route('/api/v1/availability', availability);
app.route('/api/v1/payments', payments);
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

export default {
  fetch: app.fetch,
};
