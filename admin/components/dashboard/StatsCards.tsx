import { formatCurrency } from '@/lib/utils';

interface StatsCardsProps {
  totalReservations: number;
  activeReservations: number;
  totalRevenue: number;
  pendingPayments: number;
}

export default function StatsCards({
  totalReservations,
  activeReservations,
  totalRevenue,
  pendingPayments,
}: StatsCardsProps) {
  const stats = [
    { name: 'Total Reservations', value: totalReservations, description: 'All time', color: 'text-navy' },
    { name: 'Active Reservations', value: activeReservations, description: 'Currently active', color: 'text-forest' },
    { name: 'Total Revenue', value: formatCurrency(totalRevenue), description: 'All time', color: 'text-forest' },
    { name: 'Pending Payments', value: pendingPayments, description: 'Awaiting payment', color: 'text-yellow-600' },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.name} className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-xs text-gray-400">{stat.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}