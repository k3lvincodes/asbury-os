'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Filters {
  status: string;
  paymentStatus: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
  search: string;
}

interface ReservationFiltersProps {
  onFilterChange: (filters: Filters) => void;
}

export default function ReservationFilters({ onFilterChange }: ReservationFiltersProps) {
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    paymentStatus: 'all',
    dateRange: 'all',
    search: '',
  });

  const handleChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
          <input type="text" id="search" value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Booking #, customer name..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest" />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Booking Status</label>
          <select id="status" value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="awaiting_payment">Awaiting Payment</option>
            <option value="confirmed">Confirmed</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div>
          <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700">Payment Status</label>
          <select id="paymentStatus" value={filters.paymentStatus}
            onChange={(e) => handleChange('paymentStatus', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest">
            <option value="all">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700">Date Range</label>
          <select id="dateRange" value={filters.dateRange}
            onChange={(e) => handleChange('dateRange', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>
    </div>
  );
}