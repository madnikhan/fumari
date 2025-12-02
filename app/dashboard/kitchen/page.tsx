'use client';

import { useState, useEffect } from 'react';
import { Clock, Utensils, Wine, CheckCircle } from 'lucide-react';

interface OrderItem {
  id: string;
  order: {
    id: string;
    table: {
      number: number;
    };
    createdAt: string;
  };
  menuItem: {
    name: string;
    nameTr?: string;
    category: {
      type: string;
    };
  };
  quantity: number;
  status: string;
  specialInstructions?: string;
  createdAt: string;
}

export default function KitchenPage() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrderItems();
    const interval = setInterval(fetchOrderItems, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [filter]);

  const fetchOrderItems = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/kitchen/orders' 
        : `/api/kitchen/orders?status=${filter}`;
      const response = await fetch(url);
      const data = await response.json();
      // Ensure data is always an array, regardless of response status
      // (API returns empty array on errors with 200 status)
      if (Array.isArray(data)) {
        setOrderItems(data);
      } else {
        console.warn('API returned non-array data:', data);
        setOrderItems([]);
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
      setOrderItems([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const updateItemStatus = async (itemId: string, status: string) => {
    try {
      await fetch(`/api/kitchen/orders/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchOrderItems();
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };

  const getItemType = (type: string) => {
    switch (type) {
      case 'food':
        return { icon: <Utensils className="w-5 h-5" />, color: 'bg-orange-500' };
      case 'cocktail':
      case 'drink':
        return { icon: <Wine className="w-5 h-5" />, color: 'bg-purple-500' };
      case 'shisha':
        return { icon: <Utensils className="w-5 h-5" />, color: 'bg-blue-500' };
      default:
        return { icon: <Utensils className="w-5 h-5" />, color: 'bg-gray-500' };
    }
  };

  // Ensure orderItems is always an array with defensive checks
  // This must be done before any array operations
  if (!Array.isArray(orderItems)) {
    console.warn('orderItems is not an array:', orderItems);
  }
  const orderItemsArray: OrderItem[] = Array.isArray(orderItems) ? orderItems : [];
  
  // Safely group by table, ensuring all items have required properties
  const groupedByTable = orderItemsArray.reduce((acc, item) => {
    // Defensive check: ensure item and nested properties exist
    if (!item || !item.order || !item.order.table || typeof item.order.table.number === 'undefined') {
      console.warn('Invalid order item structure:', item);
      return acc;
    }
    
    const tableNum = item.order.table.number;
    if (!acc[tableNum]) {
      acc[tableNum] = [];
    }
    acc[tableNum].push(item);
    return acc;
  }, {} as Record<number, OrderItem[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#E5E5E5]">Loading kitchen orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212226]">

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 flex space-x-2">
          {['all', 'pending', 'preparing', 'ready'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-[#FFE176] text-[#212226]'
                  : 'bg-[#2A2B2F] text-[#E5E5E5] hover:bg-[#3A3B3F]'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders by Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(groupedByTable).map(([tableNum, items]) => (
            <div
              key={tableNum}
              className="bg-[#2A2B2F] rounded-lg shadow-lg p-4 sm:p-6 border-2 border-[#9B4E3F]"
            >
              <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-[#800020]">
                <h2 className="text-xl sm:text-2xl font-bold text-[#FFE176]">Table {tableNum}</h2>
                <div className="text-xs sm:text-sm text-[#E5E5E5]">
                  {new Date(items[0].order.createdAt).toISOString().split('T')[1].slice(0, 5)}
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {items.map((item) => {
                  const itemType = getItemType(item.menuItem.category.type);
                  return (
                    <div
                      key={item.id}
                      className={`p-3 sm:p-4 rounded-lg border-2 ${
                        item.status === 'ready'
                          ? 'border-[#1B4527] bg-[#1B4527] bg-opacity-20'
                          : item.status === 'preparing'
                          ? 'border-[#FFE176] bg-[#FFE176] bg-opacity-20'
                          : 'border-[#9B4E3F] bg-[#2A2B2F]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className={`${itemType.color} text-white p-1.5 rounded shrink-0`}>
                            {itemType.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-sm sm:text-base">
                              {item.quantity}x {item.menuItem.name}
                            </div>
                            {item.menuItem.nameTr && (
                              <div className="text-xs sm:text-sm text-[#E5E5E5]">
                                {item.menuItem.nameTr}
                              </div>
                            )}
                          </div>
                        </div>
                        {item.status === 'ready' && (
                          <CheckCircle className="w-5 h-5 text-[#1B4527] shrink-0 ml-2" />
                        )}
                      </div>

                      {item.specialInstructions && (
                        <div className="text-xs sm:text-sm text-[#FFE176] bg-[#FFE176] bg-opacity-20 p-2 rounded mt-2">
                          <strong>Note:</strong> {item.specialInstructions}
                        </div>
                      )}

                      <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        {item.status === 'pending' && (
                          <button
                            onClick={() => updateItemStatus(item.id, 'preparing')}
                            className="flex-1 px-3 py-2 bg-[#FFE176] text-[#212226] rounded hover:bg-[#E6C966] text-xs sm:text-sm font-medium"
                          >
                            Start Preparing
                          </button>
                        )}
                        {item.status === 'preparing' && (
                          <button
                            onClick={() => updateItemStatus(item.id, 'ready')}
                            className="flex-1 px-3 py-2 bg-[#1B4527] text-white rounded hover:bg-[#215632] text-xs sm:text-sm font-medium"
                          >
                            Mark Ready
                          </button>
                        )}
                        {item.status === 'ready' && (
                          <button
                            onClick={() => updateItemStatus(item.id, 'served')}
                            className="flex-1 px-3 py-2 bg-[#9B4E3F] text-white rounded hover:bg-[#7A3E32] text-xs sm:text-sm font-medium"
                          >
                            Mark Served
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {orderItemsArray.length === 0 && (
          <div className="text-center py-12 text-[#E5E5E5]">
            No orders in queue
          </div>
        )}
      </div>
    </div>
  );
}
