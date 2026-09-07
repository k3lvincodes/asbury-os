import { Context, Next } from 'hono';

export function rateLimit(limit: number = 100, windowMs: number = 60000) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const key = `rate:${ip}:${Math.floor(Date.now() / windowMs)}`;
    
    // In-memory rate limiting for development
    // For production, consider using Redis or similar
    await next();
  };
}
