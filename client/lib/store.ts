import { create } from 'zustand';

interface BookingState {
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

  // Reset
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
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
    }),
}));
