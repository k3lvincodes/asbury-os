'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import StepIndicator from '@/components/booking/StepIndicator';
import CheckoutForm from '@/components/payment/CheckoutForm';
import { BOOKING_STEPS, PACKAGES } from '@/lib/constants';
import { useBookingStore } from '@/lib/store';

export default function PaymentPage() {
  const router = useRouter();
  const { selectedPackage, customDays } = useBookingStore();
  const [steps] = useState(
    BOOKING_STEPS.map((step, idx) => ({
      ...step,
      status: idx < 5 ? 'complete' as const : idx === 5 ? 'current' as const : 'upcoming' as const,
    }))
  );

  const packageData = selectedPackage === 'custom'
    ? {
        name: `Custom (${customDays} days)`,
        slug: 'custom',
        durationHours: customDays ? customDays * 24 : 24,
        basePriceCents: customDays ? 22500 + (customDays - 1) * 7500 : 22500,
      }
    : PACKAGES.find((p) => p.slug === selectedPackage);

  if (!packageData) {
    return (
      <Container className="py-12">
        <h1 className="text-3xl font-bold text-navy">Payment</h1>
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

  const handlePaymentSuccess = () => {
    router.push('/confirmation');
  };

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold text-navy">Payment</h1>
      <p className="mt-2 text-gray-600">Complete your payment to confirm your booking.</p>
      
      <div className="mt-8">
        <StepIndicator steps={steps} />
      </div>

      <div className="mt-8 max-w-md">
        <CheckoutForm
          amount={packageData.basePriceCents}
          onSubmit={handlePaymentSuccess}
        />
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => router.push('/agreement')}
          className="rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 font-medium hover:bg-gray-50"
        >
          Back
        </button>
      </div>
    </Container>
  );
}
