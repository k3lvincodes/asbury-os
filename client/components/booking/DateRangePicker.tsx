'use client';

import { useState, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { formatDate } from '@/lib/utils';

interface DateRangePickerProps {
  selected?: DateRange;
  onSelect: (range: DateRange | undefined) => void;
  disabledDates?: Date[];
  bookedDates?: string[];
  minDate?: Date;
}

export default function DateRangePicker({
  selected,
  onSelect,
  disabledDates = [],
  bookedDates = [],
  minDate = new Date(),
}: DateRangePickerProps) {
  const [month, setMonth] = useState<Date>(selected?.from || new Date());

  const bookedDateObjects = useMemo(
    () => bookedDates.map((d) => new Date(d + 'T00:00:00')),
    [bookedDates]
  );

  const allDisabled = [...disabledDates, ...bookedDateObjects];

  return (
    <div className="flex flex-col items-center gap-4">
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={onSelect}
        month={month}
        onMonthChange={setMonth}
        numberOfMonths={1}
        disabled={[
          { before: minDate },
          ...allDisabled,
        ]}
        modifiers={{
          booked: bookedDateObjects,
        }}
        modifiersStyles={{
          booked: {
            backgroundColor: '#fee2e2',
            color: '#dc2626',
          },
        }}
        styles={{
          caption: { color: '#1a1a2e', fontSize: '14px', fontWeight: 600 },
          head_cell: { color: '#6b7280', fontSize: '12px', fontWeight: 500 },
          day: { fontSize: '13px' },
        }}
      />

      {selected?.from && (
        <div className="w-full rounded-lg bg-forest-light border border-forest/20 px-4 py-3 text-center">
          {selected.to ? (
            <p className="text-sm font-medium text-navy">
              {formatDate(selected.from)} → {formatDate(selected.to)}
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Selected: <span className="font-semibold text-navy">{formatDate(selected.from)}</span> — now pick the end date
            </p>
          )}
        </div>
      )}
    </div>
  );
}
