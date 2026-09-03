import { Context, Next } from 'hono';

export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];
  
  // In production, verify Supabase JWT token
  // For now, just check if token exists
  if (!token) {
    return c.json({ success: false, error: 'Invalid token' }, 401);
  }

  // Add user to context
  // c.set('user', decodedUser);
  
  await next();
}
