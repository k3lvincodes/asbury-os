'use client';

import { useState, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  disabledDates?: Date[];
  bookedDates?: string[];
  minDate?: Date;
  onMonthChange?: (month: Date) => void;
}

export default function DatePicker({
  selected,
  onSelect,
  disabledDates = [],
  bookedDates = [],
  minDate = new Date(),
  onMonthChange,
}: DatePickerProps) {
  const [month, setMonth] = useState<Date>(selected || new Date());

  const bookedDateObjects = useMemo(
    () => bookedDates.map((d) => {
      const [y, m, day] = d.split('-').map(Number);
      return new Date(y, m - 1, day, 0, 0, 0, 0);
    }),
    [bookedDates]
  );

  // Normalise minDate to midnight local to avoid same-day being disabled
  const normalisedMinDate = new Date(
    minDate.getFullYear(), minDate.getMonth(), minDate.getDate(), 0, 0, 0, 0
  );

  const allDisabled = [...disabledDates, ...bookedDateObjects];

  const handleMonthChange = (newMonth: Date) => {
    setMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  return (
    <div className={cn('rounded-lg bg-white')}>
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        month={month}
        onMonthChange={handleMonthChange}
        disabled={[
          { before: normalisedMinDate },
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
          caption: { color: '#1a1a2e', fontSize: '13px', fontWeight: 600 },
          head_cell: { color: '#6b7280', fontSize: '11px', fontWeight: 500 },
          day: { fontSize: '12px', margin: '1px' },
        }}
      />
    </div>
  );
}
