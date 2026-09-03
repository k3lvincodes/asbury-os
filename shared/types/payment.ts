export interface Payment {
  id: string;
  reservationId: string;
  stripePaymentId?: string;
  stripeSessionId?: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  paymentType: PaymentType;
  chargeId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus = 
  | 'pending'
  | 'successful'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type PaymentType = 
  | 'booking'
  | 'additional_charge'
  | 'refund';
