'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, UtensilsCrossed, Wind, Receipt, Wrench, X, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { playBuzzerSound } from '@/lib/buzzer-sound';
import Link from 'next/link';

interface BuzzerRequest {
  id: string;
  tableId: string;
  requestType: string;
  status: string;
  createdAt: string;
  table: {
    number: number;
    status: string;
  };
}

const requestTypeConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  waiter: {
    label: 'Call Waiter',
    icon: Bell,
    color: 'text-red-500',
    bgColor: 'bg-red-500',
  },
  food: {
    label: 'Order Food',
    icon: UtensilsCrossed,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
  },
  shisha: {
    label: 'Order Shisha',
    icon: Wind,
    color: 'text-green-500',
    bgColor: 'bg-green-500',
  },
  bill: {
    label: 'Request Bill',
    icon: Receipt,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
  },
  service: {
    label: 'Table Service',
    icon: Wrench,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
  },
};

export default function BuzzerDisplayPage() {
  const [requests, setRequests] = useState<BuzzerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousRequestIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetchRequests();
    // Refresh every 2 seconds
    const interval = setInterval(fetchRequests, 2000);
    return () => clearInterval(interval);
  }, []);

  // Initialize audio context on user interaction (required by browsers)
  useEffect(() => {
    const handleUserInteraction = () => {
      // Create a dummy audio context to unlock audio
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContext.close();
      } catch (e) {
        // Ignore errors
      }
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/buzzer/requests?status=pending');
      if (response.ok) {
        const data = await response.json();
        
        // Check for new requests
        const currentRequestIds = new Set(data.map((r: BuzzerRequest) => r.id));
        const newRequests = data.filter((r: BuzzerRequest) => !previousRequestIds.current.has(r.id));
        
        // Play sound if there are new requests and sound is enabled
        if (newRequests.length > 0 && soundEnabled) {
          playBuzzerSound();
        }
        
        // Update previous request IDs
        previousRequestIds.current = currentRequestIds;
        
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching buzzer requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      const response = await fetch(`/api/buzzer/requests/${id}/acknowledge`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'acknowledge' }),
      });

      if (response.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Error acknowledging request:', error);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const response = await fetch(`/api/buzzer/requests/${id}/acknowledge`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'complete' }),
      });

      if (response.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Error completing request:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/buzzer/requests/${id}/acknowledge`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#212226] flex items-center justify-center">
        <div className="text-[#FFE176] text-4xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212226] text-white pb-16">
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
                <Bell className="w-8 h-8 text-[#FFE176]" />
                <span className="text-xl font-bold text-white">Buzzer Display</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-6xl font-bold text-[#FFE176]">
                Service Requests
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    playBuzzerSound();
                  }}
                  className="p-3 bg-[#2A2B2F] hover:bg-[#3A3B3F] rounded-lg border border-[#9B4E3F] transition-colors"
                  title="Test buzzer sound"
                >
                  <Bell className="w-6 h-6 text-[#FFE176]" />
                </button>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-3 bg-[#2A2B2F] hover:bg-[#3A3B3F] rounded-lg border border-[#9B4E3F] transition-colors"
                  title={soundEnabled ? 'Disable sound' : 'Enable sound'}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-6 h-6 text-[#FFE176]" />
                  ) : (
                    <VolumeX className="w-6 h-6 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            <p className="text-2xl text-[#E5E5E5]">
              {requests.length === 0 ? 'No active requests' : `${requests.length} active request${requests.length > 1 ? 's' : ''}`}
            </p>
          </div>

        {/* Requests Grid */}
        {requests.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Bell className="w-32 h-32 text-gray-700 mx-auto mb-4" />
              <p className="text-3xl text-gray-500">All clear!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => {
              const config = requestTypeConfig[request.requestType] || requestTypeConfig.waiter;
              const Icon = config.icon;
              const timeAgo = getTimeAgo(request.createdAt);

              return (
                <div
                  key={request.id}
                  className={`${config.bgColor} rounded-2xl p-8 shadow-2xl transform transition-all duration-300 animate-pulse hover:scale-105`}
                >
                  {/* Table Number - Large */}
                  <div className="text-center mb-6">
                    <div className="text-8xl font-bold mb-2">
                      {request.table.number}
                    </div>
                    <div className="text-2xl opacity-90">{config.label}</div>
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <Icon className="w-20 h-20" />
                  </div>

                  {/* Time */}
                  <div className="text-center text-xl opacity-90 mb-6">
                    {timeAgo}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAcknowledge(request.id)}
                      className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => handleComplete(request.id)}
                      className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => handleDelete(request.id)}
                      className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          Auto-refreshing every 2 seconds
        </div>
        </div>
      </div>
    </div>
  );
}

