'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Home, Utensils, Calendar, Menu, BarChart3, Users, ChefHat, Monitor, X, Menu as MenuIcon, LogOut, User as UserIcon } from "lucide-react";
import { showToast } from '@/components/Toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (data.authenticated) {
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        showToast('Logged out successfully', 'success');
        router.push('/login');
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#D4AF37] text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="bg-[#800020] border-b-2 border-[#D4AF37] shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard/tables" className="flex items-center space-x-2">
              <ChefHat className="w-8 h-8 text-[#D4AF37]" />
              <span className="text-xl font-bold text-white">Fumari</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <NavLink href="/dashboard/tables" icon={<Utensils className="w-4 h-4" />}>
                Tables
              </NavLink>
              <NavLink href="/dashboard/reservations" icon={<Calendar className="w-4 h-4" />}>
                Reservations
              </NavLink>
              <NavLink href="/dashboard/orders" icon={<Menu className="w-4 h-4" />}>
                Orders
              </NavLink>
              <NavLink href="/dashboard/menu" icon={<Menu className="w-4 h-4" />}>
                Menu
              </NavLink>
              <NavLink href="/dashboard/kitchen" icon={<ChefHat className="w-4 h-4" />}>
                Kitchen
              </NavLink>
              <NavLink href="/dashboard/analytics" icon={<BarChart3 className="w-4 h-4" />}>
                Analytics
              </NavLink>
              <NavLink href="/dashboard/staff" icon={<Users className="w-4 h-4" />}>
                Staff
              </NavLink>
              <NavLink href="/dashboard/kiosk" icon={<Monitor className="w-4 h-4" />}>
                Kiosk
              </NavLink>
              
              {/* User Info & Logout */}
              <div className="ml-4 pl-4 border-l border-[#600018] flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm">
                  <UserIcon className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-white">{user.username}</span>
                  <span className="text-gray-300">({user.role})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-[#600018] hover:text-[#D4AF37] transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden xl:inline">Logout</span>
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              {user && (
                <div className="flex items-center space-x-1 text-xs text-gray-300 mr-2">
                  <UserIcon className="w-4 h-4" />
                  <span>{user.username}</span>
                </div>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white hover:bg-[#600018] rounded-md transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <MenuIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 border-t border-[#600018] mt-2 pt-4">
              <div className="flex flex-col space-y-1">
                <MobileNavLink href="/dashboard/tables" icon={<Utensils className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)}>
                  Tables
                </MobileNavLink>
                <MobileNavLink href="/dashboard/reservations" icon={<Calendar className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)}>
                  Reservations
                </MobileNavLink>
                <MobileNavLink href="/dashboard/orders" icon={<Menu className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)}>
                  Orders
                </MobileNavLink>
                <MobileNavLink href="/dashboard/menu" icon={<Menu className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)}>
                  Menu
                </MobileNavLink>
                <MobileNavLink href="/dashboard/kitchen" icon={<ChefHat className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)}>
                  Kitchen
                </MobileNavLink>
                <MobileNavLink href="/dashboard/analytics" icon={<BarChart3 className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)}>
                  Analytics
                </MobileNavLink>
                <MobileNavLink href="/dashboard/staff" icon={<Users className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)}>
                  Staff
                </MobileNavLink>
                <MobileNavLink href="/dashboard/kiosk" icon={<Monitor className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)}>
                  Kiosk Mode
                </MobileNavLink>
                
                {/* Mobile Logout */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium text-white hover:bg-[#600018] hover:text-[#D4AF37] transition-colors border-t border-[#600018] mt-2 pt-3"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, icon, children }: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-[#600018] hover:text-[#D4AF37] transition-colors"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

function MobileNavLink({ href, icon, children, onClick }: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium text-white hover:bg-[#600018] hover:text-[#D4AF37] transition-colors"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

