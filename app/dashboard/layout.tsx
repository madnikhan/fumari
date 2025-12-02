'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Home, Utensils, Calendar, Menu, BarChart3, Users, Monitor, X, Menu as MenuIcon, LogOut, User as UserIcon, Bell, Receipt, Building2, Maximize, Minimize } from "lucide-react";
import FumariLogo from '@/components/FumariLogo';
import { showToast } from '@/components/Toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkSession();
    checkFullscreen();
    
    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);
  
  const checkFullscreen = () => {
    setIsFullscreen(
      !!document.fullscreenElement ||
      !!(document as any).webkitFullscreenElement ||
      !!(document as any).mozFullScreenElement ||
      !!(document as any).msFullscreenElement
    );
  };
  
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        // Enter fullscreen
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        } else if ((document.documentElement as any).mozRequestFullScreen) {
          await (document.documentElement as any).mozRequestFullScreen();
        } else if ((document.documentElement as any).msRequestFullscreen) {
          await (document.documentElement as any).msRequestFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
      showToast('Failed to toggle fullscreen', 'error');
    }
  };

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
      <div className="min-h-screen bg-[#212226] flex items-center justify-center">
        <div className="text-[#FFE176] text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-[#212226]">
      <nav className="bg-[#9B4E3F] border-b-2 border-[#FFE176] shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <FumariLogo size="small" />
              <span className="text-xl font-bold text-white">Fumari</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <NavLink href="/dashboard" icon={<Home className="w-4 h-4" />}>
                Dashboard
              </NavLink>
              
              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-[#7A3E32] hover:text-[#FFE176] transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
                <span className="hidden xl:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
              </button>
              
              {/* User Info & Logout */}
              <div className="ml-4 pl-4 border-l border-[#7A3E32] flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm">
                  <UserIcon className="w-4 h-4 text-[#FFE176]" />
                  <span className="text-white">{user.username}</span>
                  <span className="text-[#E5E5E5]">({user.role})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-[#7A3E32] hover:text-[#FFE176] transition-colors"
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
                <div className="flex items-center space-x-1 text-xs text-[#E5E5E5] mr-2">
                  <UserIcon className="w-4 h-4" />
                  <span>{user.username}</span>
                </div>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white hover:bg-[#7A3E32] rounded-md transition-colors"
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
            <div className="lg:hidden pb-4 border-t border-[#7A3E32] mt-2 pt-4">
              <div className="flex flex-col space-y-1">
                <MobileNavLink href="/dashboard" icon={<Home className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </MobileNavLink>
                
                {/* Mobile Fullscreen Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    toggleFullscreen();
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium text-white hover:bg-[#7A3E32] hover:text-[#FFE176] transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                  <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                </button>
                
                {/* Mobile Logout */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium text-white hover:bg-[#7A3E32] hover:text-[#FFE176] transition-colors border-t border-[#7A3E32] mt-2 pt-3"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-16">
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
      className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-[#7A3E32] hover:text-[#FFE176] transition-colors"
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
      className="flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium text-white hover:bg-[#7A3E32] hover:text-[#FFE176] transition-colors"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

