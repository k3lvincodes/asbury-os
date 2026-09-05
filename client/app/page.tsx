'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import StepIndicator from '@/components/booking/StepIndicator';
import PackageCard from '@/components/booking/PackageCard';
import { BOOKING_STEPS, PACKAGES } from '@/lib/constants';
import { useBookingStore } from '@/lib/store';
import { cn, formatCurrency } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const { selectedPackage, setSelectedPackage, setCustomDays } = useBookingStore();
  const [customDaysInput, setCustomDaysInput] = useState<number>(1);
  const [steps] = useState(
    BOOKING_STEPS.map((step, idx) => ({
      ...step,
      status: idx === 0 ? 'current' as const : 'upcoming' as const,
    }))
  );

  // Custom pricing: $225 base + $75 per extra day
  const customPriceCents = customDaysInput > 0 ? 22500 + (customDaysInput - 1) * 7500 : 0;

  const handleContinue = () => {
    if (selectedPackage) {
      if (selectedPackage === 'custom') {
        setCustomDays(customDaysInput);
      }
      router.push('/dates');
    }
  };

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold text-navy">Book a Trailer</h1>
      <p className="mt-2 text-gray-600">Select your rental package to get started.</p>
      
      <div className="mt-8">
        <StepIndicator steps={steps} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PACKAGES.map((pkg) => (
          <PackageCard
            key={pkg.slug}
            name={pkg.name}
            slug={pkg.slug}
            durationHours={pkg.durationHours}
            basePriceCents={pkg.basePriceCents}
            description={pkg.description}
            isSelected={selectedPackage === pkg.slug}
            onSelect={setSelectedPackage}
          />
        ))}

        {/* Custom Duration Card */}
        <div
          className={cn(
            'relative rounded-lg border-2 p-6 cursor-pointer transition-all',
            selectedPackage === 'custom'
              ? 'border-forest bg-forest-light'
              : 'border-gray-200 hover:border-gray-300'
          )}
          onClick={() => setSelectedPackage('custom')}
        >
          {selectedPackage === 'custom' && (
            <div className="absolute top-2 right-2">
              <svg
                className="h-6 w-6 text-forest"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}
          <h3 className="text-xl font-semibold text-navy">Custom</h3>
          <p className="mt-2 text-sm text-gray-600">Choose your own rental duration</p>

          {selectedPackage === 'custom' && (
            <div className="mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Days</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={customDaysInput}
                  onChange={(e) => setCustomDaysInput(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <span className="text-3xl font-bold text-navy">
              {formatCurrency(customPriceCents)}
            </span>
            <span className="text-sm text-gray-500"> / {customDaysInput} day{customDaysInput !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!selectedPackage}
          className="rounded-md bg-forest px-6 py-3 text-white font-medium hover:bg-forest-600 disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </Container>
  );
}
