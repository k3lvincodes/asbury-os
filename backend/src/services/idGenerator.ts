import { nanoid } from 'nanoid';

export function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `AOS-${year}-${random}`;
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}-${random}`;
}

export function calculateEndDate(startDate: Date, durationHours: number): Date {
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + durationHours);
  return endDate;
}

export function calculatePickupDate(endDate: Date): Date {
  // Pickup date is the same as end date
  return new Date(endDate);
}

export function generateAgreementToken(): string {
  return nanoid(32);
}
