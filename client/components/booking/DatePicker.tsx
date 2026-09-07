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
}

export default function DatePicker({
  selected,
  onSelect,
  disabledDates = [],
  bookedDates = [],
  minDate = new Date(),
}: DatePickerProps) {
  const [month, setMonth] = useState<Date>(selected || new Date());

  const bookedDateObjects = useMemo(
    () => bookedDates.map((d) => new Date(d + 'T00:00:00')),
    [bookedDates]
  );

  const allDisabled = [...disabledDates, ...bookedDateObjects];

  return (
    <div className="rounded-lg bg-white">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        month={month}
        onMonthChange={setMonth}
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
          caption: { color: '#1a1a2e', fontSize: '13px', fontWeight: 600 },
          head_cell: { color: '#6b7280', fontSize: '11px', fontWeight: 500 },
          day: { fontSize: '12px', margin: '1px' },
        }}
      />
    </div>
  );
}
