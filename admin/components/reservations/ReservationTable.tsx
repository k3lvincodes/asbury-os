'use client';

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Reservation {
  id: string;
  bookingNumber: string;
  customerName: string;
  packageName: string;
  startDate: string;
  endDate: string;
  amountDueCents: number;
  status: string;
  paymentStatus: string;
}

const columnHelper = createColumnHelper<Reservation>();

const columns = [
  columnHelper.accessor('bookingNumber', {
    header: 'Booking #',
    cell: (info) => (
      <Link href={`/reservations/${info.row.original.id}`} className="text-sm font-medium text-forest hover:text-forest-600">
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor('customerName', { header: 'Customer' }),
  columnHelper.accessor('packageName', { header: 'Package' }),
  columnHelper.accessor('startDate', {
    header: 'Start Date',
    cell: (info) => formatDate(info.getValue()),
  }),
  columnHelper.accessor('endDate', {
    header: 'End Date',
    cell: (info) => formatDate(info.getValue()),
  }),
  columnHelper.accessor('amountDueCents', {
    header: 'Amount',
    cell: (info) => formatCurrency(info.getValue()),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
        info.getValue() === 'confirmed' ? 'bg-green-100 text-green-800'
        : info.getValue() === 'pending' ? 'bg-yellow-100 text-yellow-800'
        : 'bg-gray-100 text-gray-800'
      }`}>
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('paymentStatus', {
    header: 'Payment',
    cell: (info) => (
      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
        info.getValue() === 'paid' ? 'bg-green-100 text-green-800'
        : info.getValue() === 'pending' ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800'
      }`}>
        {info.getValue()}
      </span>
    ),
  }),
];

interface ReservationTableProps {
  data: Reservation[];
}

export default function ReservationTable({ data }: ReservationTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}