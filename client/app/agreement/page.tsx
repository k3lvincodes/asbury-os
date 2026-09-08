'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import StepIndicator from '@/components/booking/StepIndicator';
import AgreementContent from '@/components/agreement/AgreementContent';
import SignaturePad from '@/components/agreement/SignaturePad';
import { BOOKING_STEPS } from '@/lib/constants';
import { useBookingStore } from '@/lib/store';
import { apiGet } from '@/lib/api';

interface AgreementData {
  version: string;
  title: string;
  content: string;
}

export default function AgreementPage() {
  const router = useRouter();
  const { agreementSignature, agreementSigned, setAgreementSigned, setAgreementSignature } = useBookingStore();
  const [signature, setSignature] = useState<string | null>(agreementSignature);
  const [accepted, setAccepted] = useState(agreementSigned);
  const [agreement, setAgreement] = useState<AgreementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [steps] = useState(
    BOOKING_STEPS.map((step, idx) => ({
      ...step,
      status: idx < 4 ? 'complete' as const : idx === 4 ? 'current' as const : 'upcoming' as const,
    }))
  );

  useEffect(() => {
    async function fetchAgreement() {
      try {
        const result = await apiGet<AgreementData>('/api/v1/agreements');
        if (result.success && result.data) {
          setAgreement(result.data);
        } else {
          setError(result.error || 'Failed to load agreement');
        }
      } catch {
        setError('Failed to load agreement');
      } finally {
        setLoading(false);
      }
    }
    fetchAgreement();
  }, []);

  const handleContinue = () => {
    if (signature && accepted) {
      setAgreementSigned(true);
      setAgreementSignature(signature);
      router.push('/payment');
    }
  };

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold text-navy">Rental Agreement</h1>
      <p className="mt-2 text-gray-600">Please read and sign the rental agreement.</p>
      
      <div className="mt-8">
        <StepIndicator steps={steps} />
      </div>

      <div className="mt-8 space-y-8">
        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
            Loading agreement...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
            {error}
          </div>
        ) : agreement ? (
          <AgreementContent content={agreement.content} version={agreement.version} />
        ) : null}

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-navy">Signature</h3>
          <p className="mt-2 text-gray-600">Please sign below to accept the agreement.</p>
          
          <div className="mt-4">
            <SignaturePad
              onSignature={setSignature}
              onClear={() => setSignature(null)}
              defaultValue={agreementSignature}
            />
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted((e.target as HTMLInputElement).checked)}
                className="h-4 w-4 rounded border-gray-300 text-forest focus:ring-forest"
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
          onClick={() => router.push('/review')}
          className="rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 font-medium hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!signature || !accepted || loading}
          className="rounded-md bg-forest px-6 py-3 text-white font-medium hover:bg-forest-600 disabled:opacity-50"
        >
          Continue to Payment
        </button>
      </div>
    </Container>
  );
}