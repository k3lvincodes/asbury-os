'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';

const customerInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
});

interface CustomerFormData {
  fullName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
}

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  defaultValues?: Partial<CustomerFormData>;
}

export default function CustomerForm({ onSubmit, defaultValues }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          {...register('fullName')}
          className={cn(
            'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest',
            errors.fullName && 'border-red-500'
          )}
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          {...register('email')}
          className={cn(
            'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest',
            errors.email && 'border-red-500'
          )}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          {...register('phone')}
          className={cn(
            'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest',
            errors.phone && 'border-red-500'
          )}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700">
          Delivery Address
        </label>
        <textarea
          id="deliveryAddress"
          {...register('deliveryAddress')}
          rows={3}
          className={cn(
            'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest',
            errors.deliveryAddress && 'border-red-500'
          )}
        />
        {errors.deliveryAddress && (
          <p className="mt-1 text-sm text-red-500">{errors.deliveryAddress.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-forest px-4 py-2 text-white font-medium hover:bg-forest-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Continue'}
      </button>
    </form>
  );
}
