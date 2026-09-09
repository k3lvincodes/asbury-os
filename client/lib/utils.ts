import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function formatDate(date: Date | string): string {
  // When given a YYYY-MM-DD string, parse it in LOCAL time (not UTC)
  // to avoid the date showing as the previous day in negative-offset timezones
  let d: Date;
  if (typeof date === 'string') {
    const [year, month, day] = date.split('-').map(Number);
    d = new Date(year, month - 1, day);
  } else {
    d = date;
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function calculateEndDate(startDate: Date, durationHours: number): Date {
  const endDate = new Date(startDate);
  // Convert hours to whole days and add them — avoids timezone/DST drift
  const durationDays = Math.round(durationHours / 24);
  endDate.setDate(endDate.getDate() + durationDays);
  // Normalise to midnight local time to keep date comparisons clean
  endDate.setHours(0, 0, 0, 0);
  return endDate;
}

export function getDaysBetween(start: Date, end: Date): number {
  // Normalise both to midnight to avoid DST issues, count inclusive days
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const diffTime = e.getTime() - s.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

const CUSTOM_BASE_PRICE_CENTS = 22500;
const CUSTOM_EXTRA_DAY_PRICE_CENTS = 7500;

export function calculateCustomPrice(days: number, basePrice?: number, extraDayPrice?: number): number {
  if (days <= 0) return 0;
  const base = basePrice ?? CUSTOM_BASE_PRICE_CENTS;
  const extra = extraDayPrice ?? CUSTOM_EXTRA_DAY_PRICE_CENTS;
  return base + (days - 1) * extra;
}
