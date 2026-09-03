'use client';

import { cn, formatCurrency } from '@/lib/utils';

interface PackageCardProps {
  name: string;
  slug: string;
  durationHours: number;
  basePriceCents: number;
  description: string;
  isSelected: boolean;
  onSelect: (slug: string) => void;
}

export default function PackageCard({
  name,
  slug,
  durationHours,
  basePriceCents,
  description,
  isSelected,
  onSelect,
}: PackageCardProps) {
  const durationText = durationHours < 72
    ? `${durationHours} hours`
    : `${Math.floor(durationHours / 24)} days`;

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 p-6 cursor-pointer transition-all',
        isSelected
          ? 'border-accent bg-accent-light'
          : 'border-gray-200 hover:border-gray-300'
      )}
      onClick={() => onSelect(slug)}
    >
      {isSelected && (
        <div className="absolute top-2 right-2">
          <svg
            className="h-6 w-6 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      )}
      <h3 className="text-xl font-semibold text-primary">{name}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      <div className="mt-4">
        <span className="text-3xl font-bold text-primary">
          {formatCurrency(basePriceCents)}
        </span>
        <span className="text-sm text-gray-500"> / {durationText}</span>
      </div>
    </div>
  );
}
