'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { showToast } from '@/components/Toast';
import FumariLogo from '@/components/FumariLogo';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState<string | null>(null);

  useEffect(() => {
    // Check if already logged in
    checkSession();
    
    // Get redirect URL from query params
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      setRedirect(redirectParam);
    }

    // Show expired message if session expired
    if (searchParams.get('expired') === 'true') {
      showToast('Your session has expired. Please login again.', 'warning');
    }
  }, [searchParams]);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (data.authenticated) {
        // Already logged in, redirect to dashboard
        const redirectParam = searchParams.get('redirect') || '/dashboard/tables';
        router.push(redirectParam);
      }
    } catch (error) {
      // Not logged in, continue to login form
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Login successful!', 'success');
        // Redirect to dashboard or the original page
        const redirectPath = redirect || '/dashboard/tables';
        router.push(redirectPath);
        router.refresh();
      } else {
        showToast(data.error || 'Login failed. Please check your credentials.', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Failed to login. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#212226] flex items-center justify-center p-4 pb-20">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FumariLogo size="large" />
          </div>
          <h1 className="text-4xl font-bold text-[#FFE176] mb-2">Fumari Restaurant</h1>
          <p className="text-[#E5E5E5]">Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#2A2B2F] rounded-lg shadow-2xl p-8 border-2 border-[#9B4E3F]">
          <h2 className="text-2xl font-bold text-[#FFE176] mb-6 text-center">Login</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#E5E5E5] mb-2">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#E5E5E5]" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#212226] border-2 border-[#9B4E3F] rounded-lg text-white focus:ring-2 focus:ring-[#FFE176] focus:border-[#FFE176] transition-colors"
                  placeholder="Enter your username or email"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#E5E5E5] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#E5E5E5]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-[#212226] border-2 border-[#9B4E3F] rounded-lg text-white focus:ring-2 focus:ring-[#FFE176] focus:border-[#FFE176] transition-colors"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E5E5E5] hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-[#FFE176] text-[#212226] rounded-lg hover:bg-[#E6C966] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#E5E5E5]">
              Birmingham, UK • Turkish Cuisine & Shisha Bar
            </p>
          </div>
        </div>

        {/* Default Credentials Info (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 bg-[#2A2B2F] rounded-lg p-4 border-2 border-[#9B4E3F]">
            <p className="text-xs text-[#E5E5E5] text-center">
              Default credentials: <span className="text-[#FFE176]">admin / admin123</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

