'use client';

import { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onSignature: (dataUrl: string) => void;
  onClear: () => void;
}

const MIN_HEIGHT = 120;
const MAX_HEIGHT = 220;
const ASPECT_RATIO = 2.5;

export default function SignaturePad({ onSignature, onClear }: SignaturePadProps) {
  const canvasRef = useRef<SignatureCanvas>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 500, height: 200 });
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const resize = () => {
      const width = wrapper.clientWidth;
      if (!width) return;
      const height = Math.min(Math.max(width / ASPECT_RATIO, MIN_HEIGHT), MAX_HEIGHT);
      setSize({ width, height });
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

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
      <div
        ref={wrapperRef}
        className="overflow-hidden rounded-lg border border-gray-300 bg-white"
        style={{ height: size.height }}
      >
        <SignatureCanvas
          ref={canvasRef}
          penColor="#1a1a2e"
          canvasProps={{
            width: size.width,
            height: size.height,
            className: 'block w-full',
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
