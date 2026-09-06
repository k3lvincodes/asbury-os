'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Container from '@/components/layout/Container';
import { useBookingStore } from '@/lib/store';

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { bookingNumber: storeBookingNumber, reset } = useBookingStore();
  const bookingNumber = searchParams.get('booking') || storeBookingNumber;

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-50">
          <svg
            className="h-8 w-8 text-forest"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        
        <h1 className="mt-6 text-3xl font-bold text-navy">
          Booking Confirmed!
        </h1>
        
        <p className="mt-4 text-lg text-gray-600">
          Your booking has been successfully created.
        </p>

        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">Your Booking Number</p>
          <p className="mt-2 text-2xl font-bold text-navy">
            {bookingNumber || '—'}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <p className="text-gray-600">
            We have sent a confirmation email with your booking details and a secure link to view your reservation.
          </p>
          
          <p className="text-gray-600">
            You can use your booking number to access your reservation details at any time.
          </p>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => router.push('/')}
            className="rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 font-medium hover:bg-gray-50"
          >
            Return Home
          </button>
          {bookingNumber && (
            <button
              onClick={() => router.push(`/reservation/${bookingNumber}`)}
              className="rounded-md bg-forest px-6 py-3 text-white font-medium hover:bg-forest-600"
            >
              View Reservation
            </button>
          )}
        </div>
      </div>
    </Container>
  );
}