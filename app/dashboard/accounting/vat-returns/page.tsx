'use client';

import { useState, useEffect } from 'react';
import { Plus, Download, CheckCircle2, Calendar, FileText } from 'lucide-react';
import { showToast } from '@/components/Toast';

interface TaxPeriod {
  id: string;
  startDate: string;
  endDate: string;
  quarter: number;
  year: number;
  status: string;
  vatReturns: VATReturn[];
}

interface VATReturn {
  id: string;
  taxPeriodId: string;
  outputVAT: number;
  inputVAT: number;
  vatDue: number;
  submittedAt?: string;
  submittedBy?: string;
  taxPeriod?: TaxPeriod;
}

export default function VATReturnsPage() {
  const [periods, setPeriods] = useState<TaxPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    fetchPeriods();
  }, [selectedYear]);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/accounting/tax-periods?year=${selectedYear}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPeriods(data);
      }
    } catch (error) {
      console.error('Error fetching tax periods:', error);
      showToast('Failed to load tax periods', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateVATReturn = async (periodId: string) => {
    try {
      setGenerating(periodId);
      const response = await fetch('/api/accounting/vat-returns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ taxPeriodId: periodId }),
      });

      if (response.ok) {
        const data = await response.json();
        showToast('VAT return generated successfully', 'success');
        fetchPeriods();
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to generate VAT return', 'error');
      }
    } catch (error) {
      showToast('Failed to generate VAT return', 'error');
    } finally {
      setGenerating(null);
    }
  };

  const submitVATReturn = async (returnId: string) => {
    if (!confirm('Are you sure you want to submit this VAT return? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/accounting/vat-returns/${returnId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (response.ok) {
        showToast('VAT return submitted successfully', 'success');
        fetchPeriods();
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to submit VAT return', 'error');
      }
    } catch (error) {
      showToast('Failed to submit VAT return', 'error');
    }
  };

  const exportVATReturn = async (returnId: string) => {
    try {
      const response = await fetch(`/api/accounting/vat-returns/${returnId}/export?format=csv`, {
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vat-return-${returnId}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        showToast('VAT return exported successfully', 'success');
      } else {
        showToast('Failed to export VAT return', 'error');
      }
    } catch (error) {
      showToast('Failed to export VAT return', 'error');
    }
  };

  const getQuarterDates = (year: number, quarter: number) => {
    const startMonth = (quarter - 1) * 3;
    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, startMonth + 3, 0);
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  };

  // Ensure we have all 4 quarters for the selected year
  const allQuarters = [1, 2, 3, 4].map((q) => {
    const existing = periods.find((p) => p.quarter === q && p.year === selectedYear);
    if (existing) return existing;
    const dates = getQuarterDates(selectedYear, q);
    return {
      id: '',
      startDate: dates.start,
      endDate: dates.end,
      quarter: q,
      year: selectedYear,
      status: 'open',
      vatReturns: [],
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#D4AF37] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#D4AF37] mb-2">VAT Returns</h1>
          <p className="text-gray-400">Generate and submit quarterly VAT returns to HMRC</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-gray-300">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allQuarters.map((period) => {
          const vatReturn = period.vatReturns?.[0];
          const isSubmitted = vatReturn?.submittedAt;
          const statusColor = isSubmitted
            ? 'border-green-500'
            : vatReturn
            ? 'border-blue-500'
            : 'border-[#333]';

          return (
            <div
              key={`${period.year}-Q${period.quarter}`}
              className={`bg-[#1a1a1a] border-2 ${statusColor} rounded-lg p-6`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#D4AF37]">
                    {period.year} Q{period.quarter}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(period.startDate).toLocaleDateString('en-GB')} -{' '}
                    {new Date(period.endDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
                {isSubmitted && (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Submitted</span>
                  </div>
                )}
              </div>

              {vatReturn ? (
                <>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Output VAT:</span>
                      <span className="text-blue-400 font-bold">£{vatReturn.outputVAT.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Input VAT:</span>
                      <span className="text-green-400 font-bold">£{vatReturn.inputVAT.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#333]">
                      <span className="text-[#D4AF37] font-bold">VAT Due:</span>
                      <span
                        className={`font-bold text-xl ${
                          vatReturn.vatDue > 0 ? 'text-red-400' : 'text-green-400'
                        }`}
                      >
                        £{Math.abs(vatReturn.vatDue).toFixed(2)}
                      </span>
                    </div>
                    {vatReturn.submittedAt && (
                      <div className="text-xs text-gray-500 pt-2 border-t border-[#333]">
                        Submitted: {new Date(vatReturn.submittedAt).toLocaleString('en-GB')}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {!isSubmitted && (
                      <button
                        onClick={() => submitVATReturn(vatReturn.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        Submit to HMRC
                      </button>
                    )}
                    <button
                      onClick={() => exportVATReturn(vatReturn.id)}
                      className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No VAT return generated yet</p>
                  <button
                    onClick={() => {
                      // Create period if it doesn't exist, then generate return
                      generateVATReturn(period.id || 'new');
                    }}
                    disabled={generating === period.id}
                    className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 mx-auto disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    {generating === period.id ? 'Generating...' : 'Generate VAT Return'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-blue-900/20 border border-blue-500 rounded-lg p-4">
        <h3 className="text-lg font-bold text-blue-400 mb-2">HMRC VAT Return Information</h3>
        <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
          <li>VAT returns must be submitted quarterly to HMRC</li>
          <li>Output VAT = VAT collected on sales (Box 1)</li>
          <li>Input VAT = VAT paid on purchases (Box 4)</li>
          <li>VAT Due = Output VAT - Input VAT (Box 5)</li>
          <li>Export the CSV file and submit via HMRC online portal</li>
        </ul>
      </div>
    </div>
  );
}

