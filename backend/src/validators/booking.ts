import { z } from 'zod';

export const bookingCreateSchema = z.object({
  packageSlug: z.enum(['24h', '3d', '7d']),
  trailerId: z.string().uuid(),
  rentalStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  customer: z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    deliveryAddress: z.string().min(5, 'Please enter a valid address'),
  }),
});

export const bookingUpdateSchema = z.object({
  notes: z.string().optional(),
  rentalStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
});

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>;
