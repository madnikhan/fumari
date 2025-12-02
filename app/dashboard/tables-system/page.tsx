'use client';

import { useState } from 'react';
import { Utensils, Calendar, Menu, Map, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TablesSystemPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'tables' | 'reservations' | 'orders'>('tables');

  const handleTabChange = (tab: 'tables' | 'reservations' | 'orders') => {
    setActiveTab(tab);
    // Navigate to the actual page
    if (tab === 'tables') {
      router.push('/dashboard/tables/map');
    } else if (tab === 'reservations') {
      router.push('/dashboard/reservations');
    } else if (tab === 'orders') {
      router.push('/dashboard/orders');
    }
  };

  return (
    <div className="min-h-screen bg-[#212226]">
      {/* Header */}
      <div className="bg-[#9B4E3F] border-b-2 border-[#FFE176] shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-[#7A3E32] rounded-md transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </Link>
              <div className="flex items-center space-x-2">
                <Utensils className="w-8 h-8 text-[#FFE176]" />
                <span className="text-xl font-bold text-white">Tables System</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#2A2B2F] border-b border-[#9B4E3F]">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <Link
              href="/dashboard/tables/map"
              className={`px-6 py-4 flex items-center space-x-2 font-medium transition-colors ${
                activeTab === 'tables'
                  ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] bg-[#2a2a2a]'
                  : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
              }`}
            >
              <Map className="w-5 h-5" />
              <span>Table Map</span>
            </Link>
            <Link
              href="/dashboard/reservations"
              className={`px-6 py-4 flex items-center space-x-2 font-medium transition-colors ${
                activeTab === 'reservations'
                  ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] bg-[#2a2a2a]'
                  : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Reservations</span>
            </Link>
            <Link
              href="/dashboard/orders"
              className={`px-6 py-4 flex items-center space-x-2 font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] bg-[#2a2a2a]'
                  : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
              }`}
            >
              <Menu className="w-5 h-5" />
              <span>Orders</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/tables/map"
            className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-8 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-white/10 rounded-full backdrop-blur-sm">
                <Map className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Table Map</h2>
              <p className="text-gray-200 text-sm">
                View and manage table layout
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/reservations"
            className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-8 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-white/10 rounded-full backdrop-blur-sm">
                <Calendar className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Reservations</h2>
              <p className="text-gray-200 text-sm">
                Manage table reservations
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/orders"
            className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-8 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-white/10 rounded-full backdrop-blur-sm">
                <Menu className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Orders</h2>
              <p className="text-gray-200 text-sm">
                Take and manage orders
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
