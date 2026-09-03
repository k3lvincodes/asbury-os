export const BOOKING_STEPS = [
  { id: 1, name: 'Package', href: '/book', status: 'current' },
  { id: 2, name: 'Dates', href: '/book/dates', status: 'upcoming' },
  { id: 3, name: 'Info', href: '/book/info', status: 'upcoming' },
  { id: 4, name: 'Review', href: '/book/review', status: 'upcoming' },
  { id: 5, name: 'Agreement', href: '/book/agreement', status: 'upcoming' },
  { id: 6, name: 'Payment', href: '/book/payment', status: 'upcoming' },
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
    basePriceCents: 40000,
    description: 'Great for medium-sized jobs',
  },
  {
    id: '3',
    name: '7 Days',
    slug: '7d',
    durationHours: 168,
    basePriceCents: 60000,
    description: 'Best for large projects',
  },
] as const;

export const CONTACT_INFO = {
  phone: '(304) 555-1234',
  email: 'info@asburyoutdoorservices.com',
  address: '123 Main St, Charleston, WV 25301',
};
