export * from '../../shared/types';

export interface BookingStep {
  id: number;
  name: string;
  href: string;
  status: 'complete' | 'current' | 'upcoming';
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  durationHours: number;
  basePriceCents: number;
}

export interface AvailabilityCheck {
  available: boolean;
  trailerId: string;
  checkedDates: {
    start: string;
    end: string;
  };
}

export interface BookingCreate {
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

export interface BookingResponse {
  bookingNumber: string;
  holdExpiresAt: string;
  rentalEndDate: string;
  pickupDate: string;
  basePriceCents: number;
  totalDueCents: number;
  package: {
    name: string;
    durationHours: number;
  };
}
