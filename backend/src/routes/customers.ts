import { Hono } from 'hono';
import { Env } from '../worker';

const customers = new Hono<{ Bindings: Env }>();

// Get all customers (admin)
customers.get('/', async (c) => {
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

// Get customer by ID
customers.get('/:id', async (c) => {
  const id = c.req.param('id');
  
  // In production, fetch from Supabase
  return c.json({
    success: true,
    data: {
      id,
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+13045551234',
      deliveryAddress: '123 Main St, Charleston, WV 25301',
    },
  });
});

// Get customer reservations
customers.get('/:id/reservations', async (c) => {
  const id = c.req.param('id');
  
  // In production, fetch from Supabase
  return c.json({
    success: true,
    data: [],
  });
});

export default customers;
