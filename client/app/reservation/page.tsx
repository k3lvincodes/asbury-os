'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';

export default function ReservationLookupPage() {
  const router = useRouter();
  const [bookingNumber, setBookingNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = bookingNumber.trim();
    if (trimmed) {
      router.push(`/reservation/${trimmed}`);
    }
  };

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-3xl font-bold text-navy">View Your Reservation</h1>
        <p className="mt-2 text-gray-600">Enter your booking number to view reservation details.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="booking-number" className="block text-sm font-medium text-gray-700">
              Booking Number
            </label>
            <input
              id="booking-number"
              type="text"
              placeholder="AOS-2026-XXXX"
              value={bookingNumber}
              onChange={(e) => setBookingNumber(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-center text-lg font-mono shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          <button
            type="submit"
            disabled={!bookingNumber.trim()}
            className="w-full rounded-md bg-forest px-4 py-3 text-white font-medium hover:bg-forest-600 disabled:opacity-50"
          >
            Look Up Reservation
          </button>
        </form>
      </div>
    </Container>
  );
}