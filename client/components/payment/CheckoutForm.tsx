'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface CheckoutFormProps {
  amount: number;
  onSubmit: () => void;
}

export default function CheckoutForm({ amount, onSubmit }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate payment processing
    // In production, this would redirect to Stripe Checkout
    setTimeout(() => {
      onSubmit();
      setIsLoading(false);
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-primary">Payment Details</h3>
        
        <div className="mt-4">
          <div className="flex justify-between border-b border-gray-200 py-2">
            <span className="text-gray-600">Total Amount</span>
            <span className="font-semibold">{formatCurrency(amount)}</span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
              Card Number
            </label>
            <input
              type="text"
              id="card-number"
              placeholder="1234 5678 9012 3456"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
                Expiry Date
              </label>
              <input
                type="text"
                id="expiry"
                placeholder="MM/YY"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
                CVC
              </label>
              <input
                type="text"
                id="cvc"
                placeholder="123"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-accent px-4 py-3 text-white font-medium hover:bg-accent-600 disabled:opacity-50"
      >
        {isLoading ? 'Processing Payment...' : `Pay ${formatCurrency(amount)}`}
      </button>

      <p className="text-center text-sm text-gray-500">
        Secure payment powered by Stripe
      </p>
    </form>
  );
}
