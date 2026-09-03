import { Context, Next } from 'hono';

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error: any) {
    console.error('Error:', error);
    
    return c.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      error.status || 500
    );
  }
}
