'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import StepIndicator from '@/components/booking/StepIndicator';
import DatePicker from '@/components/booking/DatePicker';
import { BOOKING_STEPS } from '@/lib/constants';
import { useBookingStore } from '@/lib/store';
import { formatDate, calculateEndDate, getDaysBetween } from '@/lib/utils';

export default function DatesPage() {
  const router = useRouter();
  const { startDate, endDate, setStartDate, setEndDate, selectedPackage, customDays } = useBookingStore();
  const [steps] = useState(
    BOOKING_STEPS.map((step, idx) => ({
      ...step,
      status: idx < 1 ? 'complete' as const : idx === 1 ? 'current' as const : 'upcoming' as const,
    }))
  );

  const isCustom = selectedPackage === 'custom';

  const handleStartDateSelect = (date: Date | undefined) => {
    if (!date) {
      setStartDate(null);
      setEndDate(null);
      return;
    }

    setStartDate(date);

    if (!isCustom && selectedPackage) {
      // Auto-calculate end date for standard packages
      const durationHours = selectedPackage === '24h' ? 24 : selectedPackage === '3d' ? 72 : 168;
      const end = calculateEndDate(date, durationHours);
      setEndDate(end);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (!date) {
      setEndDate(null);
      return;
    }
    setEndDate(date);
  };

  const handleContinue = () => {
    if (startDate && endDate) {
      router.push('/info');
    }
  };

  // Custom pricing: $225 base + $75 per extra day
  const customPriceCents = startDate && endDate
    ? 22500 + Math.max(0, getDaysBetween(startDate, endDate) - 1) * 7500
    : 0;

  const packageName = selectedPackage === '24h' ? '24 Hours'
    : selectedPackage === '3d' ? '3 Days'
    : selectedPackage === '7d' ? '7 Days'
    : `Custom (${customDays} days)`;

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold text-navy">Select Dates</h1>
      <p className="mt-2 text-gray-600">Choose your rental start date.</p>
      
      <div className="mt-8">
        <StepIndicator steps={steps} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-navy">Start Date</h2>
          <p className="mt-2 text-gray-600">Select when you want to pick up the trailer.</p>
          <div className="mt-4">
            <DatePicker
              selected={startDate ?? undefined}
              onSelect={handleStartDateSelect}
              disabledDates={endDate ? [endDate] : []}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-navy">
            {isCustom ? 'End Date' : 'Rental Summary'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isCustom ? 'Select when you want to return the trailer.' : 'Your rental details.'}
          </p>
          {isCustom ? (
            <div className="mt-4">
              <DatePicker
                selected={endDate ?? undefined}
                onSelect={handleEndDateSelect}
                minDate={startDate ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000) : undefined}
                disabledDates={startDate ? [startDate] : []}
              />
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
              {startDate && endDate ? (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Package</span>
                    <span className="font-medium">{packageName}</span>
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
          )}
        </div>
      </div>

      {/* Custom Rental Summary */}
      {isCustom && startDate && endDate && (
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-navy">Rental Summary</h3>
          <div className="mt-4 space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Package</span>
              <span className="font-medium">{packageName}</span>
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
            <div className="flex justify-between border-t border-gray-200 pt-4">
              <span className="text-gray-600 font-medium">Total</span>
              <span className="text-lg font-bold text-navy">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(customPriceCents / 100)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => router.push('/')}
          className="rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 font-medium hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!startDate || !endDate}
          className="rounded-md bg-forest px-6 py-3 text-white font-medium hover:bg-forest-600 disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </Container>
  );
}
