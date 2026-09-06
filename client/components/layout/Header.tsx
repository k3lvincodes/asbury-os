'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CONTACT_INFO } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-black shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/aos_logo.png"
            alt="Asbury Outdoor Services"
            width={100}
            height={38}
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-sm font-medium text-forest hover:text-forest-600">
            Home
          </Link>
          <Link href="/reservation" className="text-sm font-medium text-forest hover:text-forest-600">
            View Reservation
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <a
            href={`tel:${CONTACT_INFO.phone}`}
            className="hidden sm:inline-flex items-center justify-center rounded-md bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-600"
          >
            {CONTACT_INFO.phone}
          </a>

          <button
            className="md:hidden flex items-center justify-center rounded-md p-2 text-forest hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-black px-4 py-4 space-y-3">
          <Link
            href="/"
            className="block text-sm font-medium text-forest hover:text-forest-600"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/reservation"
            className="block text-sm font-medium text-forest hover:text-forest-600"
            onClick={() => setMobileOpen(false)}
          >
            View Reservation
          </Link>
          <a
            href={`tel:${CONTACT_INFO.phone}`}
            className="block rounded-md bg-forest px-4 py-2 text-center text-sm font-medium text-white hover:bg-forest-600"
          >
            {CONTACT_INFO.phone}
          </a>
        </div>
      )}
    </header>
  );
}