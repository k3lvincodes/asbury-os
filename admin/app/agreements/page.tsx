'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import { formatDate } from '@/lib/utils';
import { apiAuth } from '@/lib/auth';

interface Agreement {
  id: string;
  reservation_id: string;
  customer_name: string;
  signature_data: string;
  accepted_at: string;
  ip_address?: string;
  pdf_url: string | null;
  created_at: string;
  reservation: {
    booking_number: string;
    rental_start_date: string;
    rental_end_date: string;
    booking_status: string;
    customer: {
      email: string;
      phone: string;
    };
  };
}

export default function AgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);

  useEffect(() => {
    async function fetchAgreements() {
      try {
        const res = await apiAuth<Agreement[]>('/api/v1/admin/agreements');
        if (res.success && res.data) {
          setAgreements(res.data);
        } else {
          setError(res.error || 'Failed to load agreements');
        }
      } catch {
        setError('Failed to load agreements');
      } finally {
        setLoading(false);
      }
    }
    fetchAgreements();
  }, []);

  const filtered = agreements.filter(
    (a) =>
      a.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      a.reservation?.booking_number.toLowerCase().includes(search.toLowerCase()) ||
      a.reservation?.customer?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-navy">Signed Agreements</h1>
            {!loading && <span className="text-sm text-gray-500">{agreements.length} total agreements</span>}
          </div>

          <div className="mt-6">
            <div className="max-w-md">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Customer name, booking #, or email..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
          </div>

          {loading && (
            <div className="mt-6 text-sm text-gray-500">Loading agreements...</div>
          )}

          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Booking #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Signed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Signature</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filtered.map((agreement) => (
                    <tr key={agreement.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-navy">{agreement.customer_name}</div>
                        <div className="text-xs text-gray-400">{agreement.reservation?.customer?.email}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-forest">
                        {agreement.reservation?.booking_number}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(agreement.reservation?.rental_start_date)} → {formatDate(agreement.reservation?.rental_end_date)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(agreement.accepted_at)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {agreement.signature_data ? (
                          <img
                            src={agreement.signature_data}
                            alt="Signature"
                            className="h-10 w-auto rounded border border-gray-200 bg-white"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No signature</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <button
                          onClick={() => setSelectedAgreement(agreement)}
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
                        {agreements.length === 0 ? 'No signed agreements yet' : `No agreements found matching "${search}"`}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {selectedAgreement && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-navy">Agreement Details</h3>
                  <button onClick={() => setSelectedAgreement(null)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="text-sm font-medium text-gray-500">Customer</h4>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedAgreement.customer_name}</p>
                      <p className="text-xs text-gray-500">{selectedAgreement.reservation?.customer?.email}</p>
                      <p className="text-xs text-gray-500">{selectedAgreement.reservation?.customer?.phone}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="text-sm font-medium text-gray-500">Booking</h4>
                      <p className="mt-1 text-sm font-medium text-forest">{selectedAgreement.reservation?.booking_number}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(selectedAgreement.reservation?.rental_start_date)} → {formatDate(selectedAgreement.reservation?.rental_end_date)}
                      </p>
                      <p className="text-xs text-gray-500">Status: {selectedAgreement.reservation?.booking_status}</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="text-sm font-medium text-gray-500">Signed</h4>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedAgreement.accepted_at)}</p>
                    {selectedAgreement.ip_address && (
                      <p className="text-xs text-gray-500">IP: {selectedAgreement.ip_address}</p>
                    )}
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="text-sm font-medium text-gray-500">Signature</h4>
                    {selectedAgreement.signature_data ? (
                      <div className="mt-2 rounded-md border border-gray-200 bg-white p-4">
                        <img
                          src={selectedAgreement.signature_data}
                          alt="Customer Signature"
                          className="max-h-32 w-auto"
                        />
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-gray-400">No signature captured</p>
                    )}
                  </div>

                  {selectedAgreement.pdf_url && (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="text-sm font-medium text-gray-500">PDF Agreement</h4>
                      <a
                        href={selectedAgreement.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-sm font-medium text-forest hover:text-forest-600"
                      >
                        View PDF →
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedAgreement(null)}
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
