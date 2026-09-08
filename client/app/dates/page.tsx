'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import StepIndicator from '@/components/booking/StepIndicator';
import DatePicker from '@/components/booking/DatePicker';
import { BOOKING_STEPS } from '@/lib/constants';
import { useBookingStore } from '@/lib/store';
import { formatDate, calculateEndDate, getDaysBetween, calculateCustomPrice } from '@/lib/utils';
import { apiGet, apiPost } from '@/lib/api';

interface AvailabilityResponse {
  trailerId: string;
  month: number;
  year: number;
  bookedDates: string[];
}

interface CheckResponse {
  available: boolean;
  startDate?: string;
  endDate?: string;
  requestedStart?: string;
  requestedEnd?: string;
  suggestions?: { startDate: string; endDate: string }[];
}

export default function DatesPage() {
  const router = useRouter();
  const { startDate, endDate, setStartDate, setEndDate, selectedPackage, customDays, pricing, fetchPricing } = useBookingStore();
  const [bookedDates, setBookedDates] = useState<string[]>([]);

  useEffect(() => { fetchPricing(); }, [fetchPricing]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [suggestions, setSuggestions] = useState<{ startDate: string; endDate: string }[]>([]);
  const [steps] = useState(
    BOOKING_STEPS.map((step, idx) => ({
      ...step,
      status: idx < 1 ? 'complete' as const : idx === 1 ? 'current' as const : 'upcoming' as const,
    }))
  );

  const isCustom = selectedPackage === 'custom';

  useEffect(() => {
    async function fetchAvailability() {
      setLoadingAvailability(true);
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
        // silently fail — calendar will just show all dates as available
      } finally {
        setLoadingAvailability(false);
      }
    }
    fetchAvailability();
  }, []);

  const getDurationDays = (): number => {
    if (isCustom && customDays) return customDays;
    if (selectedPackage === '24h') return 1;
    if (selectedPackage === '3d') return 3;
    if (selectedPackage === '7d') return 7;
    return 1;
  };

  const toLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const checkAvailability = async (start: Date, end: Date) => {
    setCheckingAvailability(true);
    setAvailabilityError('');
    setSuggestions([]);

    try {
      const res = await apiPost<CheckResponse>('/api/v1/availability/check', {
        startDate: toLocalDateString(start),
        endDate: toLocalDateString(end),
        durationDays: getDurationDays(),
      });

      if (res.success && res.data) {
        if (res.data.available) {
          setAvailabilityError('');
          setSuggestions([]);
        } else {
          setAvailabilityError(
            `The trailer is not available from ${formatDate(start)} to ${formatDate(end)}. Some days in this period are already booked.`
          );
          setSuggestions(res.data.suggestions || []);
        }
      }
    } catch {
      setAvailabilityError('Unable to check availability. Please try again.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (!date) {
      setStartDate(null);
      setEndDate(null);
      setAvailabilityError('');
      setSuggestions([]);
      return;
    }

    setStartDate(date);
    setAvailabilityError('');
    setSuggestions([]);

    if (!isCustom && selectedPackage) {
      const durationHours = selectedPackage === '24h' ? 24 : selectedPackage === '3d' ? 72 : 168;
      const end = calculateEndDate(date, durationHours);
      setEndDate(end);
      checkAvailability(date, end);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (!date) {
      setEndDate(null);
      setAvailabilityError('');
      setSuggestions([]);
      return;
    }

    setEndDate(date);
    setAvailabilityError('');
    setSuggestions([]);

    if (startDate) {
      checkAvailability(startDate, date);
    }
  };

  const handleSuggestionSelect = (suggestion: { startDate: string; endDate: string }) => {
    const start = new Date(suggestion.startDate + 'T00:00:00');
    const end = new Date(suggestion.endDate + 'T00:00:00');
    setStartDate(start);
    setEndDate(end);
    setAvailabilityError('');
    setSuggestions([]);
  };

  const handleContinue = () => {
    if (startDate && endDate && !availabilityError) {
      router.push('/info');
    }
  };

  const customPriceCents = startDate && endDate
    ? calculateCustomPrice(getDaysBetween(startDate, endDate), pricing.package_24h_price, pricing.extra_day_price)
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
            {loadingAvailability ? (
              <p className="text-sm text-gray-500">Loading availability...</p>
            ) : (
              <DatePicker
                selected={startDate ?? undefined}
                onSelect={handleStartDateSelect}
                disabledDates={endDate ? [endDate] : []}
                bookedDates={bookedDates}
              />
            )}
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
              {loadingAvailability ? (
                <p className="text-sm text-gray-500">Loading availability...</p>
              ) : (
                <DatePicker
                  selected={endDate ?? undefined}
                  onSelect={handleEndDateSelect}
                  minDate={startDate ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000) : undefined}
                  disabledDates={startDate ? [startDate] : []}
                  bookedDates={bookedDates}
                />
              )}
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
                    <span className="text-gray-600">Return Date</span>
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

      {/* Checking availability indicator */}
      {checkingAvailability && (
        <div className="mt-6 rounded-md bg-blue-50 p-4">
          <p className="text-sm text-blue-700">Checking availability...</p>
        </div>
      )}

      {/* Availability error with suggestions */}
      {availabilityError && !checkingAvailability && (
        <div className="mt-6 rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{availabilityError}</p>
          {suggestions.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-red-700">Available alternatives:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionSelect(sug)}
                    className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    {formatDate(new Date(sug.startDate + 'T00:00:00'))} – {formatDate(new Date(sug.endDate + 'T00:00:00'))}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
              <span className="text-gray-600">Return Date</span>
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

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          onClick={() => router.push('/')}
          className="rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 font-medium hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!startDate || !endDate || !!availabilityError || checkingAvailability}
          className="rounded-md bg-forest px-6 py-3 text-white font-medium hover:bg-forest-600 disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </Container>
  );
}
