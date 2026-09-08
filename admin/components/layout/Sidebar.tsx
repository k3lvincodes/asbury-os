'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Reservations', href: '/reservations' },
  { name: 'Calendar', href: '/calendar' },
  { name: 'Customers', href: '/customers' },
  { name: 'Settings', href: '/settings' },
];

interface SidebarProps {
  onToggle?: () => void;
  isOpen?: boolean;
}

export default function Sidebar({ onToggle, isOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-800 bg-black transition-transform duration-200 lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/aos_logo.png"
              alt="Asbury Outdoor Services"
              width={70}
              height={26}
              priority
            />
          </Link>
          <button
            onClick={onToggle}
            className="rounded-md p-1 text-gray-400 hover:text-white lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => onToggle?.()}
              className={cn(
                'flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-forest text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-700 p-4">
          <Link href="/" className="text-xs text-gray-400 hover:text-white">
            ← Back to Site
          </Link>
        </div>
      </div>
    </>
  );
}
