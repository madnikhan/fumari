'use client';

import { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Utensils, Wine, Coffee, ShoppingCart, Plus, Minus, X, CheckCircle, Trash2 } from 'lucide-react';
import { showToast } from '@/components/Toast';

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
  preparationTime?: number;
}

interface CartItem {
  menuItemId: string;
  name: string;
  nameTr?: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: string;
}

export default function KioskPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showTableSelection, setShowTableSelection] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    fetchMenu();
    fetchTables();
    checkFullscreen();
    
    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);
    document.addEventListener('mozfullscreenchange', checkFullscreen);
    document.addEventListener('MSFullscreenChange', checkFullscreen);

    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('webkitfullscreenchange', checkFullscreen);
      document.removeEventListener('mozfullscreenchange', checkFullscreen);
      document.removeEventListener('MSFullscreenChange', checkFullscreen);
    };
  }, []);

  const checkFullscreen = () => {
    const isFull = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
    setIsFullscreen(isFull);
  };

  const fetchMenu = async () => {
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables');
      if (response.ok) {
        const data = await response.json();
        setTables(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        const element = document.documentElement;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen();
        } else if ((element as any).mozRequestFullScreen) {
          await (element as any).mozRequestFullScreen();
        } else if ((element as any).msRequestFullscreen) {
          await (element as any).msRequestFullscreen();
        }
      } else {
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
    }
  };

  const addToCart = (item: MenuItem) => {
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
        nameTr: item.nameTr,
        price: item.price,
        quantity: 1,
      }]);
    }
    setShowCart(true);
    showToast(`${item.name} added to cart`, 'success');
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
    const serviceCharge = 0; // Service charge removed - client doesn't charge service charges
    const total = subtotal + tax;
    return { subtotal, tax, serviceCharge, total };
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast('Your cart is empty', 'warning');
      return;
    }

    if (orderType === 'dine_in' && !selectedTable) {
      setShowTableSelection(true);
      return;
    }

    if (orderType === 'takeaway' || orderType === 'delivery') {
      if (!customerName || !customerPhone) {
        showToast('Please provide your name and phone number', 'warning');
        return;
      }
    }

    handlePlaceOrder();
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);

    try {
      // The API will handle staff member creation/selection automatically
      // We can pass null or omit staffId, and the API will find or create a default staff member

      // For takeaway/delivery, we need a table. Use a special table or create logic
      // For now, we'll use the first available table or create a virtual one
      let tableId = selectedTable?.id;
      
      if (!tableId && (orderType === 'takeaway' || orderType === 'delivery')) {
        // Find or use first available table for takeaway/delivery orders
        const availableTable = tables.find(t => t.status === 'available');
        if (availableTable) {
          tableId = availableTable.id;
        } else {
          showToast('No available table. Please contact staff.', 'error');
          setSubmitting(false);
          return;
        }
      }

      if (!tableId) {
        showToast('Please select a table', 'error');
        setSubmitting(false);
        return;
      }

      // Try to get a staff member, but don't fail if none exists (API will handle it)
      let staffId = null;
      try {
        const staffResponse = await fetch('/api/staff');
        const staffData = await staffResponse.json();
        if (Array.isArray(staffData) && staffData.length > 0) {
          staffId = staffData[0].id;
        }
      } catch (error) {
        // Ignore error - API will create default staff if needed
        console.log('Could not fetch staff, API will handle default staff creation');
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: tableId,
          staffId: staffId, // Can be null - API will handle it
          items: cart.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions || undefined,
          })),
          notes: orderType === 'takeaway' || orderType === 'delivery' 
            ? `${orderType === 'delivery' ? 'Delivery' : 'Takeaway'} Order - Name: ${customerName}, Phone: ${customerPhone}`
            : undefined,
        }),
      });

      if (response.ok) {
        const orderData = await response.json();
        setOrderNumber(orderData.id.substring(0, 8).toUpperCase());
        setShowOrderConfirmation(true);
        setCart([]);
        setSelectedTable(null);
        setCustomerName('');
        setCustomerPhone('');
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error || 'Failed to place order'}`, 'error');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'food':
        return <Utensils className="w-6 h-6" />;
      case 'cocktail':
        return <Wine className="w-6 h-6" />;
      case 'shisha':
        return <Coffee className="w-6 h-6" />;
      default:
        return <Utensils className="w-6 h-6" />;
    }
  };

  const filteredCategories = categories.filter((category) => {
    if (selectedType !== 'all' && category.type !== selectedType) return false;
    return true;
  });

  const cartTotal = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1a1a]">
        <div className="text-2xl text-[#D4AF37]">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Fullscreen Toggle Button - Fixed Position */}
      <button
        onClick={toggleFullscreen}
        className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-6 py-3 rounded-lg shadow-lg font-semibold transition-all border-2 ${
          isFullscreen
            ? 'bg-[#800020] text-white hover:bg-[#a00028] border-[#800020]'
            : 'bg-[#D4AF37] text-black hover:bg-[#f4c430] border-[#D4AF37]'
        }`}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? (
          <>
            <Minimize2 className="w-5 h-5" />
            <span>Exit Fullscreen</span>
          </>
        ) : (
          <>
            <Maximize2 className="w-5 h-5" />
            <span>Activate Fullscreen</span>
          </>
        )}
      </button>

      {/* Cart Button - Fixed Position */}
      {cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-6 py-3 bg-[#D4AF37] text-black rounded-full shadow-lg font-semibold transition-all hover:bg-[#f4c430] border-2 border-[#D4AF37]"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
          <span className="ml-2">£{cartTotal.total.toFixed(2)}</span>
        </button>
      )}

      {/* Header */}
      <div className="bg-[#1a1a1a] shadow-lg border-b-4 border-[#D4AF37]">
        <div className="container mx-auto px-4 sm:px-8 py-4 sm:py-6">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#D4AF37] mb-2">
              Fumari Restaurant
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300">Turkish Cuisine • Shisha • Cocktails</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">Birmingham, UK</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="container mx-auto px-4 sm:px-8 py-4 sm:py-6">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          {[
            { value: 'all', label: 'All Menu' },
            { value: 'food', label: 'Food' },
            { value: 'cocktail', label: 'Cocktails' },
            { value: 'shisha', label: 'Shisha' },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base md:text-lg transition-all border-2 ${
                selectedType === type.value
                  ? 'bg-[#D4AF37] text-black shadow-lg scale-105 border-[#D4AF37]'
                  : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#1a4d2e] hover:text-white shadow-md border-[#800020]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Menu Categories */}
        <div className="space-y-8 sm:space-y-12">
          {filteredCategories.map((category) => {
            const items = category.items.filter((item) => item.available);
            if (items.length === 0) return null;

            return (
              <div key={category.id} className="bg-[#2a2a2a] rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border-2 border-[#800020]">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8 pb-4 border-b-4 border-[#D4AF37]">
                  <div className="text-[#D4AF37]">{getTypeIcon(category.type)}</div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#D4AF37]">{category.name}</h2>
                    {category.nameTr && (
                      <p className="text-base sm:text-lg md:text-xl text-gray-300 mt-1">{category.nameTr}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#1a1a1a] rounded-xl p-4 sm:p-6 border-2 border-[#800020] hover:border-[#D4AF37] hover:shadow-lg transition-all transform hover:scale-105 flex flex-col"
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                              {item.name}
                            </h3>
                            {item.nameTr && (
                              <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-2">{item.nameTr}</p>
                            )}
                          </div>
                          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#D4AF37] ml-2 sm:ml-4 flex-shrink-0">
                            £{item.price.toFixed(2)}
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-3">{item.description}</p>
                        )}
                        {item.preparationTime && (
                          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400 mb-4">
                            <Utensils className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{item.preparationTime} min</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] transition-colors font-semibold text-sm sm:text-base md:text-lg flex items-center justify-center space-x-2"
                      >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center py-8 border-t-2 border-[#800020]">
          <p className="text-[#D4AF37] text-lg font-semibold">
            Thank you for visiting Fumari Restaurant
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Select items and add to cart to place your order
          </p>
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-end justify-end">
          <div className="bg-[#1a1a1a] w-full sm:max-w-md h-full overflow-y-auto border-l-4 border-[#D4AF37] flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b-2 border-[#800020]">
              <h2 className="text-xl sm:text-2xl font-bold text-[#D4AF37]">Your Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {cart.length === 0 ? (
                <div className="text-center text-gray-300 py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <p className="text-lg">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.menuItemId} className="bg-[#2a2a2a] rounded-lg p-4 border-2 border-[#800020]">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg">{item.name}</h3>
                          {item.nameTr && (
                            <p className="text-gray-400 text-sm">{item.nameTr}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.menuItemId)}
                          className="text-[#800020] hover:text-[#a00028]"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateCartQuantity(item.menuItemId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-[#800020] rounded hover:bg-[#a00028] text-white"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-white font-semibold text-lg w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.menuItemId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-[#1a4d2e] rounded hover:bg-[#2d7a4f] text-white"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-[#D4AF37] font-bold text-lg">
                          £{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t-2 border-[#800020] p-4 sm:p-6 space-y-3 sm:space-y-4">
                {/* Order Type Selection */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Order Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'dine_in', label: 'Dine In' },
                      { value: 'takeaway', label: 'Takeaway' },
                      { value: 'delivery', label: 'Delivery' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          setOrderType(type.value as any);
                          if (type.value !== 'dine_in') {
                            setSelectedTable(null);
                          }
                        }}
                        className={`px-2 sm:px-3 py-2 rounded-lg font-medium transition-colors border-2 text-xs sm:text-sm ${
                          orderType === type.value
                            ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                            : 'bg-[#2a2a2a] text-gray-300 border-[#800020] hover:bg-[#1a4d2e]'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table Selection (for dine-in) */}
                {orderType === 'dine_in' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Table</label>
                    <button
                      onClick={() => setShowTableSelection(true)}
                      className={`w-full px-4 py-3 rounded-lg border-2 text-left ${
                        selectedTable
                          ? 'bg-[#2a2a2a] border-[#D4AF37] text-white'
                          : 'bg-[#2a2a2a] border-[#800020] text-gray-300'
                      }`}
                    >
                      {selectedTable ? `Table ${selectedTable.number}` : 'Select Table'}
                    </button>
                  </div>
                )}

                {/* Customer Info (for takeaway/delivery) */}
                {(orderType === 'takeaway' || orderType === 'delivery') && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Your Name *</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                )}

                {/* Totals */}
                <div className="bg-[#2a2a2a] rounded-lg p-4 border-2 border-[#800020] space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span>£{cartTotal.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>VAT (20%)</span>
                    <span>£{cartTotal.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-[#800020] pt-2 flex justify-between text-[#D4AF37] font-bold text-xl">
                    <span>Total</span>
                    <span>£{cartTotal.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={submitting || cart.length === 0}
                  className="w-full px-6 py-4 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg"
                >
                  {submitting ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table Selection Modal */}
      {showTableSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-lg shadow-2xl w-full max-w-3xl border-2 border-[#D4AF37] max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b-2 border-[#800020]">
              <h2 className="text-2xl font-bold text-[#D4AF37]">Select Table</h2>
              <button
                onClick={() => setShowTableSelection(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {tables
                  .filter(t => t.status === 'available' || t.status === 'occupied')
                  .map((table) => (
                    <button
                      key={table.id}
                      onClick={() => {
                        setSelectedTable(table);
                        setShowTableSelection(false);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedTable?.id === table.id
                          ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                          : 'bg-[#2a2a2a] text-white border-[#800020] hover:border-[#D4AF37]'
                      }`}
                    >
                      <div className="font-bold text-lg">Table {table.number}</div>
                      <div className="text-xs mt-1 opacity-75">Capacity: {table.capacity}</div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {showOrderConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-lg shadow-2xl w-full max-w-md border-2 border-[#D4AF37] p-6 sm:p-8 text-center">
            <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-[#D4AF37] mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-[#D4AF37] mb-4">Order Placed!</h2>
            <p className="text-gray-300 text-base sm:text-lg mb-2">Your order has been received</p>
            <p className="text-[#D4AF37] text-xl sm:text-2xl font-bold mb-6">Order #{orderNumber}</p>
            <p className="text-sm sm:text-base text-gray-400 mb-6">
              {orderType === 'dine_in' 
                ? 'Please wait at your table. Your order will be prepared shortly.'
                : orderType === 'takeaway'
                ? 'Your order will be ready for pickup shortly.'
                : 'Your order will be delivered to the provided address.'}
            </p>
            <button
              onClick={() => {
                setShowOrderConfirmation(false);
                setShowCart(false);
              }}
              className="w-full px-6 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] transition-colors font-bold text-base sm:text-lg"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
