import { Hono } from 'hono';
import { Env } from '../worker';

const settings = new Hono<{ Bindings: Env }>();

// Get all settings
settings.get('/', async (c) => {
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
settings.put('/', async (c) => {
  const body = await c.req.json();
  
  // In production, update in Supabase
  return c.json({
    success: true,
    data: body,
  });
});

// Update pricing
settings.put('/pricing', async (c) => {
  const body = await c.req.json();
  
  // In production, update in Supabase
  return c.json({
    success: true,
    data: body,
  });
});

export default settings;
