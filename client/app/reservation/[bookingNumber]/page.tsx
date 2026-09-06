'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Container from '@/components/layout/Container';
import { apiGet } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

interface BookingData {
  bookingNumber: string;
  status: string;
  customer: { name: string; email: string };
  package?: { name: string; durationHours: number };
  rentalStartDate?: string;
  rentalEndDate?: string;
  basePriceCents?: number;
  deliveryAddress?: string;
  agreementStatus?: string;
}

export default function ReservationPage() {
  const { bookingNumber } = useParams<{ bookingNumber: string }>();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingNumber) return;
    setLoading(true);
    setError(null);

    apiGet<BookingData>(`/api/v1/bookings/${bookingNumber}`)
      .then((res) => {
        if (res.success && res.data) {
          setBooking(res.data);
        } else {
          setError('Reservation not found. Please check your booking number.');
        }
      })
      .catch(() => {
        setError('Unable to reach the server. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, [bookingNumber]);

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold text-navy">Reservation</h1>
      <p className="mt-2 text-gray-600">
        Booking: <span className="font-semibold text-navy">{bookingNumber}</span>
      </p>

      {loading && (
        <div className="mt-8 text-center text-gray-500">Loading reservation...</div>
      )}

      {error && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {booking && !loading && (
        <div className="mt-8 max-w-2xl space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-navy">Booking Details</h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="font-medium capitalize">{booking.status}</span>
              </div>
              {booking.package && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Package</span>
                  <span className="font-medium">{booking.package.name}</span>
                </div>
              )}
              {booking.rentalStartDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Rental Period</span>
                  <span className="font-medium">
                    {formatDate(booking.rentalStartDate)}
                    {booking.rentalEndDate && ` – ${formatDate(booking.rentalEndDate)}`}
                  </span>
                </div>
              )}
              {booking.deliveryAddress && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Address</span>
                  <span className="font-medium text-right max-w-[280px]">{booking.deliveryAddress}</span>
                </div>
              )}
              {booking.basePriceCents != null && (
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-semibold text-navy">{formatCurrency(booking.basePriceCents)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-navy">Customer</h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name</span>
                <span className="font-medium">{booking.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email</span>
                <span className="font-medium">{booking.customer.email}</span>
              </div>
              {booking.agreementStatus && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Agreement</span>
                  <span className="font-medium capitalize">{booking.agreementStatus.replace('_', ' ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}