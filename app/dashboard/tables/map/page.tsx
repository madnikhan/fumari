'use client';

import { useState, useEffect } from 'react';
import { Table as TableIcon, Users, Clock, CheckCircle, XCircle, AlertCircle, Info, Edit2 } from 'lucide-react';
import { showToast } from '@/components/Toast';

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: string;
  currentGuests: number;
  section: {
    id: string;
    name: string;
  };
  assignedWaiter?: {
    name: string;
  };
}

interface TablePosition {
  table: Table;
  x: number; // Percentage from left
  y: number; // Percentage from top
  width: number; // Percentage width
  height: number; // Percentage height
}

interface Reservation {
  id: string;
  customerName: string;
  partySize: number;
  reservationTime: string;
  status: string;
  tableId?: string;
}

export default function TableMapPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [editingGuests, setEditingGuests] = useState<boolean>(false);
  const [guestCount, setGuestCount] = useState<number>(0);

  useEffect(() => {
    fetchTables();
    fetchReservations();
    const interval = setInterval(() => {
      fetchTables();
      fetchReservations();
    }, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchReservations = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/reservations?date=${today}`);
      const data = await response.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setReservations([]);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables');
      const data = await response.json();
      setTables(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-[#1a4d2e] hover:bg-[#2d7a4f]';
      case 'occupied':
        return 'bg-[#800020] hover:bg-[#a00028]';
      case 'reserved':
        return 'bg-[#D4AF37] hover:bg-[#f4c430]';
      case 'cleaning':
        return 'bg-[#4a5568] hover:bg-[#6b7280]';
      default:
        return 'bg-gray-700 hover:bg-gray-600';
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'available':
        return 'border-[#2d7a4f]';
      case 'occupied':
        return 'border-[#a00028]';
      case 'reserved':
        return 'border-[#f4c430]';
      case 'cleaning':
        return 'border-[#6b7280]';
      default:
        return 'border-gray-600';
    }
  };

  // Calculate table positions in a rectangular layout
  // Center area for bar/shisha, tables arranged around it
  // Layout: 20 tables top, 20 tables bottom, 5 tables left, 5 tables right
  // All areas are perfectly symmetrical
  const calculateTablePositions = (): TablePosition[] => {
    const positions: TablePosition[] = [];
    const tablesArray = Array.isArray(tables) ? tables : [];
    
    // Filter tables if needed
    const filteredTables = filter === 'all' 
      ? tablesArray 
      : tablesArray.filter(t => t.status === filter);

    // Sort by table number for consistent positioning
    const sortedTables = filteredTables.sort((a, b) => a.number - b.number);

    if (sortedTables.length === 0) return positions;

    // Define center bar area (30% width, 30% height, perfectly centered)
    const centerBarX = 35; // 35% from left
    const centerBarY = 35; // 35% from top
    const centerBarWidth = 30;
    const centerBarHeight = 30;

    // Table size and spacing - optimized for symmetry
    const tableSize = 4.5; // 4.5% width/height for each table
    const spacing = 2.5; // 2.5% spacing between tables
    const totalCellSize = tableSize + spacing;

    // Fixed distribution: 20 top, 20 bottom, 5 left, 5 right
    const topCount = 20;
    const bottomCount = 20;
    const leftCount = 5;
    const rightCount = 5;

    const margin = 2; // 2% margin from edges
    const gapToBar = 1; // Reduced gap between tables and bar (1% instead of default)
    let tableIndex = 0;

    // Top area: 20 tables arranged in 2 rows × 10 columns, perfectly centered
    // Position them closer to the bar to reduce gap
    const topTables = sortedTables.slice(tableIndex, tableIndex + topCount);
    const topCols = 10; // 10 columns for 20 tables (2 rows)
    const topRows = 2;
    // Calculate centered position for top tables
    const topAreaWidth = 100 - (2 * margin);
    const topTableAreaWidth = topCols * totalCellSize;
    const topStartX = (topAreaWidth - topTableAreaWidth) / 2 + margin;
    // Position top tables closer to the bar - calculate from bar top minus table area height minus gap
    const topTableAreaHeight = topRows * totalCellSize;
    const topStartY = centerBarY - topTableAreaHeight - gapToBar;
    
    topTables.forEach((table, i) => {
      const col = i % topCols;
      const row = Math.floor(i / topCols);
      positions.push({
        table,
        x: topStartX + (col * totalCellSize),
        y: topStartY + (row * totalCellSize),
        width: tableSize,
        height: tableSize,
      });
    });
    tableIndex += topTables.length;

    // Left area: 5 tables arranged in 2 columns
    // Column 1: 21, 22 (top to bottom)
    // Column 2: 24, 25 (top to bottom)
    // Table 23 will be positioned between them or below
    const leftTables = sortedTables.slice(tableIndex, tableIndex + leftCount);
    // Calculate vertical center position for left tables
    const leftTableAreaHeight = 2 * totalCellSize; // 2 rows
    const leftStartY = centerBarY + (centerBarHeight - leftTableAreaHeight) / 2;
    // Calculate horizontal positions for 2 columns
    const leftAreaWidth = centerBarX - (2 * margin);
    const leftColumn1X = margin + (leftAreaWidth - (2 * totalCellSize)) / 2; // Left column
    const leftColumn2X = leftColumn1X + totalCellSize; // Right column (next to column 1)
    
    // Position tables 21-22 in column 1, 24-25 in column 2
    leftTables.forEach((table, i) => {
      let col, row;
      if (table.number === 21 || table.number === 22) {
        // Column 1: 21, 22
        col = 0;
        row = table.number === 21 ? 0 : 1;
      } else if (table.number === 24 || table.number === 25) {
        // Column 2: 24, 25
        col = 1;
        row = table.number === 24 ? 0 : 1;
      } else {
        // Table 23: position in the middle or below
        col = 0;
        row = 2; // Below column 1
      }
      
      const x = col === 0 ? leftColumn1X : leftColumn2X;
      positions.push({
        table,
        x: x,
        y: leftStartY + (row * totalCellSize),
        width: tableSize,
        height: tableSize,
      });
    });
    tableIndex += leftTables.length;

    // Right area: 5 tables arranged in 2 columns
    // Column 1: 26, 27 (top to bottom)
    // Column 2: 29, 30 (top to bottom)
    // Table 28 will be positioned between them or below
    const rightTables = sortedTables.slice(tableIndex, tableIndex + rightCount);
    // Calculate vertical center position for right tables (same as left)
    const rightTableAreaHeight = 2 * totalCellSize; // 2 rows
    const rightStartY = centerBarY + (centerBarHeight - rightTableAreaHeight) / 2;
    // Calculate horizontal positions for 2 columns
    const rightAreaStartX = centerBarX + centerBarWidth + margin;
    const rightAreaWidth = 100 - rightAreaStartX - margin;
    const rightColumn1X = rightAreaStartX + (rightAreaWidth - (2 * totalCellSize)) / 2; // Left column
    const rightColumn2X = rightColumn1X + totalCellSize; // Right column (next to column 1)
    
    // Position tables 26-27 in column 1, 29-30 in column 2
    rightTables.forEach((table, i) => {
      let col, row;
      if (table.number === 26 || table.number === 27) {
        // Column 1: 26, 27
        col = 0;
        row = table.number === 26 ? 0 : 1;
      } else if (table.number === 29 || table.number === 30) {
        // Column 2: 29, 30
        col = 1;
        row = table.number === 29 ? 0 : 1;
      } else {
        // Table 28: position in the middle or below
        col = 0;
        row = 2; // Below column 1
      }
      
      const x = col === 0 ? rightColumn1X : rightColumn2X;
      positions.push({
        table,
        x: x,
        y: rightStartY + (row * totalCellSize),
        width: tableSize,
        height: tableSize,
      });
    });
    tableIndex += rightTables.length;

    // Bottom area: 20 tables arranged in 2 rows × 10 columns, perfectly centered (mirror of top)
    const bottomTables = sortedTables.slice(tableIndex, tableIndex + bottomCount);
    const bottomCols = 10; // 10 columns for 20 tables (2 rows)
    const bottomRows = 2;
    // Calculate centered position for bottom tables (same as top)
    const bottomAreaWidth = 100 - (2 * margin);
    const bottomTableAreaWidth = bottomCols * totalCellSize;
    const bottomStartX = (bottomAreaWidth - bottomTableAreaWidth) / 2 + margin;
    // Position bottom tables symmetrically - same gap below bar as above
    const bottomTableAreaHeight = bottomRows * totalCellSize;
    const bottomStartY = centerBarY + centerBarHeight + gapToBar;
    
    bottomTables.forEach((table, i) => {
      const col = i % bottomCols;
      const row = Math.floor(i / bottomCols);
      positions.push({
        table,
        x: bottomStartX + (col * totalCellSize),
        y: bottomStartY + (row * totalCellSize),
        width: tableSize,
        height: tableSize,
      });
    });

    return positions;
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
        if (selectedTable?.id === tableId) {
          const updatedTable = await response.json();
          setSelectedTable(updatedTable);
        }
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
        const updatedTable = await response.json();
        setSelectedTable(updatedTable);
        setEditingGuests(false);
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

  const tablePositions = calculateTablePositions();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading table map...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#D4AF37] mb-2">Table Map</h1>
          <p className="text-sm sm:text-base text-gray-300">Visual layout of all restaurant tables</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#1a4d2e] rounded"></div>
              <span className="text-gray-300">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#800020] rounded"></div>
              <span className="text-gray-300">Occupied</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#D4AF37] rounded"></div>
              <span className="text-gray-300">Reserved</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#4a5568] rounded"></div>
              <span className="text-gray-300">Cleaning</span>
            </div>
          </div>
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm sm:text-base"
          >
            <option value="all">All Tables</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="cleaning">Cleaning</option>
          </select>
        </div>
      </div>

      {/* Table Map */}
      <div className="bg-[#1a1a1a] rounded-lg shadow-xl p-4 sm:p-6 md:p-8 border-2 border-[#800020] overflow-x-auto">
        <div className="relative sm:h-[800px] sm:min-h-[600px]" style={{ width: '100%', minWidth: '600px', height: '600px', minHeight: '400px' }}>
          {/* Center Bar/Shisha Area */}
          <div
            className="absolute bg-gradient-to-br from-[#800020] via-[#600018] to-[#400010] rounded-2xl border-4 border-[#D4AF37] shadow-2xl flex items-center justify-center text-white font-bold text-xl z-10"
            style={{
              left: '35%',
              top: '35%',
              width: '30%',
              height: '30%',
            }}
          >
            <div className="text-center p-4">
              <div className="text-4xl mb-2">🍹</div>
              <div className="text-2xl text-[#D4AF37]">Cocktail Bar</div>
              <div className="text-lg mt-1 opacity-90">& Shisha Lounge</div>
            </div>
          </div>

          {/* Tables */}
          {tablePositions.map((pos) => {
            const tableReservation = reservations.find(r => r.tableId === pos.table.id);
            return (
              <div
                key={pos.table.id}
                onClick={() => setSelectedTable(pos.table)}
                className={`absolute rounded-lg border-4 ${getStatusBorder(pos.table.status)} cursor-pointer transition-all transform hover:scale-110 hover:z-50 shadow-lg ${getStatusColor(pos.table.status)} text-white flex flex-col items-center justify-center text-xs font-bold`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  width: `${pos.width}%`,
                  height: `${pos.height}%`,
                  minWidth: '60px',
                  minHeight: '60px',
                }}
                title={`Table ${pos.table.number} - ${pos.table.status}${tableReservation ? ` - Reserved by ${tableReservation.customerName}` : ''}`}
              >
                <TableIcon className="w-4 h-4 mb-1" />
                <div className="text-center">
                  <div className="font-bold">{pos.table.number}</div>
                  <div className="text-xs opacity-90">
                    {pos.table.currentGuests}/{pos.table.capacity}
                  </div>
                  {tableReservation && (
                    <div className="text-xs opacity-75 mt-1 border-t border-white/30 pt-1">
                      {new Date(tableReservation.reservationTime).toISOString().split('T')[1].slice(0, 5)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table Details Modal */}
      {selectedTable && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedTable(null)}
        >
          <div
            className="bg-[#1a1a1a] rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 border-2 border-[#D4AF37]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#D4AF37]">
                Table {selectedTable.number}
              </h2>
              <button
                onClick={() => setSelectedTable(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTable.status === 'available'
                      ? 'bg-[#1a4d2e] text-white'
                      : selectedTable.status === 'occupied'
                      ? 'bg-[#800020] text-white'
                      : selectedTable.status === 'reserved'
                      ? 'bg-[#D4AF37] text-black'
                      : 'bg-[#4a5568] text-white'
                  }`}
                >
                  {selectedTable.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Section:</span>
                <span className="font-medium text-white">{selectedTable.section.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Capacity:</span>
                <span className="font-medium text-white">{selectedTable.capacity} guests</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Current Guests:</span>
                <span className="font-medium text-white">{selectedTable.currentGuests}</span>
              </div>
              {selectedTable.assignedWaiter && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Waiter:</span>
                  <span className="font-medium text-white">{selectedTable.assignedWaiter.name}</span>
                </div>
              )}
              {(() => {
                const tableReservation = reservations.find(r => r.tableId === selectedTable.id);
                if (tableReservation) {
                  return (
                    <div className="mt-4 pt-4 border-t border-[#800020]">
                      <div className="text-sm font-semibold text-[#D4AF37] mb-2">Reservation:</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Customer:</span>
                          <span className="font-medium text-white">{tableReservation.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Party Size:</span>
                          <span className="font-medium text-white">{tableReservation.partySize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Time:</span>
                          <span className="font-medium text-white">
                            {typeof window !== 'undefined'
                              ? new Date(tableReservation.reservationTime).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : new Date(tableReservation.reservationTime).toISOString().split('T')[1].slice(0, 5)
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Status:</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            tableReservation.status === 'confirmed' ? 'bg-[#1a4d2e] text-white' :
                            tableReservation.status === 'pending' ? 'bg-[#D4AF37] text-black' :
                            'bg-gray-700 text-white'
                          }`}>
                            {tableReservation.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div className="mt-6 space-y-3">
              {/* Quick Status Actions */}
              <div>
                <div className="text-sm font-semibold text-[#D4AF37] mb-2">Change Status:</div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTable.status !== 'available' && (
                    <button
                      onClick={() => handleStatusChange(selectedTable.id, 'available')}
                      className="px-3 py-2 bg-[#1a4d2e] text-white rounded-lg hover:bg-[#2d7a4f] text-sm font-medium"
                    >
                      Set Available
                    </button>
                  )}
                  {selectedTable.status !== 'occupied' && (
                    <button
                      onClick={() => handleStatusChange(selectedTable.id, 'occupied')}
                      className="px-3 py-2 bg-[#800020] text-white rounded-lg hover:bg-[#a00028] text-sm font-medium"
                    >
                      Set Occupied
                    </button>
                  )}
                  {selectedTable.status !== 'reserved' && (
                    <button
                      onClick={() => handleStatusChange(selectedTable.id, 'reserved')}
                      className="px-3 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] text-sm font-medium"
                    >
                      Set Reserved
                    </button>
                  )}
                  {selectedTable.status !== 'cleaning' && (
                    <button
                      onClick={() => handleStatusChange(selectedTable.id, 'cleaning')}
                      className="px-3 py-2 bg-[#4a5568] text-white rounded-lg hover:bg-[#6b7280] text-sm font-medium"
                    >
                      Set Cleaning
                    </button>
                  )}
                </div>
              </div>

              {/* Guest Count Update */}
              {!editingGuests ? (
                <button
                  onClick={() => {
                    setEditingGuests(true);
                    setGuestCount(selectedTable.currentGuests);
                  }}
                  className="w-full px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Update Guest Count</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="number"
                    min="0"
                    max={selectedTable.capacity}
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-black border-2 border-[#800020] rounded-lg text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleGuestCountUpdate(selectedTable.id, guestCount)}
                      className="flex-1 px-4 py-2 bg-[#1a4d2e] text-white rounded-lg hover:bg-[#2d7a4f]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingGuests(false)}
                      className="px-4 py-2 border-2 border-[#800020] rounded-lg text-white hover:bg-[#800020]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-3 border-t border-[#800020]">
                <button
                  onClick={() => {
                    setSelectedTable(null);
                    setEditingGuests(false);
                  }}
                  className="flex-1 px-4 py-2 border-2 border-[#800020] rounded-lg text-white hover:bg-[#800020] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] rounded-lg shadow p-4 text-center border-2 border-[#800020]">
          <div className="text-2xl font-bold text-[#D4AF37]">{tables.length}</div>
          <div className="text-sm text-gray-300">Total Tables</div>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg shadow p-4 text-center border-2 border-[#1a4d2e]">
          <div className="text-2xl font-bold text-[#2d7a4f]">
            {tables.filter((t) => t.status === 'available').length}
          </div>
          <div className="text-sm text-gray-300">Available</div>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg shadow p-4 text-center border-2 border-[#800020]">
          <div className="text-2xl font-bold text-[#a00028]">
            {tables.filter((t) => t.status === 'occupied').length}
          </div>
          <div className="text-sm text-gray-300">Occupied</div>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg shadow p-4 text-center border-2 border-[#D4AF37]">
          <div className="text-2xl font-bold text-[#f4c430]">
            {tables.filter((t) => t.status === 'reserved').length}
          </div>
          <div className="text-sm text-gray-300">Reserved</div>
        </div>
      </div>
    </div>
  );
}

