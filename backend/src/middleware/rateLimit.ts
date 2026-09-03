import { Context, Next } from 'hono';
import { Env } from '../worker';

export function rateLimit(limit: number = 100, windowMs: number = 60000) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    const key = `rate:${ip}:${Math.floor(Date.now() / windowMs)}`;
    
    // In production, use Cloudflare Workers KV for rate limiting
    // For now, just allow all requests
    
    await next();
  };
}
