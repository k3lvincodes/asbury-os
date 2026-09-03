import { Context, Next } from 'hono';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const result = schema.safeParse(body);
      
      if (!result.success) {
        return c.json(
          {
            success: false,
            error: 'Validation error',
            details: result.error.errors,
          },
          400
        );
      }
      
      // Add validated data to context
      c.set('validatedData', result.data);
      
      await next();
    } catch (error) {
      return c.json(
        { success: false, error: 'Invalid request body' },
        400
      );
    }
  };
}
