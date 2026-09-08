import { create } from 'zustand';
import { apiGet } from './api';

interface Pricing {
  package_24h_price: number;
  package_3d_price: number;
  package_7d_price: number;
  extra_day_price: number;
  extra_mile_price: number;
  overweight_per_ton: number;
  failed_pickup_fee: number;
  cleaning_fee_max: number;
  included_miles: number;
}

const DEFAULT_PRICING: Pricing = {
  package_24h_price: 22500,
  package_3d_price: 37500,
  package_7d_price: 67500,
  extra_day_price: 7500,
  extra_mile_price: 250,
  overweight_per_ton: 5000,
  failed_pickup_fee: 7500,
  cleaning_fee_max: 15000,
  included_miles: 15,
};

interface BookingState {
  // Pricing
  pricing: Pricing;
  pricingLoaded: boolean;
  fetchPricing: () => Promise<void>;

  // Package selection
  selectedPackage: string | null;
  setSelectedPackage: (pkg: string | null) => void;
  customDays: number | null;
  setCustomDays: (days: number | null) => void;

  // Date selection
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;

  // Customer info
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    deliveryAddress: string;
  } | null;
  setCustomerInfo: (info: BookingState['customerInfo']) => void;

  // Booking
  bookingNumber: string | null;
  setBookingNumber: (num: string | null) => void;

  // Agreement
  agreementSigned: boolean;
  setAgreementSigned: (signed: boolean) => void;
  agreementSignature: string | null;
  setAgreementSignature: (sig: string | null) => void;

  // Reset
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  // Pricing
  pricing: DEFAULT_PRICING,
  pricingLoaded: false,
  fetchPricing: async () => {
    try {
      const res = await apiGet<Pricing>('/api/v1/pricing');
      if (res.success && res.data) {
        set({ pricing: { ...DEFAULT_PRICING, ...res.data }, pricingLoaded: true });
      } else {
        set({ pricingLoaded: true });
      }
    } catch {
      set({ pricingLoaded: true });
    }
  },

  // Package selection
  selectedPackage: null,
  setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),
  customDays: null,
  setCustomDays: (days) => set({ customDays: days }),

  // Date selection
  startDate: null,
  endDate: null,
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),

  // Customer info
  customerInfo: null,
  setCustomerInfo: (info) => set({ customerInfo: info }),

  // Booking
  bookingNumber: null,
  setBookingNumber: (num) => set({ bookingNumber: num }),

  // Agreement
  agreementSigned: false,
  setAgreementSigned: (signed) => set({ agreementSigned: signed }),
  agreementSignature: null,
  setAgreementSignature: (sig) => set({ agreementSignature: sig }),

  // Reset
  reset: () =>
    set({
      selectedPackage: null,
      customDays: null,
      startDate: null,
      endDate: null,
      customerInfo: null,
      bookingNumber: null,
      agreementSigned: false,
      agreementSignature: null,
    }),
}));
