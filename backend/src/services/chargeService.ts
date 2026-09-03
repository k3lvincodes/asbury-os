interface ChargeData {
  reservationId: string;
  chargeType: string;
  description?: string;
  quantity: number;
  unitPriceCents: number;
  adminNotes?: string;
  createdBy?: string;
}

const CHARGE_RATES: Record<string, number> = {
  overweight: 12500, // per ton
  extra_day: 7500,
  extra_mileage: 300, // per mile
  failed_pickup: 7500,
  cleaning: 0, // manual entry
  damage: 0, // manual entry
  prohibited_material: 0, // manual entry
  custom: 0, // manual entry
};

export async function createCharge(data: ChargeData) {
  const totalCents = data.quantity * data.unitPriceCents;

  // In production, store in Supabase
  return {
    id: 'charge_123',
    ...data,
    totalCents,
    status: 'draft',
    createdAt: new Date(),
  };
}

export async function calculateChargeAmount(
  chargeType: string,
  quantity: number,
  settings: Record<string, number>
): Promise<number> {
  const rate = CHARGE_RATES[chargeType] || 0;
  return quantity * rate;
}

export async function getChargesForReservation(reservationId: string) {
  // In production, fetch from Supabase
  return [];
}

export async function updateChargeStatus(chargeId: string, status: string) {
  // In production, update in Supabase
  return {
    id: chargeId,
    status,
    updatedAt: new Date(),
  };
}

export async function waiveCharge(chargeId: string, adminId: string, reason: string) {
  // In production, update in Supabase
  return {
    id: chargeId,
    status: 'waived',
    waivedBy: adminId,
    waivedAt: new Date(),
    reason,
  };
}
