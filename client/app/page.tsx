'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import StepIndicator from '@/components/booking/StepIndicator';
import PackageCard from '@/components/booking/PackageCard';
import DatePicker from '@/components/booking/DatePicker';
import Modal from '@/components/Modal';
import { BOOKING_STEPS, PACKAGES } from '@/lib/constants';
import { useBookingStore } from '@/lib/store';
import { cn, formatDate, getDaysBetween } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const { selectedPackage, setSelectedPackage, setCustomDays, setStartDate, setEndDate } = useBookingStore();
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [modalStartDate, setModalStartDate] = useState<Date | null>(null);
  const [modalEndDate, setModalEndDate] = useState<Date | null>(null);
  const [steps] = useState(
    BOOKING_STEPS.map((step, idx) => ({
      ...step,
      status: idx === 0 ? 'current' as const : 'upcoming' as const,
    }))
  );

  const handleCustomCardClick = () => {
    setIsCustomModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCustomModalOpen(false);
    setModalStartDate(null);
    setModalEndDate(null);
  };

  const handleModalStartDateSelect = (date: Date | undefined) => {
    setModalStartDate(date ?? null);
    setModalEndDate(null);
  };

  const handleModalEndDateSelect = (date: Date | undefined) => {
    setModalEndDate(date ?? null);
  };

  const handleModalConfirm = () => {
    if (modalStartDate && modalEndDate) {
      const days = getDaysBetween(modalStartDate, modalEndDate);
      setCustomDays(days);
      setStartDate(modalStartDate);
      setEndDate(modalEndDate);
      setSelectedPackage('custom');
      setIsCustomModalOpen(false);
      router.push('/dates');
    }
  };

  // Custom pricing: $225 base + $75 per extra day
  const modalDays = modalStartDate && modalEndDate ? getDaysBetween(modalStartDate, modalEndDate) : 0;
  const modalPriceCents = modalDays > 0 ? 22500 + (modalDays - 1) * 7500 : 0;

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
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-gray-200 p-4">
              <label className="block text-sm font-semibold text-navy mb-3">Start Date</label>
              <DatePicker
                selected={modalStartDate ?? undefined}
                onSelect={handleModalStartDateSelect}
              />
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <label className="block text-sm font-semibold text-navy mb-3">End Date</label>
              <DatePicker
                selected={modalEndDate ?? undefined}
                onSelect={handleModalEndDateSelect}
                minDate={modalStartDate ? new Date(modalStartDate.getTime() + 24 * 60 * 60 * 1000) : undefined}
                disabledDates={modalStartDate ? [modalStartDate] : []}
              />
            </div>
          </div>

          {modalStartDate && modalEndDate && (
            <div className="rounded-lg bg-forest-light border border-forest/20 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-lg font-bold text-navy">{modalDays} day{modalDays !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="text-lg font-bold text-forest">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(modalPriceCents / 100)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleModalClose}
              className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleModalConfirm}
              disabled={!modalStartDate || !modalEndDate}
              className="rounded-md bg-forest px-5 py-2.5 text-white font-medium hover:bg-forest-600 disabled:opacity-50"
            >
              Confirm Dates
            </button>
          </div>
        </div>
      </Modal>
    </Container>
  );
}
