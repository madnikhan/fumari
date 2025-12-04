'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { showToast } from '@/components/Toast';
import FumariLogo from '@/components/FumariLogo';

function WaiterLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState<string | null>(null);

  useEffect(() => {
    // Get redirect URL from query params
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      setRedirect(redirectParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/waiter-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pin }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Login successful!', 'success');
        // Redirect to notifications page
        const redirectPath = redirect || '/dashboard/waiter/notifications';
        router.push(redirectPath);
        router.refresh();
      } else {
        showToast(data.error || 'Login failed. Please check your name and PIN.', 'error');
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
        <div className="text-center mb-8">
          <FumariLogo size="large" />
          <h1 className="text-3xl font-bold text-[#FFE176] mt-6 mb-2">
            Waiter Login
          </h1>
          <p className="text-gray-400">
            Enter your name and PIN to access notifications
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 bg-black border-2 border-[#800020] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                placeholder="Enter your name"
                autoComplete="name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-300 mb-2">
              PIN
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="pin"
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                maxLength={4}
                className="block w-full pl-10 pr-10 py-3 bg-black border-2 border-[#800020] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                placeholder="Enter 4-digit PIN"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPin ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#9B4E3F] hover:bg-[#7A3E32] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#FFE176]"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Need help? Contact your manager
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WaiterLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#212226] flex items-center justify-center">
        <div className="text-[#FFE176]">Loading...</div>
      </div>
    }>
      <WaiterLoginForm />
    </Suspense>
  );
}

