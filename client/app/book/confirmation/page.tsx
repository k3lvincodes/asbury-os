'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Container from '@/components/layout/Container';
import { useBookingStore } from '@/lib/store';

export default function ConfirmationPage() {
  const router = useRouter();
  const { reset } = useBookingStore();

  useEffect(() => {
    // In production, this would be the actual booking number from the API
    const bookingNumber = 'AOS-2026-0001';
    
    // Clear the booking store after successful payment
    return () => {
      reset();
    };
  }, [reset]);

  const bookingNumber = 'AOS-2026-0001';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Container className="py-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
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
            
            <h1 className="mt-6 text-3xl font-bold text-primary">
              Booking Confirmed!
            </h1>
            
            <p className="mt-4 text-lg text-gray-600">
              Your booking has been successfully created.
            </p>

            <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
              <p className="text-sm text-gray-600">Your Booking Number</p>
              <p className="mt-2 text-2xl font-bold text-primary">{bookingNumber}</p>
            </div>

            <div className="mt-8 space-y-4">
              <p className="text-gray-600">
                We've sent a confirmation email with your booking details and a secure link to view your reservation.
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
              <button
                onClick={() => router.push('/reservation/token')}
                className="rounded-md bg-accent px-6 py-3 text-white font-medium hover:bg-accent-600"
              >
                View Reservation
              </button>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
