export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

const CUSTOM_BASE_PRICE_CENTS = 22500;
const CUSTOM_EXTRA_DAY_PRICE_CENTS = 7500;

export function calculateCustomPrice(days: number): number {
  if (days <= 0) return 0;
  return CUSTOM_BASE_PRICE_CENTS + (days - 1) * CUSTOM_EXTRA_DAY_PRICE_CENTS;
}