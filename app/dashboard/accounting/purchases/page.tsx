'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Calendar, Building2 } from 'lucide-react';
import { showToast } from '@/components/Toast';

interface Supplier {
  id: string;
  name: string;
  vatNumber?: string;
  email?: string;
  phone?: string;
}

interface Purchase {
  id: string;
  supplierId: string;
  supplier: Supplier;
  invoiceNumber?: string;
  date: string;
  category: string;
  description?: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  notes?: string;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    supplierId: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    category: 'stock',
    description: '',
    subtotal: 0,
    vatRate: 20,
    notes: '',
  });

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/accounting/purchases', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPurchases(data);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
      showToast('Failed to load purchases', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/accounting/suppliers?active=true', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPurchase
        ? `/api/accounting/purchases/${editingPurchase.id}`
        : '/api/accounting/purchases';
      
      const method = editingPurchase ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast(
          editingPurchase ? 'Purchase updated successfully' : 'Purchase created successfully',
          'success'
        );
        setShowModal(false);
        setEditingPurchase(null);
        resetForm();
        fetchPurchases();
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to save purchase', 'error');
      }
    } catch (error) {
      showToast('Failed to save purchase', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this purchase?')) return;

    try {
      const response = await fetch(`/api/accounting/purchases/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        showToast('Purchase deleted successfully', 'success');
        fetchPurchases();
      } else {
        showToast('Failed to delete purchase', 'error');
      }
    } catch (error) {
      showToast('Failed to delete purchase', 'error');
    }
  };

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      supplierId: purchase.supplierId,
      invoiceNumber: purchase.invoiceNumber || '',
      date: new Date(purchase.date).toISOString().split('T')[0],
      category: purchase.category,
      description: purchase.description || '',
      subtotal: purchase.subtotal,
      vatRate: purchase.vatRate,
      notes: purchase.notes || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      supplierId: '',
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
      category: 'stock',
      description: '',
      subtotal: 0,
      vatRate: 20,
      notes: '',
    });
    setEditingPurchase(null);
  };

  const calculateVAT = () => {
    return Math.round((formData.subtotal * formData.vatRate / 100) * 100) / 100;
  };

  const calculateTotal = () => {
    return formData.subtotal + calculateVAT();
  };

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || purchase.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'stock', 'equipment', 'utilities', 'rent', 'other'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#D4AF37] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#D4AF37] mb-2">Purchase Management</h1>
          <p className="text-gray-400">Manage supplier purchases and expenses</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Purchase
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search purchases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Purchases Table */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#2a2a2a]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#D4AF37]">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#D4AF37]">Supplier</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#D4AF37]">Invoice</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#D4AF37]">Category</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[#D4AF37]">Subtotal</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[#D4AF37]">VAT ({formData.vatRate}%)</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[#D4AF37]">Total</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-[#D4AF37]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No purchases found
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-t border-[#333] hover:bg-[#2a2a2a]">
                    <td className="px-4 py-3 text-white">
                      {new Date(purchase.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3 text-white">{purchase.supplier.name}</td>
                    <td className="px-4 py-3 text-gray-300">{purchase.invoiceNumber || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-[#800020] text-white text-xs rounded">
                        {purchase.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      £{purchase.subtotal.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      £{purchase.vatAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-[#D4AF37] font-bold">
                      £{purchase.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(purchase)}
                          className="p-2 hover:bg-[#3a3a3a] rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(purchase.id)}
                          className="p-2 hover:bg-[#3a3a3a] rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#333]">
              <h2 className="text-2xl font-bold text-[#D4AF37]">
                {editingPurchase ? 'Edit Purchase' : 'Add New Purchase'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Supplier *
                  </label>
                  <select
                    required
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="stock">Stock</option>
                    <option value="equipment">Equipment</option>
                    <option value="utilities">Utilities</option>
                    <option value="rent">Rent</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subtotal (£) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.subtotal}
                    onChange={(e) => setFormData({ ...formData, subtotal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    VAT Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.vatRate}
                    onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* VAT Calculation Preview */}
              <div className="bg-[#2a2a2a] border border-[#444] rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Subtotal:</span>
                  <span className="text-white">£{formData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">VAT ({formData.vatRate}%):</span>
                  <span className="text-white">£{calculateVAT().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#444]">
                  <span className="text-[#D4AF37]">Total:</span>
                  <span className="text-[#D4AF37]">£{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold rounded-lg transition-colors"
                >
                  {editingPurchase ? 'Update' : 'Create'} Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

