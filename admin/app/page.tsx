import Link from 'next/link';
import Image from 'next/image';

export default function AdminHome() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <Image
          src="/aos_logo.png"
          alt="Asbury Outdoor Services"
          width={180}
          height={68}
          priority
        />
        <h1 className="mt-6 text-3xl font-bold text-navy">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your dump trailer rental business</p>

        <div className="mt-10 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-forest hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-navy">Dashboard</h2>
            <p className="mt-2 text-sm text-gray-500">View stats and recent bookings.</p>
          </Link>
          <Link
            href="/reservations"
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-forest hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-navy">Reservations</h2>
            <p className="mt-2 text-sm text-gray-500">Manage all reservations.</p>
          </Link>
          <Link
            href="/calendar"
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-forest hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-navy">Calendar</h2>
            <p className="mt-2 text-sm text-gray-500">View booking calendar.</p>
          </Link>
          <Link
            href="/settings"
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-forest hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-navy">Settings</h2>
            <p className="mt-2 text-sm text-gray-500">Configure system settings.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}