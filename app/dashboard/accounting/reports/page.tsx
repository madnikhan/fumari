'use client';

import { useState, useEffect } from 'react';
import { Calendar, Download, FileText, TrendingUp, FileDown } from 'lucide-react';
import { showToast } from '@/components/Toast';
import { exportSalesReportToPDF } from '@/lib/pdf-export';

type ReportType = 'daily' | 'weekly' | 'monthly';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedDate, selectedYear, selectedMonth]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      
      if (reportType === 'daily') {
        const response = await fetch(`/api/accounting/reports/daily-sales?date=${selectedDate}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setReport({ type: 'daily', ...data });
        }
      } else if (reportType === 'weekly') {
        const weekStart = new Date(selectedDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const response = await fetch(`/api/accounting/reports/weekly?weekStart=${weekStart.toISOString().split('T')[0]}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setReport({ type: 'weekly', ...data });
        }
      } else if (reportType === 'monthly') {
        const response = await fetch(`/api/accounting/reports/monthly?year=${selectedYear}&month=${selectedMonth}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setReport({ type: 'monthly', ...data });
        }
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      showToast('Failed to load report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!report) return;

    let csvContent = '';
    let filename = '';

    if (report.type === 'daily') {
      filename = `daily-sales-${report.date}.csv`;
      const headers = ['Date', 'Order ID', 'Table', 'Subtotal', 'VAT', 'Service Charge', 'Total'];
      const rows = report.orders.map((order: any) => [
        new Date(order.createdAt).toLocaleDateString('en-GB'),
        order.id.substring(0, 8),
        order.table.number,
        order.subtotal.toFixed(2),
        order.vatAmount.toFixed(2),
        order.serviceCharge.toFixed(2),
        order.total.toFixed(2),
      ]);
      csvContent = [
        headers.join(','),
        ...rows.map((row: any) => row.join(',')),
        '',
        'Totals',
        `${report.totals.totalOrders}`,
        '',
        report.totals.totalSubtotal.toFixed(2),
        report.totals.totalVAT.toFixed(2),
        report.totals.totalServiceCharge.toFixed(2),
        report.totals.totalAmount.toFixed(2),
      ].join('\n');
    } else if (report.type === 'weekly') {
      filename = `weekly-sales-${report.weekStart}.csv`;
      csvContent = [
        `Weekly Sales Report: ${report.weekStart} to ${report.weekEnd}`,
        '',
        'Day,Orders,Subtotal,VAT,Service Charge,Total',
        ...report.dailyBreakdown.map((day: any) => [
          day.date,
          day.orders.length,
          day.subtotal.toFixed(2),
          day.vat.toFixed(2),
          day.serviceCharge.toFixed(2),
          day.total.toFixed(2),
        ].join(',')),
        '',
        'Totals',
        `${report.totals.totalOrders}`,
        report.totals.totalSubtotal.toFixed(2),
        report.totals.totalVAT.toFixed(2),
        report.totals.totalServiceCharge.toFixed(2),
        report.totals.totalAmount.toFixed(2),
      ].join('\n');
    } else if (report.type === 'monthly') {
      filename = `monthly-sales-${report.year}-${report.month}.csv`;
      csvContent = [
        `Monthly Sales Report: ${report.monthName} ${report.year}`,
        '',
        'Date,Orders,Subtotal,VAT,Service Charge,Total',
        ...report.dailyBreakdown.map((day: any) => [
          day.date,
          day.orders,
          day.subtotal.toFixed(2),
          day.vat.toFixed(2),
          day.serviceCharge.toFixed(2),
          day.total.toFixed(2),
        ].join(',')),
        '',
        'Totals',
        `${report.totals.totalOrders}`,
        report.totals.totalSubtotal.toFixed(2),
        report.totals.totalVAT.toFixed(2),
        report.totals.totalServiceCharge.toFixed(2),
        report.totals.totalAmount.toFixed(2),
      ].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Report exported successfully', 'success');
  };

  const exportToPDF = async () => {
    if (!report) return;

    try {
      setExportingPDF(true);
      
      // Fetch company settings
      const settingsResponse = await fetch('/api/accounting/settings', {
        credentials: 'include',
      });
      
      if (!settingsResponse.ok) {
        throw new Error('Failed to fetch company settings');
      }
      
      const settings = await settingsResponse.json();
      
      // Export to PDF
      await exportSalesReportToPDF(report, settings);
      
      showToast('PDF exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showToast('Failed to export PDF', 'error');
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#FFE176] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#FFE176] mb-2">Sales Reports</h1>
          <p className="text-[#E5E5E5]">View daily, weekly, and monthly sales with VAT breakdown</p>
        </div>
        {report && (
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="bg-[#2A2B2F] hover:bg-[#3A3B3F] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 border border-[#9B4E3F]"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
            <button
              onClick={exportToPDF}
              disabled={exportingPDF}
              className="bg-[#FFE176] hover:bg-[#E6C966] text-[#212226] font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown className="w-5 h-5" />
              {exportingPDF ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        )}
      </div>

      {/* Report Type Selector */}
      <div className="bg-[#2A2B2F] border border-[#9B4E3F] rounded-lg p-4 mb-6">
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as ReportType[]).map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reportType === type
                  ? 'bg-[#FFE176] text-[#212226]'
                  : 'bg-[#212226] text-[#E5E5E5] hover:bg-[#3A3B3F]'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-[#2A2B2F] border border-[#9B4E3F] rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Calendar className="w-5 h-5 text-[#FFE176]" />
          {reportType === 'daily' && (
            <>
              <label className="text-[#E5E5E5] font-medium">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-[#212226] border border-[#9B4E3F] rounded-lg text-white focus:outline-none focus:border-[#FFE176]"
              />
            </>
          )}
          {reportType === 'weekly' && (
            <>
              <label className="text-[#E5E5E5] font-medium">Select Week Start:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-[#212226] border border-[#9B4E3F] rounded-lg text-white focus:outline-none focus:border-[#FFE176]"
              />
            </>
          )}
          {reportType === 'monthly' && (
            <>
              <label className="text-[#E5E5E5] font-medium">Year:</label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 bg-[#212226] border border-[#9B4E3F] rounded-lg text-white focus:outline-none focus:border-[#FFE176] w-24"
              />
              <label className="text-[#E5E5E5] font-medium">Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 bg-[#212226] border border-[#9B4E3F] rounded-lg text-white focus:outline-none focus:border-[#FFE176]"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleString('en-GB', { month: 'long' })}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {report && report.totals ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#2A2B2F] border border-[#9B4E3F] rounded-lg p-6">
              <div className="text-sm text-[#E5E5E5] mb-1">Total Orders</div>
              <div className="text-3xl font-bold text-[#FFE176]">{report.totals.totalOrders}</div>
            </div>
            <div className="bg-[#2A2B2F] border border-[#9B4E3F] rounded-lg p-6">
              <div className="text-sm text-[#E5E5E5] mb-1">Subtotal</div>
              <div className="text-3xl font-bold text-white">£{report.totals.totalSubtotal.toFixed(2)}</div>
            </div>
            <div className="bg-[#2A2B2F] border border-[#9B4E3F] rounded-lg p-6">
              <div className="text-sm text-[#E5E5E5] mb-1">VAT (20%)</div>
              <div className="text-3xl font-bold text-[#1B4527]">£{report.totals.totalVAT.toFixed(2)}</div>
            </div>
            <div className="bg-[#2A2B2F] border border-[#9B4E3F] rounded-lg p-6">
              <div className="text-sm text-[#E5E5E5] mb-1">Total Revenue</div>
              <div className="text-3xl font-bold text-[#FFE176]">£{report.totals.totalAmount.toFixed(2)}</div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-[#2A2B2F] border border-[#9B4E3F] rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-[#FFE176] mb-4">Financial Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-[#E5E5E5]">Subtotal (before VAT):</span>
                <span className="text-white font-bold">£{report.totals.totalSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-[#E5E5E5]">VAT (20%):</span>
                <span className="text-[#1B4527] font-bold">£{report.totals.totalVAT.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-[#E5E5E5]">Service Charge:</span>
                <span className="text-white font-bold">£{report.totals.totalServiceCharge.toFixed(2)}</span>
              </div>
              {report.totals.totalDiscount > 0 && (
                <div className="flex justify-between text-lg">
                  <span className="text-[#E5E5E5]">Discounts:</span>
                  <span className="text-[#9B4E3F] font-bold">-£{report.totals.totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl pt-3 border-t border-[#9B4E3F]">
                <span className="text-[#FFE176] font-bold">Total Revenue:</span>
                <span className="text-[#FFE176] font-bold">£{report.totals.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Daily/Weekly Breakdown */}
          {(report.type === 'weekly' || report.type === 'monthly') && report.dailyBreakdown && (
            <div className="bg-[#2A2B2F] border border-[#9B4E3F] rounded-lg overflow-hidden mb-6">
              <div className="p-4 border-b border-[#9B4E3F]">
                <h2 className="text-xl font-bold text-[#FFE176]">
                  {report.type === 'weekly' ? 'Daily Breakdown' : 'Daily Summary'}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#212226]">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#FFE176]">Date</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-[#FFE176]">Orders</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-[#FFE176]">Subtotal</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-[#FFE176]">VAT</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-[#FFE176]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.dailyBreakdown.map((day: any, index: number) => (
                      <tr key={index} className="border-t border-[#9B4E3F] hover:bg-[#212226]">
                        <td className="px-4 py-3 text-white">
                          {new Date(day.date).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-4 py-3 text-right text-white">
                          {day.orders?.length || day.orders || 0}
                        </td>
                        <td className="px-4 py-3 text-right text-white">£{day.subtotal.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-[#1B4527]">£{day.vat.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-[#FFE176] font-bold">
                          £{day.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-[#2A2B2F] border border-[#9B4E3F] rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-[#9B4E3F] mx-auto mb-4" />
          <p className="text-[#E5E5E5]">No data available for selected period</p>
        </div>
      )}
    </div>
  );
}
