'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Container from '@/components/layout/Container';
import StepIndicator from '@/components/booking/StepIndicator';
import DatePicker from '@/components/booking/DatePicker';
import { BOOKING_STEPS } from '@/lib/constants';
import { useBookingStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';

export default function DatesPage() {
  const router = useRouter();
  const { startDate, endDate, setStartDate, setEndDate, selectedPackage } = useBookingStore();
  const [steps, setSteps] = useState(
    BOOKING_STEPS.map((step, idx) => ({
      ...step,
      status: idx < 1 ? 'complete' as const : idx === 1 ? 'current' as const : 'upcoming' as const,
    }))
  );

  const handleContinue = () => {
    if (startDate && endDate) {
      router.push('/book/info');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Container className="py-12">
          <h1 className="text-3xl font-bold text-primary">Select Dates</h1>
          <p className="mt-2 text-gray-600">Choose your rental start date.</p>
          
          <div className="mt-8">
            <StepIndicator steps={steps} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold text-primary">Start Date</h2>
              <p className="mt-2 text-gray-600">Select when you want to pick up the trailer.</p>
              <div className="mt-4">
                <DatePicker
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    if (date && selectedPackage) {
                      const durationHours = selectedPackage === '24h' ? 24 : selectedPackage === '3d' ? 72 : 168;
                      const end = new Date(date);
                      end.setHours(end.getHours() + durationHours);
                      setEndDate(end);
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-primary">Rental Summary</h2>
              <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
                {startDate && endDate ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Package</span>
                      <span className="font-medium">
                        {selectedPackage === '24h' ? '24 Hours' : selectedPackage === '3d' ? '3 Days' : '7 Days'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date</span>
                      <span className="font-medium">{formatDate(startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date</span>
                      <span className="font-medium">{formatDate(endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pickup Date</span>
                      <span className="font-medium">{formatDate(endDate)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Please select a start date to see your rental summary.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => router.push('/book')}
              className="rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 font-medium hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={!startDate || !endDate}
              className="rounded-md bg-accent px-6 py-3 text-white font-medium hover:bg-accent-600 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
