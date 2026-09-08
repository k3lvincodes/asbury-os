'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentBookings from '@/components/dashboard/RecentBookings';
import { apiAuth } from '@/lib/auth';

interface Stats {
  totalReservations: number;
  activeReservations: number;
  totalRevenue: number;
  pendingPayments: number;
}

interface Booking {
  id: string;
  bookingNumber: string;
  customerName: string;
  packageName: string;
  startDate: string;
  amountDueCents: number;
  status: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, reservationsRes] = await Promise.all([
          apiAuth<Stats>('/api/v1/admin/dashboard/stats'),
          apiAuth<Booking[]>('/api/v1/admin/reservations?limit=5'),
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }

        if (reservationsRes.success && reservationsRes.data) {
          setBookings(reservationsRes.data);
        }
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>

          {loading && (
            <div className="mt-6 text-sm text-gray-500">Loading dashboard...</div>
          )}

          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="mt-6">
                <StatsCards
                  totalReservations={stats?.totalReservations ?? 0}
                  activeReservations={stats?.activeReservations ?? 0}
                  totalRevenue={stats?.totalRevenue ?? 0}
                  pendingPayments={stats?.pendingPayments ?? 0}
                />
              </div>

              <div className="mt-8">
                <RecentBookings bookings={bookings} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
