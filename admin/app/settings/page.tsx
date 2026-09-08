'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import { formatCurrency } from '@/lib/utils';
import { apiAuth } from '@/lib/auth';

interface PricingSettings {
  [key: string]: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PricingSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await apiAuth<PricingSettings>('/api/v1/admin/settings');
        if (res.success && res.data) {
          setSettings(res.data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    const numVal = parseInt(value, 10);
    if (!isNaN(numVal) && numVal >= 0) {
      setSettings({ ...settings, [key]: numVal });
    }
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await apiAuth('/api/v1/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(res.error || 'Failed to save settings');
      }
    } catch {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="text-sm text-gray-500">Loading settings...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-navy">Settings</h1>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-600 disabled:opacity-50"
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-navy">Package Pricing</h2>
              <p className="mt-1 text-sm text-gray-500">Base prices for each rental package.</p>
              <div className="mt-6 space-y-4">
                {[
                  { key: 'package_24h_price', label: '24-Hour Package' },
                  { key: 'package_3d_price', label: '3-Day Package' },
                  { key: 'package_7d_price', label: '7-Day Package' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700">{label}</label>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-gray-400">$</span>
                      <input
                        type="number"
                        value={settings[key] !== undefined ? (settings[key] / 100).toFixed(2) : '0.00'}
                        onChange={(e) => handleChange(key, String(Math.round(parseFloat(e.target.value) * 100)))}
                        className="block w-full max-w-[160px] rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                      />
                      {settings[key] !== undefined && (
                        <span className="text-sm text-gray-500">({formatCurrency(settings[key])})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-navy">Additional Charges</h2>
              <p className="mt-1 text-sm text-gray-500">Fees for extra services and penalties.</p>
              <div className="mt-6 space-y-4">
                {[
                  { key: 'extra_day_price', label: 'Extra Day Fee' },
                  { key: 'extra_mile_price', label: 'Extra Mile Fee' },
                  { key: 'overweight_per_ton', label: 'Overweight Fee (per ton)' },
                  { key: 'failed_pickup_fee', label: 'Failed Pickup Fee' },
                  { key: 'cleaning_fee_max', label: 'Cleaning Fee (max)' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700">{label}</label>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-gray-400">$</span>
                      <input
                        type="number"
                        value={settings[key] !== undefined ? (settings[key] / 100).toFixed(2) : '0.00'}
                        onChange={(e) => handleChange(key, String(Math.round(parseFloat(e.target.value) * 100)))}
                        className="block w-full max-w-[160px] rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-navy">Delivery Settings</h2>
              <p className="mt-1 text-sm text-gray-500">Configure delivery radius and booking holds.</p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Included Miles</label>
                  <input
                    type="number"
                    value={settings.included_miles ?? ''}
                    onChange={(e) => handleChange('included_miles', e.target.value)}
                    className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                  <p className="mt-1 text-xs text-gray-400">Miles included in base price.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Booking Hold (minutes)</label>
                  <input
                    type="number"
                    value={settings.booking_hold_minutes ?? ''}
                    onChange={(e) => handleChange('booking_hold_minutes', e.target.value)}
                    className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                  <p className="mt-1 text-xs text-gray-400">How long to hold a reservation before payment is required.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
