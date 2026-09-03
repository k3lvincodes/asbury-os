'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Container from '@/components/layout/Container';
import StepIndicator from '@/components/booking/StepIndicator';
import PackageCard from '@/components/booking/PackageCard';
import { BOOKING_STEPS, PACKAGES } from '@/lib/constants';
import { useBookingStore } from '@/lib/store';

export default function BookPage() {
  const router = useRouter();
  const { selectedPackage, setSelectedPackage } = useBookingStore();
  const [steps, setSteps] = useState(
    BOOKING_STEPS.map((step, idx) => ({
      ...step,
      status: idx === 0 ? 'current' as const : 'upcoming' as const,
    }))
  );

  const handleContinue = () => {
    if (selectedPackage) {
      router.push('/book/dates');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Container className="py-12">
          <h1 className="text-3xl font-bold text-primary">Book a Trailer</h1>
          <p className="mt-2 text-gray-600">Select your rental package to get started.</p>
          
          <div className="mt-8">
            <StepIndicator steps={steps} />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleContinue}
              disabled={!selectedPackage}
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
