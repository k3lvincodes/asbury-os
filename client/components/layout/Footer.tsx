import Link from 'next/link';
import { CONTACT_INFO } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">Asbury Outdoor Services</h3>
            <p className="mt-2 text-sm text-gray-300">
              Reliable dump trailer rentals for your projects.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/book" className="text-sm text-gray-300 hover:text-white">
                  Rent a Trailer
                </Link>
              </li>
              <li>
                <Link href="/agreement" className="text-sm text-gray-300 hover:text-white">
                  Agreement
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Services</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <span className="text-sm text-gray-300">24 Hour Rental</span>
              </li>
              <li>
                <span className="text-sm text-gray-300">3 Day Rental</span>
              </li>
              <li>
                <span className="text-sm text-gray-300">7 Day Rental</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Contact</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <a href={`tel:${CONTACT_INFO.phone}`} className="text-sm text-gray-300 hover:text-white">
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT_INFO.email}`} className="text-sm text-gray-300 hover:text-white">
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li>
                <span className="text-sm text-gray-300">{CONTACT_INFO.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} Asbury Outdoor Services. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
