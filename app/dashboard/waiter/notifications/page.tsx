'use client';

import { useState, useEffect } from 'react';
import { Bell, UtensilsCrossed, Wind, Receipt, Wrench, Check, X } from 'lucide-react';
import { showToast } from '@/components/Toast';

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

export default function WaiterNotificationsPage() {
  const [notifications, setNotifications] = useState<BuzzerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Refresh every 3 seconds
    const interval = setInterval(fetchNotifications, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/buzzer/waiter/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (requestId: string) => {
    try {
      const response = await fetch(`/api/buzzer/requests/${requestId}/acknowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'acknowledge' }),
      });

      if (response.ok) {
        showToast('Request acknowledged', 'success');
        fetchNotifications();
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error || 'Failed to acknowledge'}`, 'error');
      }
    } catch (error) {
      console.error('Error acknowledging request:', error);
      showToast('Failed to acknowledge request', 'error');
    }
  };

  const handleComplete = async (requestId: string) => {
    try {
      const response = await fetch(`/api/buzzer/requests/${requestId}/acknowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      });

      if (response.ok) {
        showToast('Request completed', 'success');
        fetchNotifications();
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error || 'Failed to complete'}`, 'error');
      }
    } catch (error) {
      console.error('Error completing request:', error);
      showToast('Failed to complete request', 'error');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#212226] flex items-center justify-center">
        <div className="text-[#FFE176] text-xl">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212226] text-white pb-20">
      {/* Header */}
      <div className="bg-[#9B4E3F] border-b-2 border-[#FFE176] shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Bell className="w-7 h-7 text-[#FFE176]" />
              <h1 className="text-xl font-bold text-white">My Notifications</h1>
            </div>
            <div className="text-sm text-white/80">
              {notifications.length} {notifications.length === 1 ? 'request' : 'requests'}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No notifications</p>
            <p className="text-gray-500 text-sm mt-2">You'll receive notifications when customers request service</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((request) => {
              const config = requestTypeConfig[request.requestType] || requestTypeConfig.waiter;
              const Icon = config.icon;

              return (
                <div
                  key={request.id}
                  className="bg-[#2A2B2F] rounded-lg border-2 border-[#9B4E3F] p-4 shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-3 rounded-lg ${config.bgColor} bg-opacity-20`}>
                        <Icon className={`w-6 h-6 ${config.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-2xl font-bold text-[#FFE176]">
                            Table {request.table.number}
                          </span>
                          <span className="text-sm text-gray-400">
                            {getTimeAgo(request.createdAt)}
                          </span>
                        </div>
                        <p className="text-white font-medium">{config.label}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Status: <span className="text-yellow-400">Pending</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleAcknowledge(request.id)}
                        className="px-4 py-2 bg-[#1B4527] hover:bg-[#215632] text-white rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>Acknowledge</span>
                      </button>
                      <button
                        onClick={() => handleComplete(request.id)}
                        className="px-4 py-2 bg-[#9B4E3F] hover:bg-[#7A3E32] text-white rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Complete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

