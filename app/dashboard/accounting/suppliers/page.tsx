'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Building2 } from 'lucide-react';
import { showToast } from '@/components/Toast';

interface Supplier {
  id: string;
  name: string;
  vatNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  contactName?: string;
  active: boolean;
  _count?: {
    purchases: number;
  };
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    vatNumber: '',
    address: '',
    phone: '',
    email: '',
    contactName: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/accounting/suppliers', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      showToast('Failed to load suppliers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingSupplier
        ? `/api/accounting/suppliers/${editingSupplier.id}`
        : '/api/accounting/suppliers';

      const method = editingSupplier ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast(
          editingSupplier ? 'Supplier updated successfully' : 'Supplier created successfully',
          'success'
        );
        setShowModal(false);
        setEditingSupplier(null);
        resetForm();
        fetchSuppliers();
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to save supplier', 'error');
      }
    } catch (error) {
      showToast('Failed to save supplier', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    try {
      const response = await fetch(`/api/accounting/suppliers/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        showToast('Supplier deleted successfully', 'success');
        fetchSuppliers();
      } else {
        showToast('Failed to delete supplier', 'error');
      }
    } catch (error) {
      showToast('Failed to delete supplier', 'error');
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      vatNumber: supplier.vatNumber || '',
      address: supplier.address || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      contactName: supplier.contactName || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      vatNumber: '',
      address: '',
      phone: '',
      email: '',
      contactName: '',
    });
    setEditingSupplier(null);
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.vatNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-[#D4AF37] mb-2">Suppliers</h1>
          <p className="text-gray-400">Manage your suppliers and vendors</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Supplier
        </button>
      </div>

      {/* Search */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            No suppliers found
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 hover:border-[#D4AF37] transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#800020] rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{supplier.name}</h3>
                    {supplier.vatNumber && (
                      <p className="text-sm text-gray-400">VAT: {supplier.vatNumber}</p>
                    )}
                  </div>
                </div>
                {!supplier.active && (
                  <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">Inactive</span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {supplier.contactName && (
                  <p className="text-sm text-gray-300">
                    <span className="text-gray-500">Contact:</span> {supplier.contactName}
                  </p>
                )}
                {supplier.email && (
                  <p className="text-sm text-gray-300">
                    <span className="text-gray-500">Email:</span> {supplier.email}
                  </p>
                )}
                {supplier.phone && (
                  <p className="text-sm text-gray-300">
                    <span className="text-gray-500">Phone:</span> {supplier.phone}
                  </p>
                )}
                {supplier.address && (
                  <p className="text-sm text-gray-300">
                    <span className="text-gray-500">Address:</span> {supplier.address}
                  </p>
                )}
                {supplier._count && (
                  <p className="text-sm text-[#D4AF37]">
                    {supplier._count.purchases} purchase{supplier._count.purchases !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(supplier)}
                  className="flex-1 px-3 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="px-3 py-2 bg-red-900/50 hover:bg-red-900 text-white rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#333]">
              <h2 className="text-2xl font-bold text-[#D4AF37]">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    VAT Number
                  </label>
                  <input
                    type="text"
                    value={formData.vatNumber}
                    onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                    placeholder="GB123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                  />
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
                  {editingSupplier ? 'Update' : 'Create'} Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

