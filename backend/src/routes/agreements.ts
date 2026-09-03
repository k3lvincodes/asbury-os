import { Hono } from 'hono';
import { Env } from '../worker';

const agreements = new Hono<{ Bindings: Env }>();

// Get current agreement
agreements.get('/', async (c) => {
  // In production, fetch from Supabase
  return c.json({
    success: true,
    data: {
      version: '1.0',
      title: 'Dump Trailer Rental Agreement',
      content: '<h1>Dump Trailer Rental Agreement</h1><p>Terms and conditions...</p>',
    },
  });
});

// Get specific agreement version
agreements.get('/:version', async (c) => {
  const version = c.req.param('version');
  
  // In production, fetch from Supabase
  return c.json({
    success: true,
    data: {
      version,
      title: 'Dump Trailer Rental Agreement',
      content: '<h1>Dump Trailer Rental Agreement</h1><p>Terms and conditions...</p>',
    },
  });
});

// Get signed agreement for a reservation
agreements.get('/signed/:reservationId', async (c) => {
  const reservationId = c.req.param('reservationId');
  
  // In production, fetch from Supabase
  return c.json({
    success: true,
    data: {
      reservationId,
      signed: true,
      signedAt: '2026-09-03T10:00:00Z',
      pdfUrl: 'https://res.cloudinary.com/...',
    },
  });
});

export default agreements;
