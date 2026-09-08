import { formatDate, formatCurrency } from '@/lib/utils';

interface ReservationDetailProps {
  reservation: {
    bookingNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    packageName: string;
    startDate: string;
    endDate: string;
    pickupDate: string;
    basePriceCents: number;
    totalChargesCents: number;
    amountDueCents: number;
    bookingStatus: string;
    paymentStatus: string;
    agreementStatus: string;
    signatureData?: string;
    notes?: string;
    createdAt: string;
  };
}

export default function ReservationDetail({ reservation }: ReservationDetailProps) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-navy">
            Reservation {reservation.bookingNumber}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Created {formatDate(reservation.createdAt)}
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Customer</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                {reservation.customerName}<br />{reservation.customerEmail}<br />{reservation.customerPhone}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Delivery Address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">{reservation.deliveryAddress}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Package</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">{reservation.packageName}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Rental Period</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
                <br />Pickup: {formatDate(reservation.pickupDate)}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Pricing</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                Base Price: {formatCurrency(reservation.basePriceCents)}<br />
                Additional Charges: {formatCurrency(reservation.totalChargesCents)}<br />
                Total Due: {formatCurrency(reservation.amountDueCents)}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                Booking: {reservation.bookingStatus}<br />
                Payment: {reservation.paymentStatus}<br />
                Agreement: {reservation.agreementStatus}
              </dd>
            </div>
            {reservation.notes && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">{reservation.notes}</dd>
              </div>
            )}
            {reservation.signatureData && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Customer Signature</dt>
                <dd className="mt-1 sm:col-span-2">
                  <div className="rounded-md border border-gray-200 bg-white p-4 inline-block">
                    <img
                      src={reservation.signatureData}
                      alt="Customer Signature"
                      className="max-h-24 w-auto"
                    />
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}