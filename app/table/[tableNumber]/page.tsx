'use client';

import { useState, useEffect, use } from 'react';
import { Bell, UtensilsCrossed, Wind, Receipt, Wrench, CheckCircle2 } from 'lucide-react';

interface TableInfo {
  id: string;
  number: number;
  capacity: number;
  status: string;
  section: string;
}

const requestTypes = [
  {
    id: 'waiter',
    label: 'Call Waiter',
    icon: Bell,
    color: 'bg-red-500 hover:bg-red-600',
    description: 'Need assistance from staff',
  },
  {
    id: 'food',
    label: 'Order Food',
    icon: UtensilsCrossed,
    color: 'bg-blue-500 hover:bg-blue-600',
    description: 'Ready to order food',
  },
  {
    id: 'shisha',
    label: 'Order Shisha',
    icon: Wind,
    color: 'bg-green-500 hover:bg-green-600',
    description: 'Ready to order shisha',
  },
  {
    id: 'bill',
    label: 'Request Bill',
    icon: Receipt,
    color: 'bg-yellow-500 hover:bg-yellow-600',
    description: 'Ready to pay',
  },
  {
    id: 'service',
    label: 'Table Service',
    icon: Wrench,
    color: 'bg-orange-500 hover:bg-orange-600',
    description: 'Need table service',
  },
];

interface BuzzerRequestStatus {
  id: string;
  requestType: string;
  status: string;
  acknowledgedAt?: string;
  completedAt?: string;
}

export default function TablePage({ params }: { params: Promise<{ tableNumber: string }> }) {
  const resolvedParams = use(params);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRequestId, setLastRequestId] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<BuzzerRequestStatus | null>(null);

  useEffect(() => {
    fetchTableInfo();
  }, [resolvedParams.tableNumber]);

  // Poll for request status updates if there's an active request
  useEffect(() => {
    if (!lastRequestId || !tableInfo) return;

    let pollCount = 0;
    const maxPolls = 300; // Poll for up to 10 minutes (300 * 2 seconds)

    const checkRequestStatus = async () => {
      try {
        // Check for any requests for this table (all statuses)
        const response = await fetch(`/api/buzzer/requests?tableId=${tableInfo.id}`);
        if (response.ok) {
          const requests = await response.json();
          
          const currentRequest = requests.find((r: BuzzerRequestStatus) => r.id === lastRequestId);
          
          if (currentRequest) {
            // Update status if it changed
            setRequestStatus(prev => {
              if (!prev || prev.status !== currentRequest.status) {
                return currentRequest;
              }
              return prev;
            });
            
            // Stop polling if request is completed
            if (currentRequest.status === 'completed') {
              setTimeout(() => {
                setLastRequestId(null);
                setRequestStatus(null);
                setSuccess(null);
              }, 5000);
              return; // Exit early to stop polling
            }
          }
          
          pollCount++;
          if (pollCount >= maxPolls) {
            // Stop polling after max attempts
            setLastRequestId(null);
            setRequestStatus(null);
            setSuccess(null);
          }
        }
      } catch (err) {
        console.error('Error checking request status:', err);
      }
    };

    // Check immediately, then every 2 seconds
    checkRequestStatus();
    const interval = setInterval(checkRequestStatus, 2000);

    return () => clearInterval(interval);
  }, [lastRequestId, tableInfo]);

  const fetchTableInfo = async () => {
    try {
      const response = await fetch(`/api/buzzer/table/${resolvedParams.tableNumber}`);
      if (response.ok) {
        const data = await response.json();
        setTableInfo(data);
      } else {
        setError('Table not found');
      }
    } catch (err) {
      setError('Failed to load table information');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestType: string) => {
    if (!tableInfo) return;

    setRequesting(requestType);
    setSuccess(null);
    setError(null);

    try {
      const response = await fetch('/api/buzzer/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId: tableInfo.id,
          requestType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(requestType);
        setLastRequestId(data.id);
        setRequestStatus({
          id: data.id,
          requestType: data.requestType,
          status: data.status,
        });
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send request');
      }
    } catch (err) {
      setError('Failed to send request. Please try again.');
    } finally {
      setRequesting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2d1b1b] to-[#1a1a1a] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error && !tableInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2d1b1b] to-[#1a1a1a] flex items-center justify-center">
        <div className="text-white text-xl text-center px-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2d1b1b] to-[#1a1a1a] text-white pb-16">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">
            Table {tableInfo?.number}
          </h1>
          <p className="text-gray-300 text-sm">{tableInfo?.section}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Request Status Updates */}
        {requestStatus ? (
          <div className="mb-4 p-4 rounded-lg flex items-center justify-center gap-2">
            {requestStatus.status === 'pending' && (
              <div className="bg-yellow-900/50 border border-yellow-500 w-full p-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-pulse w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Request sent! Waiting for staff to acknowledge...</span>
                </div>
              </div>
            )}
            {requestStatus.status === 'acknowledged' && (
              <div className="bg-blue-900/50 border border-blue-500 w-full p-4">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  <span className="font-bold">Staff has acknowledged your request! They're on their way.</span>
                </div>
              </div>
            )}
            {requestStatus.status === 'completed' && (
              <div className="bg-green-900/50 border border-green-500 w-full p-4">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="font-bold">Request completed! Thank you.</span>
                </div>
              </div>
            )}
          </div>
        ) : success && (
          <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Request sent successfully! Waiting for staff...</span>
          </div>
        )}

        {/* Service Buttons */}
        <div className="space-y-4">
          {requestTypes.map((type) => {
            const Icon = type.icon;
            const isRequesting = requesting === type.id;
            const isSuccess = success === type.id;

            return (
              <button
                key={type.id}
                onClick={() => handleRequest(type.id)}
                disabled={isRequesting || !!success}
                className={`w-full ${type.color} text-white font-bold py-6 px-6 rounded-xl shadow-lg transform transition-all duration-200 flex items-center justify-center gap-4 ${
                  isRequesting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                } ${isSuccess ? 'ring-4 ring-green-400' : ''}`}
              >
                <Icon className="w-8 h-8" />
                <div className="text-left flex-1">
                  <div className="text-xl">{type.label}</div>
                  <div className="text-sm opacity-90">{type.description}</div>
                </div>
                {isRequesting && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Fumari Restaurant</p>
          <p className="mt-1">Tap a button above to request service</p>
        </div>
      </div>
    </div>
  );
}

