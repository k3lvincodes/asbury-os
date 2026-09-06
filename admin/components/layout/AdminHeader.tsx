'use client';

import Link from 'next/link';

export default function AdminHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-navy">Admin Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Link
          href="/"
          className="rounded-md bg-forest-light px-4 py-2 text-sm font-medium text-forest hover:bg-forest-100"
        >
          View Site
        </Link>
        <button
          type="button"
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Logout
        </button>
      </div>
    </header>
  );
}