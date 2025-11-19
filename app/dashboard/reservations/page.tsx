'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Phone, Mail, Plus } from 'lucide-react';
import { showToast } from '@/components/Toast';

interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationTime: string;
  status: string;
  specialRequests?: string;
  table?: {
    number: number;
  };
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    partySize: 2,
    reservationTime: '',
    specialRequests: '',
    tableId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  useEffect(() => {
    // Initialize date on client side only to avoid hydration mismatch
    if (!selectedDate) {
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchReservations();
    }
  }, [selectedDate]);

  useEffect(() => {
    if (showForm && selectedDate) {
      fetchAvailableTables();
    }
  }, [showForm, formData.partySize, selectedDate, formData.reservationTime]);

  const fetchReservations = async () => {
    try {
      const response = await fetch(`/api/reservations?date=${selectedDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }
      const data = await response.json();
      // Ensure data is an array
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setReservations([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTables = async () => {
    setLoadingTables(true);
    try {
      const response = await fetch('/api/tables');
      const data = await response.json();
      const tables = Array.isArray(data) ? data : [];
      
      // Filter tables that can accommodate the party size
      const suitable = tables.filter(
        (table: any) => 
          table.capacity >= formData.partySize && 
          (table.status === 'available' || table.status === 'reserved')
      );
      
      setAvailableTables(suitable);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setAvailableTables([]);
    } finally {
      setLoadingTables(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[#1a4d2e] text-white';
      case 'pending':
        return 'bg-[#D4AF37] text-black';
      case 'seated':
        return 'bg-[#4a5568] text-white';
      case 'cancelled':
        return 'bg-[#800020] text-white';
      default:
        return 'bg-gray-700 text-white';
    }
  };

  // Ensure reservations is always an array
  const reservationsArray = Array.isArray(reservations) ? reservations : [];
  const upcomingReservations = reservationsArray.filter(
    (r) => r.status === 'pending' || r.status === 'confirmed'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Combine date and time for reservationTime
      const reservationDateTime = formData.reservationTime 
        ? `${selectedDate}T${formData.reservationTime}`
        : `${selectedDate}T18:00`; // Default to 6 PM if no time selected

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerEmail: formData.customerEmail || undefined,
          partySize: formData.partySize,
          reservationTime: reservationDateTime,
          specialRequests: formData.specialRequests || undefined,
          tableId: formData.tableId || undefined,
        }),
      });

      if (response.ok) {
        // Reset form
        setFormData({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          partySize: 2,
          reservationTime: '',
          specialRequests: '',
          tableId: '',
        });
        setShowForm(false);
        // Refresh reservations
        fetchReservations();
        showToast('Reservation created successfully!', 'success');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || 'Failed to create reservation';
        console.error('Reservation error:', errorData);
        showToast(`Error: ${errorMessage}`, 'error');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      showToast('Failed to create reservation. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignTable = async (reservationId: string, partySize: number, reservationTime: string) => {
    try {
      const response = await fetch('/api/reservations/assign-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId,
          partySize,
          reservationTime,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showToast(`Table ${data.table.number} assigned successfully!`, 'success');
        fetchReservations();
      } else {
        const error = await response.json();
        showToast(`Error: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Error assigning table:', error);
      showToast('Failed to assign table', 'error');
    }
  };

  const handleUpdateStatus = async (reservationId: string, status: string) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchReservations();
        showToast(`Reservation ${status} successfully!`, 'success');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || 'Failed to update reservation';
        console.error('Reservation update error:', errorData);
        showToast(`Error: ${errorMessage}`, 'error');
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
      showToast('Failed to update reservation. Please check the console for details.', 'error');
    }
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#D4AF37] mb-2">Reservations</h1>
          <p className="text-sm sm:text-base text-gray-300">Manage customer reservations and bookings</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] transition-colors text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* New Reservation Form */}
      {showForm && (
        <div className="mb-4 sm:mb-6 bg-[#1a1a1a] rounded-lg shadow-md p-4 sm:p-6 border-2 border-[#D4AF37]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#D4AF37]">New Reservation</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  placeholder="+44 555 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Party Size *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={formData.partySize}
                  onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) || 2 })}
                  className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.reservationTime}
                  onChange={(e) => setFormData({ ...formData, reservationTime: e.target.value })}
                  className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                />
              </div>
            </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Select Table (Optional - Auto-assign if not selected)
                </label>
                {loadingTables ? (
                  <div className="text-sm text-gray-400">Loading available tables...</div>
                ) : (
                  <select
                    value={formData.tableId}
                    onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
                    className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  >
                    <option value="">Auto-assign (Recommended)</option>
                    {availableTables.map((table: any) => (
                      <option key={table.id} value={table.id}>
                        Table {table.number} - Capacity: {table.capacity} ({table.status})
                      </option>
                    ))}
                  </select>
                )}
                {availableTables.length === 0 && !loadingTables && (
                  <p className="text-sm text-[#D4AF37] mt-1">
                    No suitable tables available. Try adjusting party size or time.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  placeholder="Any special requests or notes..."
                />
              </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border-2 border-[#800020] rounded-lg text-white hover:bg-[#800020]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Creating...' : 'Create Reservation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Date Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard
          label="Total Today"
          value={reservationsArray.length}
          color="bg-[#4a5568]"
        />
        <StatCard
          label="Upcoming"
          value={upcomingReservations.length}
          color="bg-[#D4AF37]"
        />
        <StatCard
          label="Seated"
          value={reservationsArray.filter((r) => r.status === 'seated').length}
          color="bg-[#1a4d2e]"
        />
        <StatCard
          label="Cancelled"
          value={reservationsArray.filter((r) => r.status === 'cancelled').length}
          color="bg-[#800020]"
        />
      </div>

      {/* Reservations List */}
      <div className="bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden border-2 border-[#800020]">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#800020]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Party Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#1a1a1a] divide-y divide-[#800020]">
              {reservationsArray.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-[#2a2a2a]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {reservation.customerName}
                      </div>
                      <div className="text-sm text-gray-400 flex items-center space-x-1">
                        <Phone className="w-3 h-3" />
                        <span>{reservation.customerPhone}</span>
                      </div>
                      {reservation.customerEmail && (
                        <div className="text-sm text-gray-400 flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{reservation.customerEmail}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {new Date(reservation.reservationTime).toISOString().split('T')[1].slice(0, 5)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-sm text-white">
                      <Users className="w-4 h-4" />
                      <span>{reservation.partySize}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {reservation.table ? `Table ${reservation.table.number}` : 'TBD'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        reservation.status
                      )}`}
                    >
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {reservation.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAssignTable(reservation.id, reservation.partySize, reservation.reservationTime)}
                            className="text-[#1a4d2e] hover:text-[#2d7a4f] font-medium"
                          >
                            Assign Table
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(reservation.id, 'confirmed')}
                            className="text-[#D4AF37] hover:text-[#f4c430] font-medium"
                          >
                            Confirm
                          </button>
                        </>
                      )}
                      {reservation.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(reservation.id, 'seated')}
                          className="text-[#4a5568] hover:text-[#6b7280] font-medium"
                        >
                          Seat
                        </button>
                      )}
                      {reservation.status === 'seated' && (
                        <button
                          onClick={() => handleUpdateStatus(reservation.id, 'completed')}
                          className="text-[#1a4d2e] hover:text-[#2d7a4f] font-medium"
                        >
                          Complete
                        </button>
                      )}
                      {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                        <button
                          onClick={() => handleUpdateStatus(reservation.id, 'cancelled')}
                          className="text-[#800020] hover:text-[#a00028] font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden p-4 space-y-4">
          {reservationsArray.map((reservation) => (
            <div key={reservation.id} className="bg-[#2a2a2a] rounded-lg p-4 border-2 border-[#800020]">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{reservation.customerName}</h3>
                  <div className="text-sm text-gray-400 flex items-center space-x-1 mb-1">
                    <Phone className="w-3 h-3" />
                    <span>{reservation.customerPhone}</span>
                  </div>
                  {reservation.customerEmail && (
                    <div className="text-sm text-gray-400 flex items-center space-x-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{reservation.customerEmail}</span>
                    </div>
                  )}
                </div>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    reservation.status
                  )}`}
                >
                  {reservation.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div>
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white ml-2">
                    {new Date(reservation.reservationTime).toISOString().split('T')[1].slice(0, 5)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Party:</span>
                  <span className="text-white ml-2 flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{reservation.partySize}</span>
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">Table:</span>
                  <span className="text-white ml-2">
                    {reservation.table ? `Table ${reservation.table.number}` : 'TBD'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-3 border-t border-[#800020]">
                {reservation.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAssignTable(reservation.id, reservation.partySize, reservation.reservationTime)}
                      className="flex-1 px-3 py-2 bg-[#1a4d2e] text-white rounded-lg hover:bg-[#2d7a4f] text-sm font-medium"
                    >
                      Assign Table
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(reservation.id, 'confirmed')}
                      className="flex-1 px-3 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] text-sm font-medium"
                    >
                      Confirm
                    </button>
                  </>
                )}
                {reservation.status === 'confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(reservation.id, 'seated')}
                    className="flex-1 px-3 py-2 bg-[#4a5568] text-white rounded-lg hover:bg-[#6b7280] text-sm font-medium"
                  >
                    Seat
                  </button>
                )}
                {reservation.status === 'seated' && (
                  <button
                    onClick={() => handleUpdateStatus(reservation.id, 'completed')}
                    className="flex-1 px-3 py-2 bg-[#1a4d2e] text-white rounded-lg hover:bg-[#2d7a4f] text-sm font-medium"
                  >
                    Complete
                  </button>
                )}
                {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                  <button
                    onClick={() => handleUpdateStatus(reservation.id, 'cancelled')}
                    className="flex-1 px-3 py-2 bg-[#800020] text-white rounded-lg hover:bg-[#a00028] text-sm font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {reservationsArray.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No reservations found for this date
          </div>
        )}
      </div>
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

