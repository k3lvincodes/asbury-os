'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import AdminHeader from '@/components/layout/AdminHeader';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface BookingEvent {
  id: string;
  bookingNumber: string;
  customerName: string;
  startDate: string;
  endDate: string;
  status: string;
}

// Mock data - in production, fetch from API
const mockBookings: BookingEvent[] = [
  { id: '1', bookingNumber: 'AOS-2026-0001', customerName: 'John Smith', startDate: '2026-09-10', endDate: '2026-09-13', status: 'confirmed' },
  { id: '2', bookingNumber: 'AOS-2026-0002', customerName: 'Jane Doe', startDate: '2026-09-05', endDate: '2026-09-06', status: 'pending' },
  { id: '3', bookingNumber: 'AOS-2026-0003', customerName: 'Bob Wilson', startDate: '2026-09-15', endDate: '2026-09-22', status: 'confirmed' },
  { id: '4', bookingNumber: 'AOS-2026-0004', customerName: 'Alice Brown', startDate: '2026-09-20', endDate: '2026-09-21', status: 'active' },
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-forest text-white',
  pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  active: 'bg-blue-100 text-blue-800 border border-blue-300',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedBooking, setSelectedBooking] = useState<BookingEvent | null>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getBookingsForDay = (day: number): BookingEvent[] => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mockBookings.filter((b) => dateStr >= b.startDate && dateStr <= b.endDate);
  };

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDay, daysInMonth]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-navy">Calendar</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={prevMonth}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ← Prev
              </button>
              <span className="text-lg font-semibold text-navy">
                {MONTHS[currentMonth]} {currentYear}
              </span>
              <button
                onClick={nextMonth}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-forest" />
              <span className="text-gray-600">Confirmed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="text-gray-600">Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">Active</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {DAYS.map((day) => (
                <div key={day} className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const bookings = day ? getBookingsForDay(day) : [];
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] border-b border-r border-gray-100 p-1.5 ${
                      day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                    }`}
                  >
                    {day && (
                      <>
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                            isToday ? 'bg-forest text-white' : 'text-gray-700'
                          }`}
                        >
                          {day}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {bookings.map((booking) => (
                            <button
                              key={booking.id}
                              onClick={() => setSelectedBooking(booking)}
                              className={`w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium leading-tight ${
                                statusColors[booking.status] || 'bg-gray-100 text-gray-600'
                              }`}
                              title={`${booking.bookingNumber} - ${booking.customerName}`}
                            >
                              {booking.customerName}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-navy">All Bookings This Month</h2>
            <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Booking #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {mockBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-forest">{booking.bookingNumber}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{booking.customerName}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{booking.startDate} → {booking.endDate}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                          : booking.status === 'active' ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Booking Detail Modal */}
          {selectedBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-navy">{selectedBooking.bookingNumber}</h3>
                  <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Customer</span>
                    <span className="text-sm font-medium text-gray-900">{selectedBooking.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Start Date</span>
                    <span className="text-sm font-medium text-gray-900">{selectedBooking.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">End Date</span>
                    <span className="text-sm font-medium text-gray-900">{selectedBooking.endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                      selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800'
                      : selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}