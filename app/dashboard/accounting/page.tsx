'use client';

import { useState, useEffect } from 'react';
import { Receipt, TrendingUp, TrendingDown, DollarSign, Calendar, FileText, Settings, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  todaySales: {
    orders: number;
    subtotal: number;
    vat: number;
    serviceCharge: number;
    total: number;
  };
  thisWeekSales: {
    orders: number;
    subtotal: number;
    vat: number;
    serviceCharge: number;
    total: number;
  };
  thisMonthSales: {
    orders: number;
    subtotal: number;
    vat: number;
    serviceCharge: number;
    total: number;
  };
  thisMonthPurchases: {
    count: number;
    subtotal: number;
    vat: number;
    total: number;
  };
  vatDue: number;
}

export default function AccountingDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      const todayResponse = await fetch(`/api/accounting/reports/daily-sales?date=${today}`, {
        credentials: 'include',
      });
      
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weeklyResponse = await fetch(`/api/accounting/reports/weekly?weekStart=${weekStart.toISOString().split('T')[0]}`, {
        credentials: 'include',
      });
      
      const now = new Date();
      const monthlyResponse = await fetch(`/api/accounting/reports/monthly?year=${now.getFullYear()}&month=${now.getMonth() + 1}`, {
        credentials: 'include',
      });
      
      const purchasesResponse = await fetch(`/api/accounting/reports/purchases?period=monthly&year=${now.getFullYear()}&month=${now.getMonth() + 1}`, {
        credentials: 'include',
      });

      const [todayData, weeklyData, monthlyData, purchasesData] = await Promise.all([
        todayResponse.ok ? todayResponse.json() : null,
        weeklyResponse.ok ? weeklyResponse.json() : null,
        monthlyResponse.ok ? monthlyResponse.json() : null,
        purchasesResponse.ok ? purchasesResponse.json() : null,
      ]);

      // Calculate VAT due (Output VAT - Input VAT)
      const outputVAT = monthlyData?.totals?.totalVAT || 0;
      const inputVAT = purchasesData?.totals?.totalVAT || 0;
      const vatDue = Math.round((outputVAT - inputVAT) * 100) / 100;

      setStats({
        todaySales: {
          orders: todayData?.totals?.totalOrders || 0,
          subtotal: todayData?.totals?.totalSubtotal || 0,
          vat: todayData?.totals?.totalVAT || 0,
          serviceCharge: todayData?.totals?.totalServiceCharge || 0,
          total: todayData?.totals?.totalAmount || 0,
        },
        thisWeekSales: {
          orders: weeklyData?.totals?.totalOrders || 0,
          subtotal: weeklyData?.totals?.totalSubtotal || 0,
          vat: weeklyData?.totals?.totalVAT || 0,
          serviceCharge: weeklyData?.totals?.totalServiceCharge || 0,
          total: weeklyData?.totals?.totalAmount || 0,
        },
        thisMonthSales: {
          orders: monthlyData?.totals?.totalOrders || 0,
          subtotal: monthlyData?.totals?.totalSubtotal || 0,
          vat: monthlyData?.totals?.totalVAT || 0,
          serviceCharge: monthlyData?.totals?.totalServiceCharge || 0,
          total: monthlyData?.totals?.totalAmount || 0,
        },
        thisMonthPurchases: {
          count: purchasesData?.totals?.totalPurchases || 0,
          subtotal: purchasesData?.totals?.totalSubtotal || 0,
          vat: purchasesData?.totals?.totalVAT || 0,
          total: purchasesData?.totals?.totalAmount || 0,
        },
        vatDue,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#D4AF37] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#D4AF37] mb-2">Accounting Dashboard</h1>
        <p className="text-gray-400">HMRC-compliant financial overview</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Link
          href="/dashboard/accounting/purchases"
          className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 hover:border-[#D4AF37] transition-colors"
        >
          <Receipt className="w-8 h-8 text-[#D4AF37] mb-2" />
          <div className="text-sm text-gray-400">Purchases</div>
        </Link>
        <Link
          href="/dashboard/accounting/suppliers"
          className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 hover:border-[#D4AF37] transition-colors"
        >
          <FileText className="w-8 h-8 text-[#D4AF37] mb-2" />
          <div className="text-sm text-gray-400">Suppliers</div>
        </Link>
        <Link
          href="/dashboard/accounting/reports"
          className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 hover:border-[#D4AF37] transition-colors"
        >
          <BarChart3 className="w-8 h-8 text-[#D4AF37] mb-2" />
          <div className="text-sm text-gray-400">Reports</div>
        </Link>
        <Link
          href="/dashboard/accounting/vat-returns"
          className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 hover:border-[#D4AF37] transition-colors"
        >
          <Calendar className="w-8 h-8 text-[#D4AF37] mb-2" />
          <div className="text-sm text-gray-400">VAT Returns</div>
        </Link>
        <Link
          href="/dashboard/accounting/settings"
          className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 hover:border-[#D4AF37] transition-colors"
        >
          <Settings className="w-8 h-8 text-[#D4AF37] mb-2" />
          <div className="text-sm text-gray-400">Settings</div>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Today's Sales</div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-[#D4AF37]">
            £{stats?.todaySales.total.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats?.todaySales.orders || 0} orders • VAT: £{stats?.todaySales.vat.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">This Week</div>
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            £{stats?.thisWeekSales.total.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats?.thisWeekSales.orders || 0} orders • VAT: £{stats?.thisWeekSales.vat.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">This Month</div>
            <DollarSign className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-bold text-white">
            £{stats?.thisMonthSales.total.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats?.thisMonthSales.orders || 0} orders • VAT: £{stats?.thisMonthSales.vat.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className={`bg-[#1a1a1a] border rounded-lg p-6 ${stats?.vatDue && stats.vatDue > 0 ? 'border-red-500' : 'border-green-500'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">VAT Due</div>
            {stats?.vatDue && stats.vatDue > 0 ? (
              <TrendingDown className="w-5 h-5 text-red-400" />
            ) : (
              <TrendingUp className="w-5 h-5 text-green-400" />
            )}
          </div>
          <div className={`text-2xl font-bold ${stats?.vatDue && stats.vatDue > 0 ? 'text-red-400' : 'text-green-400'}`}>
            £{Math.abs(stats?.vatDue || 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats?.vatDue && stats.vatDue > 0 ? 'Payable to HMRC' : 'Reclaimable from HMRC'}
          </div>
        </div>
      </div>

      {/* Sales vs Purchases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
          <h2 className="text-xl font-bold text-[#D4AF37] mb-4">This Month - Sales</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Orders:</span>
              <span className="text-white font-bold">{stats?.thisMonthSales.orders || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal:</span>
              <span className="text-white">£{stats?.thisMonthSales.subtotal.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">VAT (20%):</span>
              <span className="text-blue-400 font-bold">£{stats?.thisMonthSales.vat.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Service Charge (10%):</span>
              <span className="text-purple-400 font-bold">£{stats?.thisMonthSales.serviceCharge?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#333]">
              <span className="text-[#D4AF37] font-bold">Total Revenue:</span>
              <span className="text-[#D4AF37] font-bold text-xl">£{stats?.thisMonthSales.total.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
          <h2 className="text-xl font-bold text-[#D4AF37] mb-4">This Month - Purchases</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Purchases:</span>
              <span className="text-white font-bold">{stats?.thisMonthPurchases.count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal:</span>
              <span className="text-white">£{stats?.thisMonthPurchases.subtotal.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">VAT (20%):</span>
              <span className="text-blue-400 font-bold">£{stats?.thisMonthPurchases.vat.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#333]">
              <span className="text-[#D4AF37] font-bold">Total Expenses:</span>
              <span className="text-[#D4AF37] font-bold text-xl">£{stats?.thisMonthPurchases.total.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* VAT Summary */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
        <h2 className="text-xl font-bold text-[#D4AF37] mb-4">VAT Summary (This Month)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Output VAT</div>
            <div className="text-2xl font-bold text-blue-400">
              £{stats?.thisMonthSales.vat.toFixed(2) || '0.00'}
            </div>
            <div className="text-xs text-gray-500 mt-1">VAT on sales</div>
          </div>
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Input VAT</div>
            <div className="text-2xl font-bold text-green-400">
              £{stats?.thisMonthPurchases.vat.toFixed(2) || '0.00'}
            </div>
            <div className="text-xs text-gray-500 mt-1">VAT on purchases</div>
          </div>
          <div className={`rounded-lg p-4 ${stats?.vatDue && stats.vatDue > 0 ? 'bg-red-900/20 border border-red-500' : 'bg-green-900/20 border border-green-500'}`}>
            <div className="text-sm text-gray-400 mb-1">Net VAT</div>
            <div className={`text-2xl font-bold ${stats?.vatDue && stats.vatDue > 0 ? 'text-red-400' : 'text-green-400'}`}>
              £{Math.abs(stats?.vatDue || 0).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats?.vatDue && stats.vatDue > 0 ? 'Payable' : 'Reclaimable'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

