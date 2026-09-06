'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import StepIndicator from '@/components/booking/StepIndicator';
import BookingSummary from '@/components/booking/BookingSummary';
import { BOOKING_STEPS, PACKAGES } from '@/lib/constants';
import { useBookingStore } from '@/lib/store';
import { apiPost } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface CheckoutResponse {
  sessionId: string;
  url: string;
  bookingNumber: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const { selectedPackage, customDays, startDate, endDate, customerInfo, setBookingNumber } = useBookingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  if (!packageData || !startDate || !endDate || !customerInfo) {
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

  const handlePay = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiPost<CheckoutResponse>('/api/v1/payments/create-checkout', {
        amountCents: packageData.basePriceCents,
        customerEmail: customerInfo.email,
      });

      if (res.success && res.data?.url) {
        setBookingNumber(res.data.bookingNumber);
        window.location.href = res.data.url;
      } else {
        setError('Unable to start checkout. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach the payment service. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold text-navy">Payment</h1>
      <p className="mt-2 text-gray-600">Review your booking details and proceed to secure checkout.</p>

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
          <h3 className="text-lg font-semibold text-navy">Payment Details</h3>

          <div className="mt-4">
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-semibold">{formatCurrency(packageData.basePriceCents)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePay}
            disabled={isLoading}
            className="mt-6 w-full rounded-md bg-forest px-4 py-3 text-white font-medium hover:bg-forest-600 disabled:opacity-50"
          >
            {isLoading ? 'Redirecting to Stripe...' : `Pay ${formatCurrency(packageData.basePriceCents)}`}
          </button>

          {error && (
            <p className="mt-4 text-center text-sm text-red-600">{error}</p>
          )}

          <p className="mt-4 text-center text-sm text-gray-500">
            Secure payment powered by Stripe
          </p>
        </div>
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