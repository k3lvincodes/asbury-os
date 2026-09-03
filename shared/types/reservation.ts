export interface Reservation {
  id: string;
  bookingNumber: string;
  invoiceNumber?: string;
  customerId: string;
  trailerId: string;
  packageId: string;
  rentalStartDate: Date;
  rentalEndDate: Date;
  pickupDate: Date;
  basePriceCents: number;
  totalChargesCents: number;
  totalRefundedCents: number;
  amountDueCents: number;
  deliveryAddress: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  agreementStatus: AgreementStatus;
  agreementVersion?: string;
  agreementSignedAt?: Date;
  agreementToken?: string;
  signedAgreementUrl?: string;
  holdExpiresAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = 
  | 'pending'
  | 'awaiting_payment'
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type AgreementStatus = 
  | 'not_started'
  | 'pending_signature'
  | 'signed';
