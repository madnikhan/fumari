'use client';

import { useState } from 'react';
import { Menu, BarChart3, Users, Settings, ArrowLeft, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const adminFeatures = [
    {
      id: 'menu',
      title: 'Menu Management',
      description: 'Manage menu items and categories',
      icon: Menu,
      href: '/dashboard/menu',
      color: 'from-blue-600 to-blue-800',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View sales and performance reports',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'from-green-600 to-green-800',
    },
    {
      id: 'staff',
      title: 'Staff Management',
      description: 'Manage staff members and assignments',
      icon: Users,
      href: '/dashboard/staff',
      color: 'from-purple-600 to-purple-800',
    },
    {
      id: 'qr-codes',
      title: 'QR Codes',
      description: 'Generate QR codes for tables',
      icon: QrCode,
      href: '/dashboard/buzzer/qr-codes',
      color: 'from-orange-600 to-orange-800',
    },
  ];

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
                <Settings className="w-8 h-8 text-[#FFE176]" />
                <span className="text-xl font-bold text-white">Admin Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#FFE176] mb-2">
            Admin Dashboard
          </h1>
          <p className="text-[#E5E5E5]">
            Manage restaurant settings and operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {adminFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.id}
                href={feature.href}
                className={`bg-gradient-to-br ${feature.color} rounded-xl p-6 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-3 bg-white/10 rounded-full">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    {feature.title}
                  </h2>
                  <p className="text-gray-200 text-sm">
                    {feature.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

