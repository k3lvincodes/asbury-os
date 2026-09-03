'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Reservations', href: '/reservations' },
  { name: 'Calendar', href: '/calendar' },
  { name: 'Customers', href: '/customers' },
  { name: 'Agreements', href: '/agreements' },
  { name: 'Charges', href: '/charges' },
  { name: 'Notifications', href: '/notifications' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-4">
        <Link href="/dashboard" className="text-lg font-semibold text-primary">
          Admin
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center rounded-md px-3 py-2 text-sm font-medium',
              pathname === item.href
                ? 'bg-accent text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
