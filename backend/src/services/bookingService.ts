import { generateBookingNumber, generateAgreementToken } from './idGenerator';

interface BookingData {
  packageSlug: string;
  trailerId: string;
  rentalStartDate: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    deliveryAddress: string;
  };
}

interface BookingResult {
  bookingNumber: string;
  agreementToken: string;
  holdExpiresAt: Date;
  rentalEndDate: Date;
  pickupDate: Date;
  basePriceCents: number;
  totalDueCents: number;
  package: {
    name: string;
    durationHours: number;
  };
}

const PACKAGE_PRICES: Record<string, { name: string; durationHours: number; priceCents: number }> = {
  '24h': { name: '24 Hours', durationHours: 24, priceCents: 22500 },
  '3d': { name: '3 Days', durationHours: 72, priceCents: 37500 },
  '7d': { name: '7 Days', durationHours: 168, priceCents: 67500 },
};

export async function createBooking(data: BookingData): Promise<BookingResult> {
  const packageData = PACKAGE_PRICES[data.packageSlug];
  if (!packageData) {
    throw new Error('Invalid package');
  }

  const startDate = new Date(data.rentalStartDate);
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + packageData.durationHours);

  const bookingNumber = generateBookingNumber();
  const agreementToken = generateAgreementToken();
  const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  return {
    bookingNumber,
    agreementToken,
    holdExpiresAt,
    rentalEndDate: endDate,
    pickupDate: endDate,
    basePriceCents: packageData.priceCents,
    totalDueCents: packageData.priceCents,
    package: {
      name: packageData.name,
      durationHours: packageData.durationHours,
    },
  };
}

export async function getBookingByNumber(bookingNumber: string) {
  // In production, fetch from Supabase
  return {
    bookingNumber,
    status: 'confirmed',
    customer: {
      name: 'John Smith',
      email: 'john@example.com',
    },
  };
}
