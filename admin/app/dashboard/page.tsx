'use client';

import Sidebar from '@/components/layout/Sidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentBookings from '@/components/dashboard/RecentBookings';

// Mock data - in production, fetch from API
const mockBookings = [
  {
    id: '1',
    bookingNumber: 'AOS-2026-0001',
    customerName: 'John Smith',
    packageName: '3 Days',
    startDate: '2026-09-10',
    amountDue: 37500,
    status: 'confirmed',
  },
  {
    id: '2',
    bookingNumber: 'AOS-2026-0002',
    customerName: 'Jane Doe',
    packageName: '24 Hours',
    startDate: '2026-09-05',
    amountDue: 22500,
    status: 'pending',
  },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>
          
          <div className="mt-6">
            <StatsCards
              totalReservations={2}
              activeReservations={1}
              totalRevenue={62500}
              pendingPayments={1}
            />
          </div>

          <div className="mt-8">
            <RecentBookings bookings={mockBookings} />
          </div>
        </main>
      </div>
    </div>
  );
}