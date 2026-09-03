'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Container from '@/components/layout/Container';
import StepIndicator from '@/components/booking/StepIndicator';
import AgreementContent from '@/components/agreement/AgreementContent';
import SignaturePad from '@/components/agreement/SignaturePad';
import { BOOKING_STEPS } from '@/lib/constants';
import { useBookingStore } from '@/lib/store';

export default function AgreementPage() {
  const router = useRouter();
  const { setAgreementSigned } = useBookingStore();
  const [signature, setSignature] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [steps] = useState(
    BOOKING_STEPS.map((step, idx) => ({
      ...step,
      status: idx < 4 ? 'complete' as const : idx === 4 ? 'current' as const : 'upcoming' as const,
    }))
  );

  // Mock agreement content - in production, fetch from API
  const agreementContent = `
    <h1>Dump Trailer Rental Agreement</h1>
    <p>By signing this agreement, you agree to the following terms and conditions:</p>
    <h2>1. Rental Period</h2>
    <p>The rental period begins on the start date and ends on the scheduled return date. Extensions must be arranged in advance.</p>
    <h2>2. Usage</h2>
    <p>The trailer shall be used only for lawful purposes. The renter is responsible for any damage during the rental period.</p>
    <h2>3. Weight Limits</h2>
    <p>Do not exceed the maximum weight capacity. Overweight loads will incur additional charges.</p>
    <h2>4. Prohibited Materials</h2>
    <p>Hazardous materials, chemicals, and certain items are prohibited. Contact us for a complete list.</p>
    <h2>5. Insurance</h2>
    <p>Renter is responsible for insurance coverage during the rental period.</p>
    <h2>6. Late Returns</h2>
    <p>Late returns will incur additional daily charges. Please contact us if you need an extension.</p>
  `;

  const handleContinue = () => {
    if (signature && accepted) {
      setAgreementSigned(true);
      router.push('/book/payment');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Container className="py-12">
          <h1 className="text-3xl font-bold text-primary">Rental Agreement</h1>
          <p className="mt-2 text-gray-600">Please read and sign the rental agreement.</p>
          
          <div className="mt-8">
            <StepIndicator steps={steps} />
          </div>

          <div className="mt-8 space-y-8">
            <AgreementContent content={agreementContent} version="1.0" />

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-primary">Signature</h3>
              <p className="mt-2 text-gray-600">Please sign below to accept the agreement.</p>
              
              <div className="mt-4">
                <SignaturePad
                  onSignature={setSignature}
                  onClear={() => setSignature(null)}
                />
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I have read and agree to the rental agreement terms
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => router.push('/book/review')}
              className="rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 font-medium hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={!signature || !accepted}
              className="rounded-md bg-accent px-6 py-3 text-white font-medium hover:bg-accent-600 disabled:opacity-50"
            >
              Continue to Payment
            </button>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
