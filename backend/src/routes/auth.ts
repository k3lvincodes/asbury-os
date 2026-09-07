import { Hono } from 'hono';
import { Env } from '../worker';
import { createSupabaseServiceClient } from '../config/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const auth = new Hono<{ Bindings: Env }>();

auth.post('/auth/signup', async (c) => {
  const body = await c.req.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return c.json({ success: false, error: 'Name, email, and password are required' }, 400);
  }

  if (password.length < 8) {
    return c.json({ success: false, error: 'Password must be at least 8 characters' }, 400);
  }

  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  // Check if email is in allowed list
  const { data: allowed, error: allowedError } = await supabase
    .from('allowed_admin_emails')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  if (allowedError || !allowed) {
    return c.json({ success: false, error: 'This email is not authorized to create an admin account' }, 403);
  }

  // Check if user already exists
  const { data: existing } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  if (existing) {
    return c.json({ success: false, error: 'An account with this email already exists' }, 409);
  }

  // Hash password and create user
  const passwordHash = await bcrypt.hash(password, 12);

  const { data: user, error: createError } = await supabase
    .from('admin_users')
    .insert({
      email: email.toLowerCase(),
      name,
      password_hash: passwordHash,
    })
    .select('id, email, name, role')
    .single();

  if (createError) {
    return c.json({ success: false, error: 'Failed to create account' }, 500);
  }

  // Generate JWT
  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    c.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return c.json({ success: true, data: { user, token } }, 201);
});

auth.post('/auth/login', async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ success: false, error: 'Email and password are required' }, 400);
  }

  const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  // Find user by email
  const { data: user, error: findError } = await supabase
    .from('admin_users')
    .select('id, email, name, role, password_hash, is_active')
    .eq('email', email.toLowerCase())
    .single();

  if (findError || !user) {
    return c.json({ success: false, error: 'Invalid email or password' }, 401);
  }

  if (!user.is_active) {
    return c.json({ success: false, error: 'This account has been deactivated' }, 403);
  }

  // Verify password
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return c.json({ success: false, error: 'Invalid email or password' }, 401);
  }

  // Update last login timestamp
  await supabase
    .from('admin_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', user.id);

  // Generate JWT
  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    c.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return c.json({
    success: true,
    data: {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    },
  });
});

auth.get('/auth/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, c.env.JWT_SECRET) as { sub: string; email: string; role: string };

    const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, is_active')
      .eq('id', payload.sub)
      .single();

    if (error || !user || !user.is_active) {
      return c.json({ success: false, error: 'User not found or deactivated' }, 401);
    }

    return c.json({ success: true, data: { user } });
  } catch {
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }
});

export default auth;
