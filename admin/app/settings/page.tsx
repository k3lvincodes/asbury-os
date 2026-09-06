'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import { formatCurrency } from '@/lib/utils';

interface PricingSettings {
  package24hPrice: number;
  package3dPrice: number;
  package7dPrice: number;
  extraDayPrice: number;
  extraMilePrice: number;
  overweightPerTon: number;
  failedPickupFee: number;
  cleaningFeeMax: number;
  includedMiles: number;
  bookingHoldMinutes: number;
}

const defaultSettings: PricingSettings = {
  package24hPrice: 22500,
  package3dPrice: 37500,
  package7dPrice: 67500,
  extraDayPrice: 7500,
  extraMilePrice: 300,
  overweightPerTon: 12500,
  failedPickupFee: 7500,
  cleaningFeeMax: 10000,
  includedMiles: 50,
  bookingHoldMinutes: 15,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<PricingSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof PricingSettings, value: string) => {
    const numVal = parseInt(value, 10);
    if (!isNaN(numVal) && numVal >= 0) {
      setSettings({ ...settings, [key]: numVal });
    }
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // In production, PUT to /api/v1/admin/settings
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-navy">Settings</h1>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-600 disabled:opacity-50"
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Package Pricing */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-navy">Package Pricing</h2>
              <p className="mt-1 text-sm text-gray-500">Base prices for each rental package.</p>
              
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">24-Hour Package</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={(settings.package24hPrice / 100).toFixed(2)}
                      onChange={(e) => handleChange('package24hPrice', String(Math.round(parseFloat(e.target.value) * 100)))}
                      className="block w-32 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                    />
                    <span className="text-sm text-gray-500">({formatCurrency(settings.package24hPrice)})</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">3-Day Package</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={(settings.package3dPrice / 100).toFixed(2)}
                      onChange={(e) => handleChange('package3dPrice', String(Math.round(parseFloat(e.target.value) * 100)))}
                      className="block w-32 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                    />
                    <span className="text-sm text-gray-500">({formatCurrency(settings.package3dPrice)})</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">7-Day Package</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={(settings.package7dPrice / 100).toFixed(2)}
                      onChange={(e) => handleChange('package7dPrice', String(Math.round(parseFloat(e.target.value) * 100)))}
                      className="block w-32 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                    />
                    <span className="text-sm text-gray-500">({formatCurrency(settings.package7dPrice)})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Charges */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-navy">Additional Charges</h2>
              <p className="mt-1 text-sm text-gray-500">Fees for extra services and penalties.</p>
              
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Extra Day Fee</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={(settings.extraDayPrice / 100).toFixed(2)}
                      onChange={(e) => handleChange('extraDayPrice', String(Math.round(parseFloat(e.target.value) * 100)))}
                      className="block w-32 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Extra Mile Fee</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={(settings.extraMilePrice / 100).toFixed(2)}
                      onChange={(e) => handleChange('extraMilePrice', String(Math.round(parseFloat(e.target.value) * 100)))}
                      className="block w-32 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Overweight Fee (per ton)</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={(settings.overweightPerTon / 100).toFixed(2)}
                      onChange={(e) => handleChange('overweightPerTon', String(Math.round(parseFloat(e.target.value) * 100)))}
                      className="block w-32 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Failed Pickup Fee</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={(settings.failedPickupFee / 100).toFixed(2)}
                      onChange={(e) => handleChange('failedPickupFee', String(Math.round(parseFloat(e.target.value) * 100)))}
                      className="block w-32 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Cleaning Fee (max)</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      value={(settings.cleaningFeeMax / 100).toFixed(2)}
                      onChange={(e) => handleChange('cleaningFeeMax', String(Math.round(parseFloat(e.target.value) * 100)))}
                      className="block w-32 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Settings */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-navy">Delivery Settings</h2>
              <p className="mt-1 text-sm text-gray-500">Configure delivery radius and booking holds.</p>
              
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Included Miles</label>
                  <input
                    type="number"
                    value={settings.includedMiles}
                    onChange={(e) => handleChange('includedMiles', e.target.value)}
                    className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                  <p className="mt-1 text-xs text-gray-400">Miles included in base price. Extra miles charged at ${formatCurrency(settings.extraMilePrice)}/mile.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Booking Hold (minutes)</label>
                  <input
                    type="number"
                    value={settings.bookingHoldMinutes}
                    onChange={(e) => handleChange('bookingHoldMinutes', e.target.value)}
                    className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                  <p className="mt-1 text-xs text-gray-400">How long to hold a reservation before payment is required.</p>
                </div>
              </div>
            </div>

            {/* Business Info */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-navy">Business Information</h2>
              <p className="mt-1 text-sm text-gray-500">Contact and business details shown to customers.</p>
              
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Name</label>
                  <input
                    type="text"
                    defaultValue="Asbury Outdoor Services"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    defaultValue="(304) 555-0100"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    defaultValue="info@asburyoutdoorservices.com"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    defaultValue="Charleston, WV"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}