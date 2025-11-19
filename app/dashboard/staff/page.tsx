'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Mail, Phone, UserCheck, Edit, Trash2, X, Save, Key, ToggleLeft, ToggleRight } from 'lucide-react';
import { showToast } from '@/components/Toast';

interface Staff {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  pin?: string;
  active: boolean;
}

interface Table {
  id: string;
  number: number;
  status: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'waiter',
    pin: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStaff();
    fetchTables();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff');
      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }
      const data = await response.json();
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([]);
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

  const handleAddStaff = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'waiter',
      pin: '',
    });
    setShowAddModal(true);
  };

  const handleEditStaff = (member: Staff) => {
    setSelectedStaff(member);
    setFormData({
      name: member.name,
      email: member.email || '',
      phone: member.phone || '',
      role: member.role,
      pin: member.pin || '',
    });
    setShowEditModal(true);
  };

  const handleAssignTables = (member: Staff) => {
    setSelectedStaff(member);
    setShowAssignModal(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pin: formData.pin || Math.floor(1000 + Math.random() * 9000).toString(),
        }),
      });

      if (response.ok) {
        showToast('Staff member added successfully!', 'success');
        setShowAddModal(false);
        fetchStaff();
        setFormData({
          name: '',
          email: '',
          phone: '',
          role: 'waiter',
          pin: '',
        });
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error || 'Failed to add staff'}`, 'error');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      showToast('Failed to add staff. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/staff/${selectedStaff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast('Staff member updated successfully!', 'success');
        setShowEditModal(false);
        setSelectedStaff(null);
        fetchStaff();
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error || 'Failed to update staff'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      showToast('Failed to update staff. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (member: Staff) => {
    try {
      const response = await fetch(`/api/staff/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !member.active }),
      });

      if (response.ok) {
        showToast(`Staff member ${!member.active ? 'activated' : 'deactivated'} successfully!`, 'success');
        fetchStaff();
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error || 'Failed to update status'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating staff status:', error);
      showToast('Failed to update staff status', 'error');
    }
  };

  const handleDeleteStaff = async (member: Staff) => {
    if (!confirm(`Are you sure you want to deactivate ${member.name}? They will be marked as inactive.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/staff/${member.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Staff member deactivated successfully!', 'success');
        fetchStaff();
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error || 'Failed to deactivate staff'}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      showToast('Failed to deactivate staff', 'error');
    }
  };

  const handleAssignTable = async (tableId: string) => {
    if (!selectedStaff) return;

    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedWaiterId: selectedStaff.id }),
      });

      if (response.ok) {
        showToast(`Table assigned to ${selectedStaff.name} successfully!`, 'success');
        fetchTables();
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error || 'Failed to assign table'}`, 'error');
      }
    } catch (error) {
      console.error('Error assigning table:', error);
      showToast('Failed to assign table', 'error');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager':
        return 'bg-[#D4AF37] text-black';
      case 'waiter':
        return 'bg-[#1a4d2e] text-white';
      case 'bartender':
        return 'bg-[#800020] text-white';
      case 'kitchen_staff':
        return 'bg-[#4a5568] text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const staffArray = Array.isArray(staff) ? staff : [];
  const roleStats = {
    total: staffArray.length,
    managers: staffArray.filter((s) => s.role === 'manager').length,
    waiters: staffArray.filter((s) => s.role === 'waiter').length,
    bartenders: staffArray.filter((s) => s.role === 'bartender').length,
    kitchen: staffArray.filter((s) => s.role === 'kitchen_staff').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-300">Loading staff...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#D4AF37] mb-2">Staff Management</h1>
          <p className="text-sm sm:text-base text-gray-300">Manage restaurant staff and assignments</p>
        </div>
        <button
          onClick={handleAddStaff}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] transition-colors font-medium text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard label="Total Staff" value={roleStats.total} color="bg-[#4a5568]" />
        <StatCard label="Managers" value={roleStats.managers} color="bg-[#D4AF37]" />
        <StatCard label="Waiters" value={roleStats.waiters} color="bg-[#1a4d2e]" />
        <StatCard label="Bartenders" value={roleStats.bartenders} color="bg-[#800020]" />
        <StatCard label="Kitchen" value={roleStats.kitchen} color="bg-[#4a5568]" />
      </div>

      {/* Staff List */}
      <div className="bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden border-2 border-[#800020]">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#2a2a2a] border-b-2 border-[#800020]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#D4AF37] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#D4AF37] uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#D4AF37] uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#D4AF37] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#D4AF37] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#1a1a1a] divide-y divide-[#800020]">
              {staffArray.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-300">
                    No staff members found. Click "Add Staff" to get started.
                  </td>
                </tr>
              ) : (
                staffArray.map((member) => (
                  <tr key={member.id} className="hover:bg-[#2a2a2a] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{member.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300 space-y-1">
                        {member.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{member.email}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(
                          member.role
                        )}`}
                      >
                        {member.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(member)}
                        className="flex items-center space-x-2"
                      >
                        {member.active ? (
                          <ToggleRight className="w-6 h-6 text-[#1a4d2e]" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-600" />
                        )}
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            member.active
                              ? 'bg-[#1a4d2e] text-white'
                              : 'bg-[#800020] text-white'
                          }`}
                        >
                          {member.active ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEditStaff(member)}
                          className="text-[#D4AF37] hover:text-[#f4c430] transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {member.role === 'waiter' && (
                          <button
                            onClick={() => handleAssignTables(member)}
                            className="text-[#1a4d2e] hover:text-[#2d7a4f] transition-colors"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteStaff(member)}
                          className="text-[#800020] hover:text-[#a00028] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden p-4 space-y-4">
          {staffArray.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              No staff members found. Click "Add Staff" to get started.
            </div>
          ) : (
            staffArray.map((member) => (
              <div key={member.id} className="bg-[#2a2a2a] rounded-lg p-4 border-2 border-[#800020]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-bold text-lg">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(
                          member.role
                        )}`}
                      >
                        {member.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleActive(member)}
                    className="ml-2"
                  >
                    {member.active ? (
                      <ToggleRight className="w-6 h-6 text-[#1a4d2e]" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-600" />
                    )}
                  </button>
                </div>
                {(member.email || member.phone) && (
                  <div className="mb-3 space-y-1 text-sm text-gray-300">
                    {member.email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-[#800020]">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.active
                        ? 'bg-[#1a4d2e] text-white'
                        : 'bg-[#800020] text-white'
                    }`}
                  >
                    {member.active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleEditStaff(member)}
                      className="text-[#D4AF37] hover:text-[#f4c430] transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    {member.role === 'waiter' && (
                      <button
                        onClick={() => handleAssignTables(member)}
                        className="text-[#1a4d2e] hover:text-[#2d7a4f] transition-colors"
                      >
                        <UserCheck className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteStaff(member)}
                      className="text-[#800020] hover:text-[#a00028] transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-lg shadow-2xl w-full max-w-md border-2 border-[#D4AF37] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#800020]">
              <h2 className="text-xl sm:text-2xl font-bold text-[#D4AF37]">Add Staff Member</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitAdd} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                >
                  <option value="waiter">Waiter</option>
                  <option value="bartender">Bartender</option>
                  <option value="kitchen_staff">Kitchen Staff</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  PIN (4 digits, leave empty for auto-generate)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  placeholder="0000"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-[#800020] text-white rounded-lg hover:bg-[#a00028] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {submitting ? 'Adding...' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-lg shadow-2xl w-full max-w-md border-2 border-[#D4AF37] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#800020]">
              <h2 className="text-xl sm:text-2xl font-bold text-[#D4AF37]">Edit Staff Member</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStaff(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                >
                  <option value="waiter">Waiter</option>
                  <option value="bartender">Bartender</option>
                  <option value="kitchen_staff">Kitchen Staff</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">PIN (4 digits)</label>
                <input
                  type="text"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  placeholder="0000"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedStaff(null);
                  }}
                  className="flex-1 px-4 py-2 bg-[#800020] text-white rounded-lg hover:bg-[#a00028] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Tables Modal */}
      {showAssignModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-lg shadow-2xl w-full max-w-2xl border-2 border-[#D4AF37] max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#800020]">
              <h2 className="text-lg sm:text-2xl font-bold text-[#D4AF37]">
                Assign Tables to {selectedStaff.name}
              </h2>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedStaff(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {tables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => handleAssignTable(table.id)}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-center ${
                      table.status === 'available' || table.status === 'occupied'
                        ? 'bg-[#2a2a2a] border-[#800020] hover:border-[#D4AF37] text-white'
                        : 'bg-[#1a1a1a] border-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={table.status !== 'available' && table.status !== 'occupied'}
                  >
                    <div className="font-bold text-base sm:text-lg">Table {table.number}</div>
                    <div className="text-xs mt-1 opacity-75">{table.status}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
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
