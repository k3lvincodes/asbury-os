import { z } from 'zod';

export const paymentCreateSchema = z.object({
  reservationId: z.string().uuid(),
  amountCents: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Invalid currency code').default('usd'),
  paymentType: z.enum(['booking', 'additional_charge', 'refund']),
  chargeId: z.string().uuid().optional(),
});

export const refundCreateSchema = z.object({
  amountCents: z.number().positive('Amount must be positive').optional(),
  reason: z.string().optional(),
});

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type RefundCreateInput = z.infer<typeof refundCreateSchema>;
