import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const phoneSchema = z.string().min(10, 'Phone number must be at least 10 digits');
export const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

export const customerInfoSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  deliveryAddress: z.string().min(5, 'Please enter a valid address'),
});

export const bookingNumberSchema = z.string().regex(
  /^AOS-\d{4}-\d{4}$/,
  'Invalid booking number format'
);
