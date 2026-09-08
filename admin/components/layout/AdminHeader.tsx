'use client';

import { useState, useEffect, useRef } from 'react';
import { apiAuth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  template: string;
  recipient: string;
  subject: string | null;
  status: string;
  sent_at: string | null;
  created_at: string;
  reservations: {
    booking_number: string;
  } | null;
}

export default function AdminHeader() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await apiAuth<{ data: Notification[] }>('/api/v1/admin/notifications?limit=20');
      if (res.success && res.data) {
        const notifs = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: Notification) => n.status === 'sent').length);
      }
    } catch {
      // silently fail
    }
  }

  async function handleMarkAsRead(id: string) {
    try {
      await apiAuth(`/api/v1/admin/notifications/${id}`, { method: 'PUT' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  }

  function getNotificationMessage(notif: Notification): string {
    const bookingNum = notif.reservations?.booking_number || 'Unknown';
    switch (notif.template) {
      case 'reservation_confirmed':
        return `Reservation ${bookingNum} confirmed`;
      case 'reservation_confirmed_admin':
        return `New reservation: ${bookingNum}`;
      case 'booking_confirmation':
        return `Booking ${bookingNum} confirmed`;
      case 'payment_failed':
        return `Payment failed for ${bookingNum}`;
      case 'additional_charge':
        return `Additional charge for ${bookingNum}`;
      default:
        return notif.subject || `${notif.type} notification`;
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-navy">Admin Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
              <div className="border-b border-gray-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-navy">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`border-b border-gray-100 px-4 py-3 hover:bg-gray-50 ${
                        notif.status === 'sent' ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {getNotificationMessage(notif)}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {notif.recipient}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {notif.sent_at ? formatDate(notif.sent_at) : formatDate(notif.created_at)}
                          </p>
                        </div>
                        {notif.status === 'sent' && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="ml-2 text-xs text-forest hover:text-forest-600"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-gray-200 px-4 py-2">
                <a
                  href="/notifications"
                  className="text-center text-xs font-medium text-forest hover:text-forest-600"
                >
                  View all notifications
                </a>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
