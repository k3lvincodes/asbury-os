export interface AdditionalCharge {
  id: string;
  reservationId: string;
  chargeType: ChargeType;
  description?: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  status: ChargeStatus;
  adminNotes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ChargeType = 
  | 'overweight'
  | 'extra_day'
  | 'extra_mileage'
  | 'failed_pickup'
  | 'cleaning'
  | 'damage'
  | 'prohibited_material'
  | 'custom';

export type ChargeStatus = 
  | 'draft'
  | 'pending_payment'
  | 'paid'
  | 'failed'
  | 'waived';
