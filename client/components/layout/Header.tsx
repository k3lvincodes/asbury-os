'use client';

import Link from 'next/link';
import { CONTACT_INFO } from '@/lib/constants';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-primary">Asbury Outdoor Services</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-primary">
            Home
          </Link>
          <Link href="/book" className="text-sm font-medium text-gray-700 hover:text-primary">
            Rent a Trailer
          </Link>
          <Link href="/agreement" className="text-sm font-medium text-gray-700 hover:text-primary">
            Agreement
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <a
            href={`tel:${CONTACT_INFO.phone}`}
            className="hidden sm:inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            {CONTACT_INFO.phone}
          </a>
          <Link
            href="/book"
            className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-600"
          >
            Rent a Trailer
          </Link>
        </div>
      </div>
    </header>
  );
}
