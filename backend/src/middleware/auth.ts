import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { createSupabaseServiceClient } from '../config/supabase';

export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return c.json({ success: false, error: 'Invalid token' }, 401);
  }

  try {
    const env = c.env;
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; email: string; role: string };

    const supabase = createSupabaseServiceClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, is_active')
      .eq('id', payload.sub)
      .single();

    if (error || !user || !user.is_active) {
      return c.json({ success: false, error: 'User not found or deactivated' }, 401);
    }

    c.set('user', user);
    await next();
  } catch {
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }
}
