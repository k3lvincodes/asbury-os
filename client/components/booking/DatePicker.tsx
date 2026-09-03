'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  disabledDates?: Date[];
  minDate?: Date;
}

export default function DatePicker({
  selected,
  onSelect,
  disabledDates = [],
  minDate = new Date(),
}: DatePickerProps) {
  const [month, setMonth] = useState<Date>(selected || new Date());

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        month={month}
        onMonthChange={setMonth}
        disabled={[
          { before: minDate },
          ...disabledDates,
        ]}
        modifiers={{
          booked: disabledDates,
        }}
        modifiersStyles={{
          booked: {
            backgroundColor: '#fee2e2',
            color: '#dc2626',
          },
        }}
        styles={{
          caption: { color: '#1a1a2e' },
          head_cell: { color: '#666666' },
          day: { fontSize: '14px' },
        }}
      />
    </div>
  );
}
