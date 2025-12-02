'use client';

import { ChefHat } from 'lucide-react';
import FumariLogo from '@/components/FumariLogo';

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#212226]">
      {/* Kitchen Header */}
      <nav className="bg-[#9B4E3F] border-b-2 border-[#FFE176] shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <FumariLogo size="small" />
              <ChefHat className="w-6 h-6 text-[#FFE176]" />
              <span className="text-xl font-bold text-white">Kitchen Panel</span>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-16">
        {children}
      </main>
    </div>
  );
}

