export const BOOKING_STEPS = [
  { id: 1, name: 'Package', href: '/', status: 'current' },
  { id: 2, name: 'Dates', href: '/dates', status: 'upcoming' },
  { id: 3, name: 'Info', href: '/info', status: 'upcoming' },
  { id: 4, name: 'Review', href: '/review', status: 'upcoming' },
  { id: 5, name: 'Agreement', href: '/agreement', status: 'upcoming' },
  { id: 6, name: 'Payment', href: '/payment', status: 'upcoming' },
] as const;

export const PACKAGES = [
  {
    id: '1',
    name: '24 Hours',
    slug: '24h',
    durationHours: 24,
    basePriceCents: 22500,
    description: 'Perfect for small projects',
  },
  {
    id: '2',
    name: '3 Days',
    slug: '3d',
    durationHours: 72,
    basePriceCents: 37500,
    description: 'Great for medium-sized jobs',
  },
  {
    id: '3',
    name: '7 Days',
    slug: '7d',
    durationHours: 168,
    basePriceCents: 67500,
    description: 'Best for large projects',
  },
] as const;

export const CONTACT_INFO = {
  phone: '+1 304-513-3583',
  email: 'contact@asburyoutdoorservices.com',
  address: 'Charleston, WV & Surrounding Areas',
};
