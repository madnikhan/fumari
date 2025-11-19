'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { LayoutDashboard, Utensils, Calendar, BarChart3, Menu, Users, Monitor } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in, if not redirect to login
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (!data.authenticated) {
        router.push('/login');
      } else {
        // If logged in, redirect to dashboard
        router.push('/dashboard/tables');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-[#D4AF37] text-xl">Redirecting...</div>
    </div>
  );
}

function DashboardCard({ href, icon, title, description }: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-[#800020] rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-[#D4AF37] hover:border-[#D4AF37]">
        <div className="text-[#D4AF37] mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </Link>
  );
}
