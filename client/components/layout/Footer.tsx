import Link from 'next/link';
import Image from 'next/image';
import { CONTACT_INFO } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-7">
          <div className="flex flex-col items-center">
            <Image
              src="/aos_logo.png"
              alt="Asbury Outdoor Services"
              width={140}
              height={52}
            />
            <p className="mt-4 text-center text-sm text-gray-300">
              Dump trailer rentals, junk removal, hauling, and outdoor services you can count on. Locally owned and operated in Charleston, WV.
            </p>
          </div>

          <div className="pl-4 sm:pl-8">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-forest">Quick Links</h4>
            <ul className="mt-4 space-y-0.5">
              <li>
                <a href="https://www.asburyoutdoorservices.com" className="text-sm text-gray-300 hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/dump-trailer" className="text-sm text-gray-300 hover:text-white">
                  Dump Trailer Rental
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/about" className="text-sm text-gray-300 hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/gallery" className="text-sm text-gray-300 hover:text-white">
                  Our Work
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/contact" className="text-sm text-gray-300 hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-forest">Our Services</h4>
            <ul className="mt-4 space-y-0.5">
              <li>
                <a href="https://www.asburyoutdoorservices.com/dump-trailer" className="text-sm text-gray-300 hover:text-white">
                  Dump Trailer Rental
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/junk-removal" className="text-sm text-gray-300 hover:text-white">
                  Junk Removal &amp; Haul-Off
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/land-property-cleanup" className="text-sm text-gray-300 hover:text-white">
                  Land &amp; Property Cleanup
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/excavating-material-hauling" className="text-sm text-gray-300 hover:text-white">
                  Excavating &amp; Material Hauling
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-forest">Legal Pages</h4>
            <ul className="mt-4 space-y-0.5">
              <li>
                <a href="https://www.asburyoutdoorservices.com/privacy-policy" className="text-sm text-gray-300 hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/terms-and-conditions" className="text-sm text-gray-300 hover:text-white">
                  Terms &amp; Conditions
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/payment-policy" className="text-sm text-gray-300 hover:text-white">
                  Payment Policy
                </a>
              </li>
              <li>
                <a href="https://www.asburyoutdoorservices.com/service-area" className="text-sm text-gray-300 hover:text-white">
                  Service Area
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-forest">Get in Touch</h4>
            <ul className="mt-4 space-y-0.5">
              <li>
                <span className="text-sm text-forest">Phone</span>
              </li>
              <li>
                <a href={`tel:${CONTACT_INFO.phone}`} className="text-sm text-gray-300 hover:text-white">
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li>
                <span className="text-sm text-gray-300">{CONTACT_INFO.address}</span>
              </li>
              <li className="pt-2">
                <span className="text-sm text-forest">Email</span>
              </li>
              <li>
                <a href={`mailto:${CONTACT_INFO.email}`} className="text-sm text-gray-300 hover:text-white">
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="pt-2 flex items-center gap-2">
                <span className="text-sm text-forest">Social Media</span>
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

          <div className="flex flex-col items-center justify-start">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-forest">Scan Us</h4>
            <Image
              src="/qr-code.avif"
              alt="Asbury Outdoor Services QR Code"
              width={110}
              height={110}
              className="mt-4 rounded-md"
            />
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