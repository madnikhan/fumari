'use client';

import { useState, useEffect } from 'react';
import { Save, Building2 } from 'lucide-react';
import { showToast } from '@/components/Toast';

interface AccountingSettings {
  id: string;
  vatRegistrationNumber?: string;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  accountingYearStart: number;
  standardVATRate: number;
  zeroRatedVATRate: number;
  exemptVATRate: number;
  serviceChargeRate: number;
  currency: string;
  currencySymbol: string;
}

export default function AccountingSettingsPage() {
  const [settings, setSettings] = useState<AccountingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    vatRegistrationNumber: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    accountingYearStart: 1,
    standardVATRate: 20.0,
    zeroRatedVATRate: 0.0,
    exemptVATRate: 0.0,
    serviceChargeRate: 10.0,
    currency: 'GBP',
    currencySymbol: '£',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/accounting/settings', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setFormData({
          vatRegistrationNumber: data.vatRegistrationNumber || '',
          companyName: data.companyName || '',
          companyAddress: data.companyAddress || '',
          companyPhone: data.companyPhone || '',
          companyEmail: data.companyEmail || '',
          accountingYearStart: data.accountingYearStart || 1,
          standardVATRate: data.standardVATRate || 20.0,
          zeroRatedVATRate: data.zeroRatedVATRate || 0.0,
          exemptVATRate: data.exemptVATRate || 0.0,
          serviceChargeRate: data.serviceChargeRate || 10.0,
          currency: data.currency || 'GBP',
          currencySymbol: data.currencySymbol || '£',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/accounting/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast('Settings saved successfully', 'success');
        fetchSettings();
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#D4AF37] text-xl">Loading...</div>
      </div>
    );
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#D4AF37] mb-2">Accounting Settings</h1>
        <p className="text-gray-400">Configure VAT rates and company information for HMRC compliance</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
        {/* Company Information */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#D4AF37] mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                VAT Registration Number *
              </label>
              <input
                type="text"
                value={formData.vatRegistrationNumber}
                onChange={(e) => setFormData({ ...formData, vatRegistrationNumber: e.target.value })}
                placeholder="GB123456789"
                className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
              />
              <p className="text-xs text-gray-500 mt-1">Required for HMRC VAT returns</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company Email
              </label>
              <input
                type="email"
                value={formData.companyEmail}
                onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company Phone
              </label>
              <input
                type="tel"
                value={formData.companyPhone}
                onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company Address
              </label>
              <textarea
                value={formData.companyAddress}
                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* VAT Rates */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#D4AF37] mb-4">VAT Rates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Standard VAT Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.standardVATRate}
                onChange={(e) => setFormData({ ...formData, standardVATRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
              />
              <p className="text-xs text-gray-500 mt-1">UK Standard: 20%</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Zero-Rated VAT Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.zeroRatedVATRate}
                onChange={(e) => setFormData({ ...formData, zeroRatedVATRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Exempt VAT Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.exemptVATRate}
                onChange={(e) => setFormData({ ...formData, exemptVATRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* Other Settings */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#D4AF37] mb-4">Other Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Service Charge Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.serviceChargeRate}
                onChange={(e) => setFormData({ ...formData, serviceChargeRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Accounting Year Start Month
              </label>
              <select
                value={formData.accountingYearStart}
                onChange={(e) => setFormData({ ...formData, accountingYearStart: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
              >
                {months.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#333]">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

