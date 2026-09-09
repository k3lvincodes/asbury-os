'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiAuth } from '@/lib/auth';
import { useAuth } from '@/components/auth/AuthProvider';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  type: string;
  template: string;
  recipient: string;
  subject: string | null;
  status: string;
  sent_at: string | null;
  created_at: string;
  reservation_id?: string;
  reservations: {
    booking_number: string;
  } | {
    booking_number: string;
  }[] | null;
}

interface AdminHeaderProps {
  onMenuToggle?: () => void;
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [allLoading, setAllLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isUnread = (n: Notification) => n.status !== 'read';

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiAuth<{ data: Notification[] }>('/api/v1/admin/notifications?limit=20');
      if (res.success && res.data) {
        const notifs = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter(isUnread).length);
      } else if (res.error) {
        console.warn('[AdminHeader] Failed to fetch notifications:', res.error);
      }
    } catch (err) {
      console.error('[AdminHeader] Error fetching notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // 1. Poll every 10 seconds for timely updates
    const interval = setInterval(fetchNotifications, 10000);

    // 2. Realtime listener via Supabase on notifications table
    const channel = supabase
      .channel('admin-header-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    // 3. Auto-refresh whenever admin switches back to this tab/window
    const handleFocus = () => fetchNotifications();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchNotifications();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchAllNotifications(p: number) {
    setAllLoading(true);
    try {
      const res = await apiAuth<any>(
        `/api/v1/admin/notifications?page=${p}&limit=50`
      );
      if (res.success && res.data) {
        const notifs = Array.isArray(res.data) ? res.data : res.data.data || [];
        setAllNotifications(notifs);
        const total = (res as any).pagination?.total ?? (res.data as any)?.pagination?.total ?? notifs.length;
        setTotalPages(Math.max(1, Math.ceil(total / 50)));
      }
    } catch (err) {
      console.error('[AdminHeader] fetchAllNotifications error:', err);
    } finally {
      setAllLoading(false);
    }
  }

  function handleOpenAll() {
    setIsOpen(false);
    setShowAll(true);
    setPage(1);
    fetchAllNotifications(1);
  }

  async function handleMarkAsRead(id: string) {
    try {
      await apiAuth(`/api/v1/admin/notifications/${id}`, { method: 'PUT' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n))
      );
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[AdminHeader] handleMarkAsRead error:', err);
    }
  }

  async function handleMarkAllAsRead() {
    const unread = allNotifications.filter(isUnread);
    for (const notif of unread) {
      await handleMarkAsRead(notif.id);
    }
  }

  function getNotificationMessage(notif: Notification): string {
    const res = Array.isArray(notif.reservations) ? notif.reservations[0] : notif.reservations;
    const bookingNum = res?.booking_number || 'Unknown';
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

  function handleNotificationClick(notif: Notification) {
    if (isUnread(notif)) {
      handleMarkAsRead(notif.id);
    }
    if (notif.reservation_id) {
      setIsOpen(false);
      setShowAll(false);
      router.push(`/reservations/${notif.reservation_id}`);
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <h1 className="text-lg sm:text-xl font-semibold text-navy">Admin Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
            aria-label="Notifications"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-80 rounded-lg border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-gray-50/70">
                <h3 className="text-sm font-semibold text-navy">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-forest font-medium">{unreadCount} unread</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    <p className="font-medium text-gray-700">No notifications yet</p>
                    <p className="text-xs text-gray-400 mt-1">New booking and payment alerts will appear here</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const unread = isUnread(notif);
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                          unread ? 'bg-blue-50/80 border-l-4 border-forest' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {getNotificationMessage(notif)}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500 truncate">
                              {notif.recipient}
                            </p>
                            <p className="mt-0.5 text-[11px] text-gray-400">
                              {notif.sent_at ? formatDate(notif.sent_at) : formatDate(notif.created_at)}
                            </p>
                          </div>
                          {unread && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notif.id);
                              }}
                              className="shrink-0 text-xs font-medium text-forest hover:text-forest-600 px-1.5 py-0.5 rounded hover:bg-forest-50"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
                <button
                  onClick={handleOpenAll}
                  className="w-full text-center text-xs font-semibold text-forest hover:text-forest-600 py-1"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => signOut()}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Logout
        </button>
      </div>

      {showAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex h-[80vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
              <div>
                <h2 className="text-lg font-semibold text-navy">All Notifications</h2>
                <p className="text-xs text-gray-500 mt-0.5">History of customer and admin alerts</p>
              </div>
              <div className="flex items-center gap-3">
                {allNotifications.some(isUnread) && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm font-medium text-forest hover:text-forest-600 px-2 py-1 rounded hover:bg-forest-50"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowAll(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {allLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-sm text-gray-500 animate-pulse">Loading notifications...</div>
                </div>
              ) : allNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-sm font-medium text-gray-700">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-1">Confirmed bookings and system notifications will be listed here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {allNotifications.map((notif) => {
                    const unread = isUnread(notif);
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`px-6 py-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                          unread ? 'bg-blue-50/80 border-l-4 border-forest' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                notif.type === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {notif.type}
                              </span>
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                notif.status === 'sent' ? 'bg-green-100 text-green-800'
                                : notif.status === 'read' ? 'bg-gray-100 text-gray-600'
                                : notif.status === 'failed' ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {notif.status}
                              </span>
                            </div>
                            <p className="mt-1.5 text-sm font-semibold text-gray-900">
                              {getNotificationMessage(notif)}
                            </p>
                            <p className="mt-0.5 text-sm text-gray-500">
                              To: {notif.recipient}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-400">
                              {notif.sent_at ? formatDate(notif.sent_at) : formatDate(notif.created_at)}
                            </p>
                          </div>
                          {unread && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notif.id);
                              }}
                              className="shrink-0 text-sm font-medium text-forest hover:text-forest-600 px-2 py-1 rounded hover:bg-forest-50"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3">
                <button
                  onClick={() => { setPage((p) => p - 1); fetchAllNotifications(page - 1); }}
                  disabled={page === 1}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <button
                  onClick={() => { setPage((p) => p + 1); fetchAllNotifications(page + 1); }}
                  disabled={page === totalPages}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
