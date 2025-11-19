'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChefHat, Lock, User, Eye, EyeOff } from 'lucide-react';
import { showToast } from '@/components/Toast';

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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-[#800020] p-4 rounded-full border-4 border-[#D4AF37]">
              <ChefHat className="w-12 h-12 text-[#D4AF37]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Fumari Restaurant</h1>
          <p className="text-gray-300">Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#1a1a1a] rounded-lg shadow-2xl p-8 border-2 border-[#800020]">
          <h2 className="text-2xl font-bold text-[#D4AF37] mb-6 text-center">Login</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                  placeholder="Enter your username or email"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
              className="w-full px-4 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Birmingham, UK • Turkish Cuisine & Shisha Bar
            </p>
          </div>
        </div>

        {/* Default Credentials Info (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 bg-[#1a1a1a] rounded-lg p-4 border-2 border-[#800020]">
            <p className="text-xs text-gray-400 text-center">
              Default credentials: <span className="text-[#D4AF37]">admin / admin123</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

