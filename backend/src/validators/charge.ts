import { z } from 'zod';

export const chargeCreateSchema = z.object({
  reservationId: z.string().uuid(),
  chargeType: z.enum([
    'overweight',
    'extra_day',
    'extra_mileage',
    'failed_pickup',
    'cleaning',
    'damage',
    'prohibited_material',
    'custom',
  ]),
  description: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive').default(1),
  unitPriceCents: z.number().positive('Unit price must be positive'),
  adminNotes: z.string().optional(),
});

export const chargeUpdateSchema = z.object({
  description: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive').optional(),
  unitPriceCents: z.number().positive('Unit price must be positive').optional(),
  status: z.enum(['draft', 'pending_payment', 'paid', 'failed', 'waived']).optional(),
  adminNotes: z.string().optional(),
});

export const chargeWaiveSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
  adminId: z.string().uuid(),
});

export type ChargeCreateInput = z.infer<typeof chargeCreateSchema>;
export type ChargeUpdateInput = z.infer<typeof chargeUpdateSchema>;
export type ChargeWaiveInput = z.infer<typeof chargeWaiveSchema>;
