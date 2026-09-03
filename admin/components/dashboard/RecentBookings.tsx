import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Booking {
  id: string;
  bookingNumber: string;
  customerName: string;
  packageName: string;
  startDate: string;
  amountDue: number;
  status: string;
}

interface RecentBookingsProps {
  bookings: Booking[];
}

export default function RecentBookings({ bookings }: RecentBookingsProps) {
  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Bookings</h3>
      </div>
      <div className="border-t border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Booking #
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Customer
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Package
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Start Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/reservations/${booking.id}`}
                      className="text-sm font-medium text-accent hover:text-accent-600"
                    >
                      {booking.bookingNumber}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {booking.customerName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {booking.packageName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDate(booking.startDate)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatCurrency(booking.amountDue)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
