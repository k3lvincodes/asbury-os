'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import StepIndicator from '@/components/booking/StepIndicator';
import PackageCard from '@/components/booking/PackageCard';
import type { DateRange } from 'react-day-picker';
import DateRangePicker from '@/components/booking/DateRangePicker';
import Modal from '@/components/Modal';
import { BOOKING_STEPS, PACKAGES } from '@/lib/constants';
import { useBookingStore } from '@/lib/store';
import { cn, getDaysBetween, calculateCustomPrice } from '@/lib/utils';
import { apiGet } from '@/lib/api';

interface AvailabilityResponse {
  trailerId: string;
  month: number;
  year: number;
  bookedDates: string[];
}

export default function HomePage() {
  const router = useRouter();
  const { selectedPackage, setSelectedPackage, setCustomDays, setStartDate, setEndDate, pricing, fetchPricing } = useBookingStore();
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [modalRange, setModalRange] = useState<DateRange | undefined>(undefined);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [steps] = useState(
    BOOKING_STEPS.map((step, idx) => ({
      ...step,
      status: idx === 0 ? 'current' as const : 'upcoming' as const,
    }))
  );

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  useEffect(() => {
    async function fetchAvailability() {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      try {
        const res = await apiGet<AvailabilityResponse>(
          `/api/v1/availability/dates?month=${month}&year=${year}`
        );
        if (res.success && res.data) {
          setBookedDates(res.data.bookedDates);
        }
      } catch {
        // silently fail
      }
    }
    fetchAvailability();
  }, []);

  const handleCustomCardClick = () => {
    setIsCustomModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCustomModalOpen(false);
    setModalRange(undefined);
  };

  const handleModalRangeSelect = (range: DateRange | undefined) => {
    setModalRange(range);
  };

  const handleModalConfirm = () => {
    if (modalRange?.from && modalRange.to) {
      const days = getDaysBetween(modalRange.from, modalRange.to);
      setCustomDays(days);
      setStartDate(modalRange.from);
      setEndDate(modalRange.to);
      setSelectedPackage('custom');
      setIsCustomModalOpen(false);
      router.push('/dates');
    }
  };

  const modalDays = modalRange?.from && modalRange.to ? getDaysBetween(modalRange.from, modalRange.to) : 0;
  const modalPriceCents = calculateCustomPrice(modalDays, pricing.package_24h_price, pricing.extra_day_price);

  const handleContinue = () => {
    if (selectedPackage) {
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
        {PACKAGES.map((pkg) => {
          const priceKey = `package_${pkg.slug}_price` as keyof typeof pricing;
          return (
            <PackageCard
              key={pkg.slug}
              name={pkg.name}
              slug={pkg.slug}
              durationHours={pkg.durationHours}
              basePriceCents={pricing[priceKey] ?? pkg.basePriceCents}
              description={pkg.description}
              isSelected={selectedPackage === pkg.slug}
              onSelect={setSelectedPackage}
            />
          );
        })}

        {/* Custom Duration Card */}
        <div
          className={cn(
            'relative rounded-lg border-2 p-6 cursor-pointer transition-all',
            selectedPackage === 'custom'
              ? 'border-forest bg-forest-light'
              : 'border-gray-200 hover:border-gray-300'
          )}
          onClick={handleCustomCardClick}
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
          <div className="mt-4">
            <span className="text-lg font-semibold text-navy">Select Dates</span>
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

      {/* Custom Date Selection Modal */}
      <Modal
        isOpen={isCustomModalOpen}
        onClose={handleModalClose}
        title="Select Custom Dates"
        className="max-w-md"
      >
        <p className="mb-4 text-sm text-gray-600">
          Select your start date, then your end date. The total days determine your price.
        </p>

        <DateRangePicker
          selected={modalRange}
          onSelect={handleModalRangeSelect}
          bookedDates={bookedDates}
        />

        {modalRange?.from && modalRange.to && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-forest-light border border-forest/20 px-4 py-3">
            <span className="text-sm text-gray-600">Total ({modalDays} day{modalDays !== 1 ? 's' : ''})</span>
            <span className="text-lg font-bold text-forest">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(modalPriceCents / 100)}
            </span>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleModalClose}
            className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleModalConfirm}
            disabled={!modalRange?.from || !modalRange.to}
            className="rounded-md bg-forest px-5 py-2.5 text-white font-medium hover:bg-forest-600 disabled:opacity-50"
          >
            Confirm Dates
          </button>
        </div>
      </Modal>
    </Container>
  );
}
