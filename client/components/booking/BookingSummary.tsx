import { formatCurrency, formatDate } from '@/lib/utils';

interface BookingSummaryProps {
  packageName: string;
  startDate: Date;
  endDate: Date;
  basePriceCents: number;
  totalChargesCents?: number;
  amountDueCents: number;
  deliveryAddress: string;
}

export default function BookingSummary({
  packageName,
  startDate,
  endDate,
  basePriceCents,
  totalChargesCents = 0,
  amountDueCents,
  deliveryAddress,
}: BookingSummaryProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-navy">Booking Summary</h3>
      
      <div className="mt-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Package</span>
          <span className="font-medium">{packageName}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Rental Period</span>
          <span className="font-medium">
            {formatDate(startDate)} - {formatDate(endDate)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Address</span>
          <span className="font-medium text-right max-w-[200px]">{deliveryAddress}</span>
        </div>
        
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Base Price</span>
            <span className="font-medium">{formatCurrency(basePriceCents)}</span>
          </div>
          
          {totalChargesCents > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Additional Charges</span>
              <span className="font-medium">{formatCurrency(totalChargesCents)}</span>
            </div>
          )}
          
          <div className="flex justify-between border-t border-gray-200 pt-3 mt-3">
            <span className="text-lg font-semibold">Total Due</span>
            <span className="text-lg font-semibold text-navy">
              {formatCurrency(amountDueCents)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
