export const BOOKING_STATUSES = {
  PENDING: 'pending',
  AWAITING_PAYMENT: 'awaiting_payment',
  CONFIRMED: 'confirmed',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
} as const;

export const AGREEMENT_STATUSES = {
  NOT_STARTED: 'not_started',
  PENDING_SIGNATURE: 'pending_signature',
  SIGNED: 'signed',
} as const;

export const CHARGE_STATUSES = {
  DRAFT: 'draft',
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  FAILED: 'failed',
  WAIVED: 'waived',
} as const;
