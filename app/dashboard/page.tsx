'use client';

import { useState } from 'react';
import { Utensils, ChefHat, Monitor, Bell, Settings, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const categories = [
    {
      id: 'tables',
      title: 'Tables System',
      description: 'Manage tables, reservations, and take orders',
      icon: Utensils,
      href: '/dashboard/tables-system',
      color: 'from-[#9B4E3F] to-[#7A3E32]',
      hoverColor: 'hover:from-[#B85E4F] hover:to-[#9B4E3F]',
    },
    {
      id: 'kitchen',
      title: 'Kitchen Panel',
      description: 'View and manage kitchen orders',
      icon: ChefHat,
      href: '/dashboard/kitchen',
      color: 'from-[#1B4527] to-[#15341F]',
      hoverColor: 'hover:from-[#215632] hover:to-[#1B4527]',
    },
    {
      id: 'kiosk',
      title: 'Kiosk Mode',
      description: 'Customer self-service ordering',
      icon: Monitor,
      href: '/dashboard/kiosk',
      color: 'from-[#1B4527] to-[#15341F]',
      hoverColor: 'hover:from-[#215632] hover:to-[#1B4527]',
    },
    {
      id: 'buzzer',
      title: 'Buzzer Display',
      description: 'Big screen display for service requests',
      icon: Bell,
      href: '/dashboard/buzzer-display',
      color: 'from-[#9B4E3F] to-[#7A3E32]',
      hoverColor: 'hover:from-[#B85E4F] hover:to-[#9B4E3F]',
    },
    {
      id: 'admin',
      title: 'Admin Dashboard',
      description: 'Menu, analytics, staff, and settings',
      icon: Settings,
      href: '/dashboard/admin',
      color: 'from-[#2A2B2F] to-[#212226]',
      hoverColor: 'hover:from-[#3A3B3F] hover:to-[#2A2B2F]',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#212226] via-[#2A2B2F] to-[#212226]">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#FFE176] mb-4">
            Fumari Restaurant Management
          </h1>
          <p className="text-xl text-[#E5E5E5]">
            Select a system to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                href={category.href}
                className={`group relative bg-gradient-to-br ${category.color} ${category.hoverColor} rounded-xl p-8 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl border-2 border-transparent hover:border-[#FFE176]`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-4 bg-white/10 rounded-full backdrop-blur-sm">
                    <Icon className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {category.title}
                  </h2>
                  <p className="text-[#E5E5E5] text-sm mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Open</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/accounting/login"
            className="inline-flex items-center px-6 py-3 bg-[#9B4E3F] hover:bg-[#7A3E32] text-white font-semibold rounded-lg transition-colors border-2 border-[#FFE176]"
          >
            <Settings className="w-5 h-5 mr-2" />
            Accounting System (Separate Login)
          </Link>
        </div>
      </div>
    </div>
  );
}

