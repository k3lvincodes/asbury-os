import { Hono } from 'hono';
import { Env } from '../worker';
import { createSupabaseServiceClient } from '../config/supabase';

const settings = new Hono<{ Bindings: Env }>();

// Get all settings
settings.get('/', async (c) => {
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase.from('settings').select('key, value');

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  const result: Record<string, any> = {};
  (data ?? []).forEach((row: any) => {
    result[row.key] = row.value;
  });

  return c.json({ success: true, data: result });
});

// Update settings
settings.put('/', async (c) => {
  const body = await c.req.json();
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const updates = Object.entries(body).map(([key, value]) =>
    supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() })
  );

  await Promise.all(updates);

  return c.json({ success: true, data: body });
});

// Update pricing
settings.put('/pricing', async (c) => {
  const body = await c.req.json();
  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const pricingKeys = [
    'package_24h_price', 'package_3d_price', 'package_7d_price',
    'extra_day_price', 'extra_mile_price', 'overweight_per_ton',
    'failed_pickup_fee', 'cleaning_fee_max', 'included_miles',
  ];

  const updates = Object.entries(body)
    .filter(([key]) => pricingKeys.includes(key))
    .map(([key, value]) =>
      supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() })
    );

  await Promise.all(updates);

  return c.json({ success: true, data: body });
});

export default settings;
