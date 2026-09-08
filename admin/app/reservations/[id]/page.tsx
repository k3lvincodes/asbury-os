'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import ReservationDetail from '@/components/reservations/ReservationDetail';
import { apiAuth } from '@/lib/auth';

interface Reservation {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  packageName: string;
  startDate: string;
  endDate: string;
  pickupDate: string;
  basePriceCents: number;
  totalChargesCents: number;
  amountDueCents: number;
  bookingStatus: string;
  paymentStatus: string;
  agreementStatus: string;
  signatureData?: string;
  notes?: string;
  createdAt: string;
}

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchReservation() {
      try {
        const res = await apiAuth<Reservation>(`/api/v1/admin/reservations/${params.id}`);
        if (res.success && res.data) {
          setReservation(res.data);
        } else {
          setError(res.error || 'Reservation not found');
        }
      } catch {
        setError('Failed to load reservation');
      } finally {
        setLoading(false);
      }
    }
    fetchReservation();
  }, [params.id]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-4">
            <button
              onClick={() => router.push('/reservations')}
              className="text-sm font-medium text-forest hover:text-forest-600"
            >
              ← Back to Reservations
            </button>
          </div>

          {loading && (
            <div className="text-sm text-gray-500">Loading reservation...</div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && reservation && (
            <ReservationDetail reservation={reservation} />
          )}
        </main>
      </div>
    </div>
  );
}
