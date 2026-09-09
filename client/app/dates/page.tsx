'use client';

import { useState, useEffect, useCallback } from 'react';
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

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export default function DatesPage() {
  const router = useRouter();
  const {
    startDate, endDate,
    setStartDate, setEndDate,
    selectedPackage, customDays,
    pricing, fetchPricing,
  } = useBookingStore();

  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [suggestions, setSuggestions] = useState<{ startDate: string; endDate: string }[]>([]);
  const [fetchedMonths, setFetchedMonths] = useState<Set<string>>(new Set());

  const [steps] = useState(
    BOOKING_STEPS.map((step, idx) => ({
      ...step,
      status: idx < 1 ? 'complete' as const : idx === 1 ? 'current' as const : 'upcoming' as const,
    }))
  );

  useEffect(() => { fetchPricing(); }, [fetchPricing]);

  const isCustom = selectedPackage === 'custom';

  const getDurationDays = (): number => {
    if (isCustom) return customDays ?? 1;
    if (selectedPackage === '24h') return 1;
    if (selectedPackage === '3d') return 3;
    if (selectedPackage === '7d') return 7;
    return 1;
  };

  const fetchAvailabilityForMonth = useCallback(async (month: number, year: number) => {
    const key = `${year}-${month}`;
    if (fetchedMonths.has(key)) return;
    try {
      const res = await apiGet<AvailabilityResponse>(
        `/api/v1/availability/dates?month=${month}&year=${year}`
      );
      if (res.success && res.data) {
        setBookedDates(prev => {
          const existing = new Set(prev);
          res.data!.bookedDates.forEach(d => existing.add(d));
          return Array.from(existing);
        });
        setFetchedMonths(prev => new Set([...prev, key]));
      }
    } catch { /* silently fail */ }
  }, [fetchedMonths]);

  useEffect(() => {
    const now = new Date();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();
    const nextM = m === 12 ? 1 : m + 1;
    const nextY = m === 12 ? y + 1 : y;
    setLoadingAvailability(true);
    Promise.all([
      fetchAvailabilityForMonth(m, y),
      fetchAvailabilityForMonth(nextM, nextY),
    ]).finally(() => setLoadingAvailability(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMonthChange = useCallback((date: Date) => {
    fetchAvailabilityForMonth(date.getMonth() + 1, date.getFullYear());
  }, [fetchAvailabilityForMonth]);

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
      if (res.success && res.data && !res.data.available) {
        setAvailabilityError(
          `The trailer is not available from ${formatDate(start)} to ${formatDate(end)}. Some days in this period are already booked.`
        );
        setSuggestions(res.data.suggestions || []);
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
    const normalised = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    setStartDate(normalised);
    setAvailabilityError('');
    setSuggestions([]);

    if (!isCustom && selectedPackage) {
      const durationHours = selectedPackage === '24h' ? 24 : selectedPackage === '3d' ? 72 : 168;
      const end = calculateEndDate(normalised, durationHours);
      setEndDate(end);
      checkAvailability(normalised, end);
    } else {
      setEndDate(null);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (!date) {
      setEndDate(null);
      setAvailabilityError('');
      setSuggestions([]);
      return;
    }
    const normalised = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    setEndDate(normalised);
    setAvailabilityError('');
    setSuggestions([]);
    if (startDate) checkAvailability(startDate, normalised);
  };

  const handleSuggestionSelect = (suggestion: { startDate: string; endDate: string }) => {
    setStartDate(toLocalDate(suggestion.startDate));
    setEndDate(toLocalDate(suggestion.endDate));
    setAvailabilityError('');
    setSuggestions([]);
  };

  const handleContinue = () => {
    if (startDate && endDate && !availabilityError && !checkingAvailability) {
      router.push('/info');
    }
  };

  const actualDays = startDate && endDate ? getDaysBetween(startDate, endDate) : 0;
  const customPriceCents = isCustom && actualDays > 0
    ? calculateCustomPrice(actualDays, pricing.package_24h_price, pricing.extra_day_price)
    : 0;

  const packageName = selectedPackage === '24h' ? '24 Hours'
    : selectedPackage === '3d' ? '3 Days'
    : selectedPackage === '7d' ? '7 Days'
    : actualDays > 0 ? `Custom (${actualDays} day${actualDays !== 1 ? 's' : ''})`
    : `Custom (${customDays ?? '?'} days)`;

  const startDisabled = endDate
    ? [new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())]
    : [];
  const endMinDate = startDate
    ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1)
    : undefined;
  const endDisabled = startDate
    ? [new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())]
    : [];

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
                disabledDates={startDisabled}
                bookedDates={bookedDates}
                onMonthChange={handleMonthChange}
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
                  minDate={endMinDate}
                  disabledDates={endDisabled}
                  bookedDates={bookedDates}
                  onMonthChange={handleMonthChange}
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
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{actualDays} day{actualDays !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Please select a start date to see your rental summary.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {checkingAvailability && (
        <div className="mt-6 rounded-md bg-blue-50 p-4">
          <p className="text-sm text-blue-700">Checking availability...</p>
        </div>
      )}

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
                    {formatDate(sug.startDate)} â€“ {formatDate(sug.endDate)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
              <span className="text-gray-600">Duration</span>
              <span className="font-medium">{actualDays} days</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-4">
              <span className="text-gray-600 font-medium">Estimated Total</span>
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
          className="rounded-md bg-forest px-6 py-3 text-white font-medium hover:bg-forest-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checkingAvailability ? 'Checking...' : 'Continue'}
        </button>
      </div>
    </Container>
  );
}
