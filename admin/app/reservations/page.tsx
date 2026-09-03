'use client';

import Sidebar from '@/components/layout/Sidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import ReservationTable from '@/components/reservations/ReservationTable';
import ReservationFilters from '@/components/reservations/ReservationFilters';

// Mock data - in production, fetch from API
const mockReservations = [
  {
    id: '1',
    bookingNumber: 'AOS-2026-0001',
    customerName: 'John Smith',
    packageName: '3 Days',
    startDate: '2026-09-10',
    endDate: '2026-09-13',
    amountDue: 40000,
    bookingStatus: 'confirmed',
    paymentStatus: 'paid',
  },
  {
    id: '2',
    bookingNumber: 'AOS-2026-0002',
    customerName: 'Jane Doe',
    packageName: '24 Hours',
    startDate: '2026-09-05',
    endDate: '2026-09-06',
    amountDue: 22500,
    bookingStatus: 'pending',
    paymentStatus: 'pending',
  },
];

export default function ReservationsPage() {
  const handleFilterChange = (filters: any) => {
    console.log('Filters:', filters);
    // In production, fetch filtered reservations from API
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold text-gray-900">Reservations</h1>
          
          <div className="mt-6">
            <ReservationFilters onFilterChange={handleFilterChange} />
          </div>

          <div className="mt-6">
            <ReservationTable data={mockReservations} />
          </div>
        </main>
      </div>
    </div>
  );
}
