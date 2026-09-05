export const PACKAGES = {
  '24h': {
    name: '24 Hours',
    slug: '24h',
    durationHours: 24,
    basePriceCents: 22500,
  },
  '3d': {
    name: '3 Days',
    slug: '3d',
    durationHours: 72,
    basePriceCents: 37500,
  },
  '7d': {
    name: '7 Days',
    slug: '7d',
    durationHours: 168,
    basePriceCents: 67500,
  },
} as const;

export const ADDITIONAL_CHARGE_RATES = {
  EXTRA_DAY_CENTS: 7500,
  EXTRA_MILE_CENTS: 300,
  OVERWEIGHT_PER_TON_CENTS: 12500,
  FAILED_PICKUP_FEE_CENTS: 7500,
  CLEANING_FEE_MAX_CENTS: 10000,
  INCLUDED_MILES: 50,
} as const;
