'use client';

import { useEffect, useState, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import ReservationTable from '@/components/reservations/ReservationTable';
import ReservationFilters from '@/components/reservations/ReservationFilters';
import { apiAuth } from '@/lib/auth';

interface Reservation {
  id: string;
  bookingNumber: string;
  customerName: string;
  packageName: string;
  startDate: string;
  endDate: string;
  amountDueCents: number;
  status: string;
  paymentStatus: string;
}

interface Filters {
  status: string;
  paymentStatus: string;
  dateRange: string;
  search: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    paymentStatus: 'all',
    dateRange: 'all',
    search: '',
  });

  const fetchReservations = useCallback(async (f: Filters) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (f.status !== 'all') params.set('status', f.status);
      if (f.paymentStatus !== 'all') params.set('paymentStatus', f.paymentStatus);
      if (f.search) params.set('search', f.search);
      params.set('limit', '50');

      const res = await apiAuth<Reservation[]>(`/api/v1/admin/reservations?${params.toString()}`);
      if (res.success && res.data) {
        setReservations(res.data);
      } else {
        setError(res.error || 'Failed to load reservations');
      }
    } catch {
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations(filters);
  }, []);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    fetchReservations(newFilters);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold text-navy">Reservations</h1>

          <div className="mt-6">
            <ReservationFilters onFilterChange={handleFilterChange} />
          </div>

          {loading && (
            <div className="mt-6 text-sm text-gray-500">Loading reservations...</div>
          )}

          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="mt-6">
              <ReservationTable data={reservations} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
