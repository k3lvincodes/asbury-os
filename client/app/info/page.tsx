'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import StepIndicator from '@/components/booking/StepIndicator';
import CustomerForm from '@/components/booking/CustomerForm';
import { BOOKING_STEPS } from '@/lib/constants';
import { useBookingStore } from '@/lib/store';

export default function InfoPage() {
  const router = useRouter();
  const { setCustomerInfo } = useBookingStore();
  const [steps] = useState(
    BOOKING_STEPS.map((step, idx) => ({
      ...step,
      status: idx < 2 ? 'complete' as const : idx === 2 ? 'current' as const : 'upcoming' as const,
    }))
  );

  const handleSubmit = (data: any) => {
    setCustomerInfo(data);
    router.push('/review');
  };

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold text-navy">Customer Information</h1>
      <p className="mt-2 text-gray-600">Please provide your contact and delivery details.</p>
      
      <div className="mt-8">
        <StepIndicator steps={steps} />
      </div>

      <div className="mt-8 max-w-2xl">
        <CustomerForm onSubmit={handleSubmit} />
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => router.push('/dates')}
          className="rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 font-medium hover:bg-gray-50"
        >
          Back
        </button>
      </div>
    </Container>
  );
}
