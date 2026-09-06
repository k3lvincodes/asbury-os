'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CONTACT_INFO } from '@/lib/constants';

export default function Header() {
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
          <Link href="/" className="text-sm font-medium hover:text-white" style={{ color: '#6B8A0E' }}>
            Home
          </Link>
          <Link href="/reservation" className="text-sm font-medium hover:text-white" style={{ color: '#6B8A0E' }}>
            View Reservation
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <a
            href={`tel:${CONTACT_INFO.phone}`}
            className="hidden sm:inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-80"
            style={{ backgroundColor: '#6B8A0E' }}
          >
            {CONTACT_INFO.phone}
          </a>
        </div>
      </div>
    </header>
  );
}
