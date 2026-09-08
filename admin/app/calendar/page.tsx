'use client';

import { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import { apiAuth } from '@/lib/auth';

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

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDayStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-forest text-white',
  pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  active: 'bg-blue-100 text-blue-800 border border-blue-300',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

const statusBadgeColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<{ day: number; bookings: BookingEvent[] } | null>(null);
  const [bookings, setBookings] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      try {
        const res = await apiAuth<BookingEvent[]>(
          `/api/v1/admin/calendar?month=${currentMonth + 1}&year=${currentYear}`
        );
        if (res.success && res.data) {
          setBookings(res.data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [currentMonth, currentYear]);

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
    const dateStr = formatDayStr(currentYear, currentMonth, day);
    return bookings.filter((b) => {
      const start = b.startDate.substring(0, 10);
      const end = b.endDate.substring(0, 10);
      return dateStr >= start && dateStr <= end;
    });
  };

  const handleDayClick = (day: number) => {
    const dayBookings = getBookingsForDay(day);
    setSelectedDay({ day, bookings: dayBookings });
  };

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDay, daysInMonth]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-navy">Calendar</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ← Prev
              </button>
              <span className="text-sm font-semibold text-navy sm:text-lg">
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

          {loading && (
            <div className="mt-6 text-sm text-gray-500">Loading calendar...</div>
          )}

          {!loading && (
            <>
              <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                      {DAYS.map((day) => (
                        <div key={day} className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7">
                      {calendarDays.map((day, idx) => {
                        const dayBookings = day ? getBookingsForDay(day) : [];
                        const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

                        return (
                          <div
                            key={idx}
                            onClick={() => day && handleDayClick(day)}
                            className={`min-h-[60px] border-b border-r border-gray-100 p-1 sm:min-h-[100px] sm:p-1.5 ${
                              day ? 'cursor-pointer bg-white hover:bg-gray-50' : 'bg-gray-50'
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
                                  {dayBookings.map((booking) => (
                                    <div
                                      key={booking.id}
                                      className={`w-full truncate rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight ${
                                        statusColors[booking.status] || 'bg-gray-100 text-gray-600'
                                      }`}
                                      title={`${booking.bookingNumber} - ${booking.customerName}`}
                                    >
                                      {booking.customerName}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-semibold text-navy">All Bookings This Month</h2>
                <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-lg">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">Booking #</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">Customer</th>
                          <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell sm:px-6">Dates</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {bookings.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                              No bookings this month
                            </td>
                          </tr>
                        ) : (
                          bookings.map((booking) => (
                            <tr key={booking.id}>
                              <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-forest sm:px-6">{booking.bookingNumber}</td>
                              <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900 sm:px-6">{booking.customerName}</td>
                              <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-gray-500 sm:table-cell sm:px-6">{booking.startDate} → {booking.endDate}</td>
                              <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusBadgeColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                                  {booking.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedDay && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-lg rounded-lg bg-white p-4 sm:p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-navy">
                    {MONTHS[currentMonth]} {selectedDay.day}, {currentYear}
                  </h3>
                  <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {selectedDay.bookings.length === 0 ? (
                  <p className="mt-6 text-center text-sm text-gray-500">No bookings on this day</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {selectedDay.bookings.map((booking) => (
                      <div key={booking.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-forest">{booking.bookingNumber}</span>
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${statusBadgeColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Customer</span>
                            <span className="font-medium text-gray-900">{booking.customerName}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Dates</span>
                            <span className="text-gray-900">{booking.startDate} → {booking.endDate}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedDay(null)}
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
