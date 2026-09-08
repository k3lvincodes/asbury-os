'use client';

import { cn } from '@/lib/utils';

interface Step {
  id: number;
  name: string;
  status: 'complete' | 'current' | 'upcoming';
}

interface StepIndicatorProps {
  steps: Step[];
}

export default function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
      <ol className="flex items-center min-w-max sm:min-w-0">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={cn(
              stepIdx !== steps.length - 1 ? 'pr-6 sm:pr-20' : '',
              'relative flex-shrink-0 sm:flex-shrink'
            )}
          >
            {stepIdx !== steps.length - 1 && (
              <div className="absolute top-0 left-0 h-8 w-full flex items-center" aria-hidden="true">
                <div className={cn(
                  'h-0.5 w-full',
                  step.status === 'complete' ? 'bg-forest' : 'bg-gray-200'
                )} />
              </div>
            )}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full">
              {step.status === 'complete' ? (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-forest">
                  <svg
                    className="h-5 w-5 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ) : step.status === 'current' ? (
                <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-forest bg-white">
                  <span className="text-sm font-medium text-forest">{step.id}</span>
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                  <span className="text-sm font-medium text-gray-500">{step.id}</span>
                </div>
              )}
            </div>
            <div className="mt-2">
              <span
                className={cn(
                  'text-xs font-semibold',
                  step.status === 'current' ? 'text-forest' : 'text-gray-500'
                )}
              >
                {step.name}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
