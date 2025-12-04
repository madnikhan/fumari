'use client';

import { useState, useEffect } from 'react';
import { Table as TableIcon, Users, Clock, CheckCircle, XCircle, AlertCircle, Edit2, X } from 'lucide-react';
import { showToast } from '@/components/Toast';

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: string;
  currentGuests: number;
  section: {
    name: string;
  };
  assignedWaiter?: {
    name: string;
  };
}

interface Staff {
  id: string;
  name: string;
  role: string;
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [guestCount, setGuestCount] = useState<number>(0);
  const [assigningWaiter, setAssigningWaiter] = useState<string | null>(null);
  const [selectedWaiterId, setSelectedWaiterId] = useState<string>('');

  useEffect(() => {
    fetchTables();
    fetchStaff();
    const interval = setInterval(fetchTables, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff');
      if (response.ok) {
        const data = await response.json();
        setStaff(Array.isArray(data) ? data.filter((s: Staff) => s.role === 'waiter' || s.role === 'server') : []);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables');
      if (!response.ok) {
        throw new Error('Failed to fetch tables');
      }
      const data = await response.json();
      // Ensure data is an array
      setTables(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTables([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-[#1a4d2e] text-white border-[#2d7a4f]';
      case 'occupied':
        return 'bg-[#800020] text-white border-[#a00028]';
      case 'reserved':
        return 'bg-[#D4AF37] text-black border-[#f4c430]';
      case 'cleaning':
        return 'bg-[#4a5568] text-white border-[#6b7280]';
      default:
        return 'bg-gray-700 text-white border-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
      case 'occupied':
        return <Users className="w-4 h-4" />;
      case 'reserved':
        return <Clock className="w-4 h-4" />;
      case 'cleaning':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <TableIcon className="w-4 h-4" />;
    }
  };

  // Ensure tables is always an array
  const tablesArray = Array.isArray(tables) ? tables : [];

  const filteredTables = filter === 'all' 
    ? tablesArray 
    : tablesArray.filter(table => table.status === filter);

  const stats = {
    total: tablesArray.length,
    available: tablesArray.filter(t => t.status === 'available').length,
    occupied: tablesArray.filter(t => t.status === 'occupied').length,
    reserved: tablesArray.filter(t => t.status === 'reserved').length,
    cleaning: tablesArray.filter(t => t.status === 'cleaning').length,
  };

  const handleStatusChange = async (tableId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchTables();
        showToast(`Table status updated to ${newStatus}`, 'success');
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error || 'Failed to update table status'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating table status:', error);
      showToast('Failed to update table status', 'error');
    }
  };

  const handleGuestCountUpdate = async (tableId: string, count: number) => {
    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentGuests: count }),
      });

      if (response.ok) {
        fetchTables();
        setEditingTable(null);
        showToast('Guest count updated successfully', 'success');
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error || 'Failed to update guest count'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating guest count:', error);
      showToast('Failed to update guest count', 'error');
    }
  };

  const openEditModal = (table: Table) => {
    setEditingTable(table);
    setGuestCount(table.currentGuests);
  };

  const handleWaiterAssignment = async (tableId: string, waiterId: string | null) => {
    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedWaiterId: waiterId }),
      });

      if (response.ok) {
        fetchTables();
        setAssigningWaiter(null);
        showToast(waiterId ? 'Waiter assigned successfully' : 'Waiter unassigned successfully', 'success');
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error || 'Failed to assign waiter'}`, 'error');
      }
    } catch (error) {
      console.error('Error assigning waiter:', error);
      showToast('Failed to assign waiter', 'error');
    }
  };

  const getAvailableStatuses = (currentStatus: string) => {
    switch (currentStatus) {
      case 'available':
        return ['occupied', 'reserved', 'cleaning'];
      case 'occupied':
        return ['available', 'cleaning'];
      case 'reserved':
        return ['available', 'occupied', 'cleaning'];
      case 'cleaning':
        return ['available'];
      default:
        return ['available', 'occupied', 'reserved', 'cleaning'];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading tables...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#D4AF37] mb-2">Table Management</h1>
          <p className="text-sm sm:text-base text-gray-300">Manage and monitor all restaurant tables in real-time</p>
        </div>
        <a
          href="/dashboard/tables/map"
          className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] transition-colors font-medium text-sm sm:text-base text-center"
        >
          View Table Map
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard label="Total Tables" value={stats.total} color="bg-gray-500" />
        <StatCard label="Available" value={stats.available} color="bg-green-500" />
        <StatCard label="Occupied" value={stats.occupied} color="bg-red-500" />
        <StatCard label="Reserved" value={stats.reserved} color="bg-yellow-500" />
        <StatCard label="Cleaning" value={stats.cleaning} color="bg-blue-500" />
      </div>

      {/* Filters */}
      <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
        {['all', 'available', 'occupied', 'reserved', 'cleaning'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
              filter === status
                ? 'bg-[#D4AF37] text-black'
                : 'bg-[#2a2a2a] text-gray-300 border-2 border-[#800020] hover:bg-[#1a4d2e]'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {filteredTables.map((table) => (
          <div
            key={table.id}
            className="bg-[#1a1a1a] rounded-lg shadow-md p-6 border-2 border-[#800020] hover:border-[#D4AF37] hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <TableIcon className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-xl font-bold text-white">Table {table.number}</h3>
              </div>
              <div className={`px-3 py-1 rounded-full border flex items-center space-x-1 text-xs font-medium ${getStatusColor(table.status)}`}>
                {getStatusIcon(table.status)}
                <span>{table.status}</span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Section:</span>
                <span className="font-medium text-white">{table.section.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Capacity:</span>
                <span className="font-medium text-white">{table.capacity} guests</span>
              </div>
              <div className="flex justify-between">
                <span>Current:</span>
                <span className="font-medium text-white">{table.currentGuests} guests</span>
              </div>
              {table.assignedWaiter && (
                <div className="flex justify-between">
                  <span>Waiter:</span>
                  <span className="font-medium text-white">{table.assignedWaiter.name}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-[#800020] space-y-2">
              {/* Assign Waiter */}
              {assigningWaiter === table.id ? (
                <div className="space-y-2">
                  <select
                    value={selectedWaiterId}
                    onChange={(e) => setSelectedWaiterId(e.target.value)}
                    className="w-full px-3 py-2 bg-black border-2 border-[#800020] rounded-lg text-white text-sm focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  >
                    <option value="">No Waiter</option>
                    {staff.map((waiter) => (
                      <option key={waiter.id} value={waiter.id}>
                        {waiter.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleWaiterAssignment(table.id, selectedWaiterId || null)}
                      className="flex-1 px-3 py-2 bg-[#1a4d2e] text-white rounded-lg hover:bg-[#2d7a4f] transition-colors text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setAssigningWaiter(null);
                        setSelectedWaiterId('');
                      }}
                      className="px-3 py-2 border-2 border-[#800020] rounded-lg text-white hover:bg-[#800020] transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAssigningWaiter(table.id);
                    setSelectedWaiterId(table.assignedWaiter ? '' : '');
                  }}
                  className="w-full px-4 py-2 bg-[#1a4d2e] text-white rounded-lg hover:bg-[#2d7a4f] transition-colors font-medium text-sm flex items-center justify-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>{table.assignedWaiter ? 'Change Waiter' : 'Assign Waiter'}</span>
                </button>
              )}
              {/* Quick Status Actions */}
              <div className="grid grid-cols-2 gap-2">
                {getAvailableStatuses(table.status).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(table.id, status)}
                    className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                      status === 'available'
                        ? 'bg-[#1a4d2e] text-white hover:bg-[#2d7a4f]'
                        : status === 'occupied'
                        ? 'bg-[#800020] text-white hover:bg-[#a00028]'
                        : status === 'reserved'
                        ? 'bg-[#D4AF37] text-black hover:bg-[#f4c430]'
                        : 'bg-[#4a5568] text-white hover:bg-[#6b7280]'
                    }`}
                  >
                    Set {status}
                  </button>
                ))}
              </div>
              {/* Edit Guest Count */}
              <button
                onClick={() => openEditModal(table)}
                className="w-full px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] transition-colors font-medium text-sm flex items-center justify-center space-x-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Update Guests</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTables.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No tables found with status "{filter}"
        </div>
      )}

      {/* Edit Guest Count Modal */}
      {editingTable && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-lg shadow-2xl p-4 sm:p-6 max-w-md w-full border-2 border-[#D4AF37]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#D4AF37]">
                Update Guest Count - Table {editingTable.number}
              </h2>
              <button
                onClick={() => setEditingTable(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Guests (Capacity: {editingTable.capacity})
                </label>
                <input
                  type="number"
                  min="0"
                  max={editingTable.capacity}
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleGuestCountUpdate(editingTable.id, guestCount)}
                  className="flex-1 px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] transition-colors font-medium"
                >
                  Update
                </button>
                <button
                  onClick={() => setEditingTable(null)}
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

