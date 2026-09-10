import Link from 'next/link';
import Image from 'next/image';
import { CONTACT_INFO } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
          <div className="flex flex-col items-start text-left sm:col-span-2 lg:col-span-1">
            <Image
              src="/aos_logo.png"
              alt="Asbury Outdoor Services"
              width={140}
              height={52}
            />
            <p className="mt-4 text-sm text-gray-300">
              Dump trailer rentals, junk removal, hauling, and outdoor services you can count on. Locally owned and operated in Charleston, WV.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-forest whitespace-nowrap">Quick Links</h4>
            <ul className="mt-4 space-y-0.5">
              <li>
                <a href="https://www.asburyoutdoorservices.com" className="text-sm text-gray-300 hover:text-white whitespace-nowrap">
                  Home
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/dump-trailer" className="text-sm text-gray-300 hover:text-white whitespace-nowrap">
                  Dump Trailer Rental
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/about" className="text-sm text-gray-300 hover:text-white whitespace-nowrap">
                  About Us
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/gallery" className="text-sm text-gray-300 hover:text-white whitespace-nowrap">
                  Our Work
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/contact" className="text-sm text-gray-300 hover:text-white whitespace-nowrap">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-forest whitespace-nowrap">Our Services</h4>
            <ul className="mt-4 space-y-0.5">
              <li>
                <a href="https://www.asburyoutdoorservices.com/dump-trailer" className="text-sm text-gray-300 hover:text-white whitespace-nowrap">
                  Dump Trailer Rental
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/junk-removal" className="text-sm text-gray-300 hover:text-white whitespace-nowrap">
                  Junk Removal &amp; Haul-Off
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/land-property-cleanup" className="text-sm text-gray-300 hover:text-white whitespace-nowrap">
                  Land &amp; Property Cleanup
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/excavating-material-hauling" className="text-sm text-gray-300 hover:text-white whitespace-nowrap">
                  Excavating &amp; Material Hauling
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-forest whitespace-nowrap">Legal Pages</h4>
            <ul className="mt-4 space-y-0.5">
              <li>
                <a href="https://www.asburyoutdoorservices.com/privacy-policy" className="text-sm text-gray-300 hover:text-white whitespace-nowrap">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/terms-and-conditions" className="text-sm text-gray-300 hover:text-white whitespace-nowrap">
                  Terms &amp; Conditions
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/payment-policy" className="text-sm text-gray-300 hover:text-white whitespace-nowrap">
                  Payment Policy
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/service-area" className="text-sm text-gray-300 hover:text-white whitespace-nowrap">
                  Service Area
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-forest whitespace-nowrap">Get in Touch</h4>
            <ul className="mt-4 space-y-0.5">
              <li>
                <span className="text-sm text-forest whitespace-nowrap">Phone</span>
              </li>
              <li>
                <a href={`tel:${CONTACT_INFO.phone}`} className="text-sm text-gray-300 hover:text-white whitespace-nowrap">
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li>
                <span className="text-sm text-gray-300 whitespace-nowrap">{CONTACT_INFO.address}</span>
              </li>
              <li className="pt-2">
                <span className="text-sm text-forest whitespace-nowrap">Email</span>
              </li>
              <li>
                <a href={`mailto:${CONTACT_INFO.email}`} className="text-sm text-gray-300 hover:text-white whitespace-nowrap">
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="pt-2 flex items-center gap-2">
                <span className="text-sm text-forest whitespace-nowrap">Social Media</span>
                <a
                  href="https://www.facebook.com/share/1BgxFakUuq/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center sm:items-start lg:items-center">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-forest">Scan Us</h4>
            <div className="mt-4 rounded-lg bg-white p-2 shadow-sm">
              <Image
                src="/qr-code.avif"
                alt="Asbury Outdoor Services QR Code"
                width={130}
                height={130}
                className="rounded"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-300">
          <p>
            &copy; {new Date().getFullYear()} AsburyOutdoorServices. Designed by{' '}
            <a
              href="https://github.com/k3lvincodes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline"
            >
              K3lvin++
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}