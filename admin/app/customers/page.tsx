'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import { formatDate, formatCurrency } from '@/lib/utils';
import { apiAuth } from '@/lib/auth';

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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await apiAuth<Customer[]>('/api/v1/admin/customers');
        if (res.success && res.data) {
          setCustomers(res.data);
        } else {
          setError(res.error || 'Failed to load customers');
        }
      } catch {
        setError('Failed to load customers');
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-navy">Customers</h1>
            {!loading && <span className="text-sm text-gray-500">{customers.length} total customers</span>}
          </div>

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

          {loading && (
            <div className="mt-6 text-sm text-gray-500">Loading customers...</div>
          )}

          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">Customer</th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell sm:px-6">Contact</th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell sm:px-6">Bookings</th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell sm:px-6">Total Spent</th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell sm:px-6">Last Booking</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filtered.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                          <div className="text-sm font-medium text-navy">{customer.fullName}</div>
                          <div className="text-xs text-gray-400 sm:hidden">{customer.email}</div>
                          <div className="text-xs text-gray-400">Since {formatDate(customer.createdAt)}</div>
                        </td>
                        <td className="hidden whitespace-nowrap px-6 py-4 sm:table-cell">
                          <div className="text-sm text-gray-900">{customer.email}</div>
                          <div className="text-xs text-gray-400">{customer.phone}</div>
                        </td>
                        <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-900 sm:table-cell">{customer.totalBookings}</td>
                        <td className="hidden whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 sm:table-cell">{formatCurrency(customer.totalSpentCents)}</td>
                        <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-gray-500 md:table-cell sm:px-6">{formatDate(customer.lastBookingDate)}</td>
                        <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="text-sm font-medium text-forest hover:text-forest-600"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                          {customers.length === 0 ? 'No customers yet' : `No customers found matching "${search}"`}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedCustomer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-lg rounded-lg bg-white p-4 sm:p-6 shadow-xl">
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
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
