'use client';

import { useState, useEffect } from 'react';
import { Plus, Utensils, Wine, Coffee, Search, Edit2, Trash2, X, Save, Package } from 'lucide-react';
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
  descriptionTr?: string;
  price: number;
  available: boolean;
  preparationTime?: number;
  categoryId: string;
  displayOrder?: number;
}

export default function MenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameTr: '',
    description: '',
    descriptionTr: '',
    categoryId: '',
    price: '',
    preparationTime: '',
    available: true,
    displayOrder: '0',
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    nameTr: '',
    description: '',
    type: 'food',
    displayOrder: '0',
    active: true,
  });

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  const fetchMenu = async () => {
    try {
      // Fetch all categories with all items (including unavailable) for management
      const categoriesResponse = await fetch('/api/menu/categories');
      const itemsResponse = await fetch('/api/menu/items');
      
      if (categoriesResponse.ok && itemsResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        const itemsData = await itemsResponse.json();
        
        // Group items by category
        const categoriesWithItems = categoriesData.map((category: any) => ({
          ...category,
          items: itemsData.filter((item: MenuItem) => item.categoryId === category.id),
        }));
        
        setCategories(categoriesWithItems);
      } else {
        // Fallback to public menu endpoint
        const response = await fetch('/api/menu');
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/menu/categories');
      if (response.ok) {
        const data = await response.json();
        setAllCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      nameTr: '',
      description: '',
      descriptionTr: '',
      categoryId: allCategories[0]?.id || '',
      price: '',
      preparationTime: '',
      available: true,
      displayOrder: '0',
    });
    setShowItemModal(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      nameTr: item.nameTr || '',
      description: item.description || '',
      descriptionTr: item.descriptionTr || '',
      categoryId: item.categoryId,
      price: item.price.toString(),
      preparationTime: item.preparationTime?.toString() || '',
      available: item.available,
      displayOrder: item.displayOrder?.toString() || '0',
    });
    setShowItemModal(true);
  };

  const handleSaveItem = async () => {
    try {
      if (!formData.name || !formData.categoryId || !formData.price) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const url = editingItem
        ? `/api/menu/items/${editingItem.id}`
        : '/api/menu/items';
      const method = editingItem ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          nameTr: formData.nameTr || null,
          description: formData.description || null,
          descriptionTr: formData.descriptionTr || null,
          categoryId: formData.categoryId,
          price: parseFloat(formData.price),
          preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : null,
          available: formData.available,
          displayOrder: parseInt(formData.displayOrder),
        }),
      });

      if (response.ok) {
        showToast(editingItem ? 'Menu item updated successfully' : 'Menu item created successfully', 'success');
        setShowItemModal(false);
        fetchMenu();
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error || 'Failed to save menu item'}`, 'error');
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      showToast('Failed to save menu item', 'error');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/menu/items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        showToast(result.deleted ? 'Menu item deleted' : result.message || 'Menu item marked as unavailable', 'success');
        fetchMenu();
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error || 'Failed to delete menu item'}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      showToast('Failed to delete menu item', 'error');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const response = await fetch(`/api/menu/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !item.available }),
      });

      if (response.ok) {
        showToast(`Item marked as ${!item.available ? 'available' : 'unavailable'}`, 'success');
        fetchMenu();
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error || 'Failed to update availability'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      showToast('Failed to update availability', 'error');
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      nameTr: '',
      description: '',
      type: 'food',
      displayOrder: '0',
      active: true,
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      nameTr: category.nameTr || '',
      description: category.description || '',
      type: category.type,
      displayOrder: category.displayOrder?.toString() || '0',
      active: category.active,
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (!categoryFormData.name || !categoryFormData.type) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const url = editingCategory
        ? `/api/menu/categories/${editingCategory.id}`
        : '/api/menu/categories';
      const method = editingCategory ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryFormData.name,
          nameTr: categoryFormData.nameTr || null,
          description: categoryFormData.description || null,
          type: categoryFormData.type,
          displayOrder: parseInt(categoryFormData.displayOrder),
          active: categoryFormData.active,
        }),
      });

      if (response.ok) {
        showToast(editingCategory ? 'Category updated successfully' : 'Category created successfully', 'success');
        setShowCategoryModal(false);
        fetchMenu();
        fetchCategories();
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error || 'Failed to save category'}`, 'error');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      showToast('Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? Items in this category will be affected.')) {
      return;
    }

    try {
      const response = await fetch(`/api/menu/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        showToast(result.deleted ? 'Category deleted' : result.message || 'Category marked as inactive', 'success');
        fetchMenu();
        fetchCategories();
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error || 'Failed to delete category'}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Failed to delete category', 'error');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'food':
        return <Utensils className="w-5 h-5" />;
      case 'cocktail':
        return <Wine className="w-5 h-5" />;
      case 'shisha':
        return <Coffee className="w-5 h-5" />;
      default:
        return <Utensils className="w-5 h-5" />;
    }
  };

  const categoriesArray: MenuCategory[] = Array.isArray(categories) ? categories : [];
  const filteredCategories = categoriesArray.filter((category) => {
    if (selectedType !== 'all' && category.type !== selectedType) return false;
    return true;
  });

  const filteredItems = (items: MenuItem[]) => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.nameTr?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-300">Loading menu...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#D4AF37] mb-2">Menu Management</h1>
          <p className="text-sm sm:text-base text-gray-300">Manage Turkish food, cocktails, shisha, and all menu items</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddCategory}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#1a4d2e] text-white rounded-lg hover:bg-[#2d7a4f] transition-colors font-medium text-sm sm:text-base"
          >
            <Package className="w-4 h-4" />
            <span>Add Category</span>
          </button>
          <button
            onClick={handleAddItem}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] transition-colors font-medium text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm sm:text-base"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'food', 'drink', 'cocktail', 'shisha'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                selectedType === type
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-[#1a1a1a] text-gray-300 border-2 border-[#800020] hover:bg-[#2a2a2a]'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Categories */}
      <div className="space-y-6 sm:space-y-8">
        {filteredCategories.map((category) => {
          const items = filteredItems(category.items);
          return (
            <div key={category.id} className="bg-[#1a1a1a] rounded-lg shadow-md p-4 sm:p-6 border-2 border-[#800020]">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-3">
                  <div className="text-[#D4AF37]">{getTypeIcon(category.type)}</div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#D4AF37]">{category.name}</h2>
                    {category.nameTr && (
                      <p className="text-xs sm:text-sm text-gray-400">{category.nameTr}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-2 bg-[#1a4d2e] text-white rounded-lg hover:bg-[#2d7a4f] transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 bg-[#800020] text-white rounded-lg hover:bg-[#a00028] transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`border-2 rounded-lg p-4 bg-[#2a2a2a] ${
                      item.available
                        ? 'border-[#800020] hover:border-[#D4AF37]'
                        : 'border-gray-700 opacity-50'
                    } transition-colors`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        {item.nameTr && (
                          <p className="text-sm text-gray-400">{item.nameTr}</p>
                        )}
                      </div>
                      <div className="text-lg font-bold text-[#D4AF37]">
                        £{item.price.toFixed(2)}
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-300 mb-2">{item.description}</p>
                    )}
                    {item.preparationTime && (
                      <p className="text-xs text-gray-400 mb-2">
                        Prep time: {item.preparationTime} min
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span
                        className={`text-xs px-2 py-1 rounded cursor-pointer ${
                          item.available
                            ? 'bg-[#1a4d2e] text-white'
                            : 'bg-[#800020] text-white'
                        }`}
                        onClick={() => handleToggleAvailability(item)}
                      >
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-1.5 bg-[#1a4d2e] text-white rounded hover:bg-[#2d7a4f] transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 bg-[#800020] text-white rounded hover:bg-[#a00028] transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 text-gray-300">
          No menu items found
        </div>
      )}

      {/* Add/Edit Menu Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-lg shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#D4AF37]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#D4AF37]">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>
              <button
                onClick={() => setShowItemModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    placeholder="Item name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name (Turkish)
                  </label>
                  <input
                    type="text"
                    value={formData.nameTr}
                    onChange={(e) => setFormData({ ...formData, nameTr: e.target.value })}
                    className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    placeholder="Ürün adı"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (English)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    rows={2}
                    placeholder="Item description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (Turkish)
                  </label>
                  <textarea
                    value={formData.descriptionTr}
                    onChange={(e) => setFormData({ ...formData, descriptionTr: e.target.value })}
                    className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    rows={2}
                    placeholder="Ürün açıklaması"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  >
                    <option value="">Select category</option>
                    {allCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price (£) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prep Time (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  />
                </div>
                <div className="flex items-center space-x-4 pt-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="w-5 h-5 text-[#D4AF37] bg-black border-2 border-[#800020] rounded focus:ring-[#D4AF37]"
                    />
                    <span className="text-gray-300">Available</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSaveItem}
                  className="flex-1 px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] font-bold transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 border-2 border-[#800020] rounded-lg text-white hover:bg-[#800020] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-lg shadow-2xl p-6 max-w-lg w-full border-2 border-[#D4AF37]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#D4AF37]">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name (Turkish)
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.nameTr}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, nameTr: e.target.value })}
                    className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    placeholder="Kategori adı"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  rows={2}
                  placeholder="Category description"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type *
                  </label>
                  <select
                    value={categoryFormData.type}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, type: e.target.value })}
                    className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  >
                    <option value="food">Food</option>
                    <option value="drink">Drink</option>
                    <option value="cocktail">Cocktail</option>
                    <option value="shisha">Shisha</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={categoryFormData.displayOrder}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, displayOrder: e.target.value })}
                    className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryFormData.active}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, active: e.target.checked })}
                    className="w-5 h-5 text-[#D4AF37] bg-black border-2 border-[#800020] rounded focus:ring-[#D4AF37]"
                  />
                  <span className="text-gray-300">Active</span>
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSaveCategory}
                  className="flex-1 px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] font-bold transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border-2 border-[#800020] rounded-lg text-white hover:bg-[#800020] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
