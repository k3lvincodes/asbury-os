'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import StepIndicator from '@/components/booking/StepIndicator';
import BookingSummary from '@/components/booking/BookingSummary';
import { BOOKING_STEPS, PACKAGES } from '@/lib/constants';
import { useBookingStore } from '@/lib/store';
import { getDaysBetween, calculateCustomPrice } from '@/lib/utils';

export default function ReviewPage() {
  const router = useRouter();
  const { selectedPackage, startDate, endDate, customerInfo, customDays } = useBookingStore();
  const [steps] = useState(
    BOOKING_STEPS.map((step, idx) => ({
      ...step,
      status: idx < 3 ? 'complete' as const : idx === 3 ? 'current' as const : 'upcoming' as const,
    }))
  );

  const packageData = selectedPackage === 'custom'
    ? {
        name: `Custom (${customDays} days)`,
        slug: 'custom',
        durationHours: customDays ? customDays * 24 : 24,
        basePriceCents: calculateCustomPrice(customDays ?? 0),
      }
    : PACKAGES.find((p) => p.slug === selectedPackage);

  if (!packageData || !startDate || !endDate || !customerInfo) {
    return (
      <Container className="py-12">
        <h1 className="text-3xl font-bold text-navy">Review Booking</h1>
        <p className="mt-2 text-gray-600">Please complete the previous steps first.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 rounded-md bg-forest px-6 py-3 text-white font-medium hover:bg-forest-600"
        >
          Start Over
        </button>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold text-navy">Review Booking</h1>
      <p className="mt-2 text-gray-600">Please review your booking details before proceeding.</p>
      
      <div className="mt-8">
        <StepIndicator steps={steps} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <BookingSummary
          packageName={packageData.name}
          startDate={startDate}
          endDate={endDate}
          basePriceCents={packageData.basePriceCents}
          amountDueCents={packageData.basePriceCents}
          deliveryAddress={customerInfo.deliveryAddress}
        />

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-navy">Customer Information</h3>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name</span>
              <span className="font-medium">{customerInfo.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email</span>
              <span className="font-medium">{customerInfo.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone</span>
              <span className="font-medium">{customerInfo.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Address</span>
              <span className="font-medium text-right max-w-[200px]">{customerInfo.deliveryAddress}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => router.push('/info')}
          className="rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 font-medium hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={() => router.push('/agreement')}
          className="rounded-md bg-forest px-6 py-3 text-white font-medium hover:bg-forest-600"
        >
          Continue to Agreement
        </button>
      </div>
    </Container>
  );
}
