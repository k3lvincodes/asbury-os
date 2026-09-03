'use client';

import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { cn } from '@/lib/utils';

interface SignaturePadProps {
  onSignature: (dataUrl: string) => void;
  onClear: () => void;
}

export default function SignaturePad({ onSignature, onClear }: SignaturePadProps) {
  const canvasRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    canvasRef.current?.clear();
    setIsEmpty(true);
    onClear();
  };

  const handleEnd = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      setIsEmpty(false);
      onSignature(dataUrl);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-300 bg-white p-2">
        <SignatureCanvas
          ref={canvasRef}
          penColor="#1a1a2e"
          canvasProps={{
            width: 500,
            height: 200,
            className: 'w-full',
          }}
          onEnd={handleEnd}
        />
      </div>
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Clear
        </button>
        {isEmpty && (
          <p className="text-sm text-gray-500">Please sign above</p>
        )}
      </div>
    </div>
  );
}
