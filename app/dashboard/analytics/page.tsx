'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Clock } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Analytics {
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  todayOrders: number;
  averageOrderValue: number;
  popularItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  hourlySales: Array<{
    hour: number;
    revenue: number;
    orders: number;
  }>;
  categoryRevenue: Array<{
    name: string;
    revenue: number;
    orders: number;
  }>;
  dailySales: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

const COLORS = ['#D4AF37', '#800020', '#1a4d2e', '#4a5568', '#f4c430', '#a00028', '#2d7a4f'];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${dateRange}`);
      const data = await response.json();
      // Ensure all fields have default values
      setAnalytics({
        ...data,
        categoryRevenue: data.categoryRevenue || [],
        dailySales: data.dailySales || [],
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-300">Loading analytics...</div>
      </div>
    );
  }

  // Format data for charts
  const pieChartData = analytics.categoryRevenue.map((cat) => ({
    name: cat.name,
    value: cat.revenue,
  }));

  const barChartData = analytics.popularItems.slice(0, 8).map((item) => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    revenue: item.revenue,
    orders: item.quantity,
  }));

  const lineChartData = analytics.dailySales.map((day) => {
    const dateObj = new Date(day.date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${dateObj.getDate()} ${months[dateObj.getMonth()]}`;
    return {
      date: dateStr,
      revenue: day.revenue,
      orders: day.orders,
    };
  });

  const hourlyBarData = analytics.hourlySales
    .filter((h) => h.revenue > 0)
    .map((hour) => ({
      hour: `${hour.hour}:00`,
      revenue: hour.revenue,
      orders: hour.orders,
    }));

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#D4AF37] mb-2">Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-300">Business insights and performance metrics</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 sm:px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm sm:text-base"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <MetricCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Total Revenue"
          value={`£${analytics.totalRevenue.toFixed(2)}`}
          change={`£${analytics.todayRevenue.toFixed(2)} today`}
          color="bg-[#1a4d2e]"
        />
        <MetricCard
          icon={<BarChart3 className="w-6 h-6" />}
          label="Total Orders"
          value={analytics.totalOrders.toString()}
          change={`${analytics.todayOrders} today`}
          color="bg-[#4a5568]"
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Avg Order Value"
          value={`£${analytics.averageOrderValue.toFixed(2)}`}
          change=""
          color="bg-[#D4AF37]"
        />
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          label="Tables Served"
          value={analytics.todayOrders.toString()}
          change="Active"
          color="bg-[#800020]"
        />
      </div>

      {/* Charts Row 1: Pie Chart and Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Revenue by Category - Pie Chart */}
        <div className="bg-[#1a1a1a] rounded-lg shadow-md p-4 sm:p-6 border-2 border-[#800020]">
          <h2 className="text-lg sm:text-xl font-bold text-[#D4AF37] mb-4">Revenue by Category</h2>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `£${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #800020', borderRadius: '8px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-300">
              No data available
            </div>
          )}
        </div>

        {/* Popular Items Revenue - Bar Chart */}
        <div className="bg-[#1a1a1a] rounded-lg shadow-md p-4 sm:p-6 border-2 border-[#800020]">
          <h2 className="text-lg sm:text-xl font-bold text-[#D4AF37] mb-4">Top Items Revenue</h2>
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#800020" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                  stroke="#fff"
                />
                <YAxis stroke="#fff" />
                <Tooltip 
                  formatter={(value: number) => `£${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #800020', borderRadius: '8px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Bar dataKey="revenue" fill="#D4AF37" name="Revenue (£)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-300">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2: Line Chart and Hourly Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Daily Sales Trend - Line Chart */}
        <div className="bg-[#1a1a1a] rounded-lg shadow-md p-4 sm:p-6 border-2 border-[#800020]">
          <h2 className="text-lg sm:text-xl font-bold text-[#D4AF37] mb-4">Daily Sales Trend</h2>
          {lineChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#800020" />
                <XAxis dataKey="date" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  formatter={(value: number) => `£${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #800020', borderRadius: '8px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  name="Revenue (£)"
                  dot={{ fill: '#D4AF37', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#1a4d2e"
                  strokeWidth={2}
                  name="Orders"
                  dot={{ fill: '#1a4d2e', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-300">
              No data available
            </div>
          )}
        </div>

        {/* Hourly Sales - Bar Chart */}
        <div className="bg-[#1a1a1a] rounded-lg shadow-md p-4 sm:p-6 border-2 border-[#800020]">
          <h2 className="text-lg sm:text-xl font-bold text-[#D4AF37] mb-4">Hourly Sales</h2>
          {hourlyBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#800020" />
                <XAxis dataKey="hour" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  formatter={(value: number) => `£${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #800020', borderRadius: '8px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Bar dataKey="revenue" fill="#800020" name="Revenue (£)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-300">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Popular Items List */}
      <div className="bg-[#1a1a1a] rounded-lg shadow-md p-4 sm:p-6 border-2 border-[#800020]">
        <h2 className="text-lg sm:text-xl font-bold text-[#D4AF37] mb-4">Popular Items</h2>
        <div className="space-y-2 sm:space-y-3">
          {analytics.popularItems.slice(0, 10).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-[#2a2a2a] rounded-lg border border-[#800020] hover:border-[#D4AF37] transition-colors">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-bold text-xs sm:text-sm shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm sm:text-base truncate">{item.name}</div>
                  <div className="text-xs sm:text-sm text-gray-400">{item.quantity} orders</div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="font-semibold text-[#D4AF37] text-sm sm:text-base">
                  £{item.revenue.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  change,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  color: string;
}) {
  return (
    <div className="bg-[#1a1a1a] rounded-lg shadow-md p-6 border-2 border-[#800020]">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
      <div className="text-sm text-gray-300 mb-1">{label}</div>
      <div className="text-2xl font-bold text-[#D4AF37] mb-1">{value}</div>
      {change && <div className="text-sm text-gray-400">{change}</div>}
    </div>
  );
}
