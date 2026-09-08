'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Reservations', href: '/reservations' },
  { name: 'Calendar', href: '/calendar' },
  { name: 'Customers', href: '/customers' },
  { name: 'Agreements', href: '/agreements' },
  { name: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-800 bg-black">
      <div className="flex h-16 items-center border-b border-gray-800 px-4">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/aos_logo.png"
            alt="Asbury Outdoor Services"
            width={70}
            height={26}
            priority
          />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
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
  );
}