'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { showToast } from '@/components/Toast';
import FumariLogo from '@/components/FumariLogo';

export default function AccountingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/accounting/auth/session', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.authenticated) {
        setAuthenticated(true);
      } else {
        router.push('/accounting/login');
      }
    } catch (error) {
      router.push('/accounting/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/accounting/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        showToast('Logged out successfully', 'success');
        router.push('/accounting/login');
        router.refresh();
      } else {
        showToast('Failed to logout', 'error');
      }
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Failed to logout', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#212226] flex items-center justify-center">
        <div className="text-[#FFE176] text-xl">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-[#212226]">
      {/* Accounting Header */}
      <nav className="bg-[#9B4E3F] border-b-2 border-[#FFE176] shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <FumariLogo size="small" />
              <span className="text-xl font-bold text-white">Accounting System</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-[#7A3E32] hover:bg-[#9B4E3F] text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-16">
        {children}
      </main>
    </div>
  );
}

