'use client';

import { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Clock, CheckCircle, X, Minus, Trash2, Search } from 'lucide-react';
import { showToast } from '@/components/Toast';

interface Order {
  id: string;
  table: {
    number: number;
  };
  status: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

interface OrderItem {
  id: string;
  menuItem: {
    name: string;
  };
  quantity: number;
  price: number;
  status: string;
}

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: string;
}

interface MenuCategory {
  id: string;
  name: string;
  nameTr?: string;
  type: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  nameTr?: string;
  description?: string;
  price: number;
  available: boolean;
}

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showPOSModal, setShowPOSModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [filter]);

  useEffect(() => {
    if (showPOSModal) {
      fetchTables();
      fetchMenu();
    }
  }, [showPOSModal]);

  const fetchOrders = async () => {
    try {
      const url = filter === 'all' ? '/api/orders' : `/api/orders?status=${filter}`;
      const response = await fetch(url);
      const data = await response.json();
      // Ensure data is an array, even if response is not OK
      // (API returns empty array on errors)
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    setLoadingTables(true);
    try {
      const response = await fetch('/api/tables');
      const data = await response.json();
      setTables(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTables([]);
    } finally {
      setLoadingTables(false);
    }
  };

  const fetchMenu = async () => {
    setLoadingMenu(true);
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      setMenuCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setMenuCategories([]);
    } finally {
      setLoadingMenu(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    if (!item.available) return;
    
    const existingItem = cart.find(c => c.menuItemId === item.id);
    if (existingItem) {
      setCart(cart.map(c => 
        c.menuItemId === item.id 
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
    } else {
      setCart([...cart, {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
      }]);
    }
  };

  const updateCartQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCart(cart.map(item => 
      item.menuItemId === menuItemId 
        ? { ...item, quantity }
        : item
    ));
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter(item => item.menuItemId !== menuItemId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.20; // 20% UK VAT
    const serviceCharge = subtotal * 0.10; // 10% service charge
    const total = subtotal + tax + serviceCharge;
    return { subtotal, tax, serviceCharge, total };
  };

  const handleCreateOrder = async () => {
    if (!selectedTable || cart.length === 0) {
      showToast('Please select a table and add items to the cart', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // Get first staff member as default (in production, use logged-in staff)
      const staffResponse = await fetch('/api/staff');
      const staffData = await staffResponse.json();
      const staffId = Array.isArray(staffData) && staffData.length > 0 ? staffData[0].id : null;

      if (!staffId) {
        showToast('No staff member found. Please add staff members first.', 'error');
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: selectedTable.id,
          staffId: staffId,
          items: cart.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions || undefined,
          })),
          notes: notes || undefined,
        }),
      });

      if (response.ok) {
        // Reset form
        setSelectedTable(null);
        setCart([]);
        setNotes('');
        setShowPOSModal(false);
        fetchOrders();
        showToast('Order created successfully!', 'success');
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error || 'Failed to create order'}`, 'error');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      showToast('Failed to create order. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMenuItems = () => {
    let items: MenuItem[] = [];
    menuCategories.forEach(category => {
      if (selectedCategory === 'all' || category.type === selectedCategory) {
        items = [...items, ...category.items];
      }
    });
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.nameTr?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }
    
    return items.filter(item => item.available);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#D4AF37] text-black';
      case 'preparing':
        return 'bg-[#4a5568] text-white';
      case 'ready':
        return 'bg-[#1a4d2e] text-white';
      case 'served':
        return 'bg-[#800020] text-white';
      case 'completed':
        return 'bg-gray-700 text-white';
      default:
        return 'bg-gray-700 text-white';
    }
  };

  // Ensure orders is always an array
  const ordersArray = Array.isArray(orders) ? orders : [];
  const stats = {
    total: ordersArray.length,
    pending: ordersArray.filter((o) => o.status === 'pending').length,
    preparing: ordersArray.filter((o) => o.status === 'preparing').length,
    ready: ordersArray.filter((o) => o.status === 'ready').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-300">Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#D4AF37] mb-2">Orders & POS</h1>
          <p className="text-sm sm:text-base text-gray-300">Manage orders and point of sale operations</p>
        </div>
        <button 
          onClick={() => setShowPOSModal(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] transition-colors font-medium text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          <span>New Order</span>
        </button>
      </div>

      {/* POS Modal */}
      {showPOSModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-[#1a1a1a] rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden border-2 border-[#D4AF37] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#800020]">
              <h2 className="text-xl sm:text-2xl font-bold text-[#D4AF37]">New Order - POS</h2>
              <button
                onClick={() => {
                  setShowPOSModal(false);
                  setSelectedTable(null);
                  setCart([]);
                  setNotes('');
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* Left Panel - Table Selection & Menu */}
              <div className="w-full lg:w-2/3 border-r-0 lg:border-r border-[#800020] border-b lg:border-b-0 overflow-y-auto p-4 sm:p-6">
                {/* Table Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Select Table</h3>
                  {loadingTables ? (
                    <div className="text-gray-400">Loading tables...</div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                      {tables.filter(t => t.status === 'occupied' || t.status === 'available').map((table) => (
                        <button
                          key={table.id}
                          onClick={() => setSelectedTable(table)}
                          className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                            selectedTable?.id === table.id
                              ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                              : 'bg-[#2a2a2a] text-white border-[#800020] hover:border-[#D4AF37]'
                          }`}
                        >
                          <div className="font-bold text-base sm:text-lg">Table {table.number}</div>
                          <div className="text-xs opacity-75">Capacity: {table.capacity}</div>
                          <div className="text-xs mt-1">{table.status}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Menu Search & Filter */}
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    >
                      <option value="all">All Categories</option>
                      <option value="food">Food</option>
                      <option value="cocktail">Cocktails</option>
                      <option value="shisha">Shisha</option>
                      <option value="drink">Drinks</option>
                    </select>
                  </div>
                </div>

                {/* Menu Items */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Menu Items</h3>
                  {loadingMenu ? (
                    <div className="text-gray-400">Loading menu...</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {filteredMenuItems().map((item) => (
                        <button
                          key={item.id}
                          onClick={() => addToCart(item)}
                          disabled={!item.available}
                          className="p-3 sm:p-4 bg-[#2a2a2a] rounded-lg border-2 border-[#800020] hover:border-[#D4AF37] transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="font-semibold text-white">{item.name}</div>
                              {item.nameTr && (
                                <div className="text-xs text-gray-400">{item.nameTr}</div>
                              )}
                            </div>
                            <div className="text-[#D4AF37] font-bold">£{item.price.toFixed(2)}</div>
                          </div>
                          {item.description && (
                            <div className="text-xs text-gray-400 mb-2">{item.description}</div>
                          )}
                          {!item.available && (
                            <div className="text-xs text-red-400">Unavailable</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Cart & Order Summary */}
              <div className="w-full lg:w-1/3 p-4 sm:p-6 overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                
                {selectedTable && (
                  <div className="mb-4 p-3 bg-[#2a2a2a] rounded-lg border border-[#800020]">
                    <div className="text-sm text-gray-300">Table</div>
                    <div className="text-white font-bold">Table {selectedTable.number}</div>
                  </div>
                )}

                {/* Cart Items */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Items ({cart.length})</h4>
                  {cart.length === 0 ? (
                    <div className="text-gray-400 text-sm">Cart is empty</div>
                  ) : (
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.menuItemId} className="p-3 bg-[#2a2a2a] rounded-lg border border-[#800020]">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="text-white font-medium text-sm">{item.name}</div>
                              <div className="text-[#D4AF37] text-sm">£{item.price.toFixed(2)} each</div>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.menuItemId)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateCartQuantity(item.menuItemId, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center bg-[#800020] rounded hover:bg-[#a00028]"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.menuItemId, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center bg-[#1a4d2e] rounded hover:bg-[#2d7a4f]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <div className="ml-auto text-[#D4AF37] font-bold">
                              £{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Totals */}
                {cart.length > 0 && (
                  <div className="mb-4 p-4 bg-[#2a2a2a] rounded-lg border border-[#800020]">
                    {(() => {
                      const { subtotal, tax, serviceCharge, total } = calculateTotals();
                      return (
                        <>
                          <div className="flex justify-between text-sm text-gray-300 mb-1">
                            <span>Subtotal</span>
                            <span>£{subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-300 mb-1">
                            <span>VAT (20%)</span>
                            <span>£{tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-300 mb-2">
                            <span>Service Charge (10%)</span>
                            <span>£{serviceCharge.toFixed(2)}</span>
                          </div>
                          <div className="border-t border-[#800020] pt-2 flex justify-between text-lg font-bold text-[#D4AF37]">
                            <span>Total</span>
                            <span>£{total.toFixed(2)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-black border-2 border-[#800020] rounded-lg text-white text-sm focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    placeholder="Special instructions..."
                  />
                </div>

                {/* Create Order Button */}
                <button
                  onClick={handleCreateOrder}
                  disabled={!selectedTable || cart.length === 0 || submitting}
                  className="w-full px-4 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-colors"
                >
                  {submitting ? 'Creating Order...' : `Create Order${cart.length > 0 ? ` - £${calculateTotals().total.toFixed(2)}` : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard label="Total Orders" value={stats.total} color="bg-[#4a5568]" />
        <StatCard label="Pending" value={stats.pending} color="bg-[#D4AF37]" />
        <StatCard label="Preparing" value={stats.preparing} color="bg-[#4a5568]" />
        <StatCard label="Ready" value={stats.ready} color="bg-[#1a4d2e]" />
      </div>

      {/* Filters */}
      <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
        {['all', 'pending', 'preparing', 'ready', 'served', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
              filter === status
                ? 'bg-[#D4AF37] text-black'
                : 'bg-[#1a1a1a] text-gray-300 border-2 border-[#800020] hover:bg-[#2a2a2a]'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {ordersArray.map((order) => (
          <div
            key={order.id}
            className="bg-[#1a1a1a] rounded-lg shadow-md p-6 border-2 border-[#800020] hover:border-[#D4AF37] hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Table {order.table.number}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toISOString().split('T')[1].slice(0, 5)}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300">
                      {item.quantity}x {item.menuItem.name}
                    </span>
                    {item.status === 'ready' && (
                      <CheckCircle className="w-4 h-4 text-[#1a4d2e]" />
                    )}
                  </div>
                  <span className="font-medium text-[#D4AF37]">
                    £{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#800020] flex items-center justify-between">
              <span className="text-lg font-bold text-[#D4AF37]">
                Total: £{order.total.toFixed(2)}
              </span>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-[#4a5568] text-white rounded hover:bg-[#6b7280] text-sm font-medium">
                  View
                </button>
                <button className="px-3 py-1 bg-[#D4AF37] text-black rounded hover:bg-[#f4c430] text-sm font-medium">
                  Update
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ordersArray.length === 0 && (
        <div className="text-center py-12 text-gray-300">
          No orders found
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-[#1a1a1a] rounded-lg shadow p-4 border-2 border-[#800020]">
      <div className="text-sm text-gray-300 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color} text-white px-3 py-1 rounded inline-block`}>
        {value}
      </div>
    </div>
  );
}

