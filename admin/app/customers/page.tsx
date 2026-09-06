'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  totalBookings: number;
  totalSpentCents: number;
  lastBookingDate: string;
  createdAt: string;
}

// Mock data - in production, fetch from API
const mockCustomers: Customer[] = [
  {
    id: '1',
    fullName: 'John Smith',
    email: 'john@example.com',
    phone: '+13045551234',
    deliveryAddress: '123 Main St, Charleston, WV 25301',
    totalBookings: 3,
    totalSpentCents: 97500,
    lastBookingDate: '2026-09-10',
    createdAt: '2026-08-15',
  },
  {
    id: '2',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+13045555678',
    deliveryAddress: '456 Oak Ave, Charleston, WV 25302',
    totalBookings: 1,
    totalSpentCents: 22500,
    lastBookingDate: '2026-09-05',
    createdAt: '2026-09-01',
  },
  {
    id: '3',
    fullName: 'Bob Wilson',
    email: 'bob@example.com',
    phone: '+13045559012',
    deliveryAddress: '789 Pine Rd, Huntington, WV 25701',
    totalBookings: 5,
    totalSpentCents: 210000,
    lastBookingDate: '2026-09-15',
    createdAt: '2026-06-20',
  },
  {
    id: '4',
    fullName: 'Alice Brown',
    email: 'alice@example.com',
    phone: '+13045553456',
    deliveryAddress: '321 Elm Blvd, Morgantown, WV 26501',
    totalBookings: 2,
    totalSpentCents: 60000,
    lastBookingDate: '2026-09-20',
    createdAt: '2026-07-10',
  },
];

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = mockCustomers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-navy">Customers</h1>
            <span className="text-sm text-gray-500">{mockCustomers.length} total customers</span>
          </div>

          {/* Search */}
          <div className="mt-6">
            <div className="max-w-md">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, email, or phone..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
          </div>

          {/* Customer Table */}
          <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Last Booking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-navy">{customer.fullName}</div>
                      <div className="text-xs text-gray-400">Since {formatDate(customer.createdAt)}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                      <div className="text-xs text-gray-400">{customer.phone}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{customer.totalBookings}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(customer.totalSpentCents)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDate(customer.lastBookingDate)}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="text-sm font-medium text-forest hover:text-forest-600"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                      No customers found matching &ldquo;{search}&rdquo;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Customer Detail Modal */}
          {selectedCustomer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-navy">{selectedCustomer.fullName}</h3>
                  <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-900">{selectedCustomer.email}</p>
                      <p className="text-sm text-gray-900">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="text-sm font-medium text-gray-500">Delivery Address</h4>
                    <p className="mt-2 text-sm text-gray-900">{selectedCustomer.deliveryAddress}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-forest-50 p-4 text-center">
                      <p className="text-2xl font-bold text-forest">{selectedCustomer.totalBookings}</p>
                      <p className="text-xs text-gray-500">Total Bookings</p>
                    </div>
                    <div className="rounded-lg bg-forest-50 p-4 text-center">
                      <p className="text-2xl font-bold text-forest">{formatCurrency(selectedCustomer.totalSpentCents)}</p>
                      <p className="text-xs text-gray-500">Total Spent</p>
                    </div>
                    <div className="rounded-lg bg-forest-50 p-4 text-center">
                      <p className="text-sm font-bold text-forest">{formatDate(selectedCustomer.lastBookingDate)}</p>
                      <p className="text-xs text-gray-500">Last Booking</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedCustomer(null)}
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