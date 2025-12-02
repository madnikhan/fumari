'use client';

import { useState, useEffect } from 'react';
import { Download, QrCode, Loader2 } from 'lucide-react';
import { showToast } from '@/components/Toast';

interface QRCodeData {
  tableId: string;
  tableNumber: number;
  qrCode: string;
  url: string;
}

export default function QRCodesPage() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      // Fetch all tables and their QR codes
      const tablesResponse = await fetch('/api/tables', {
        credentials: 'include',
      });
      if (tablesResponse.ok) {
        const tables = await tablesResponse.json();
        const qrPromises = tables.map((table: any) =>
          fetch(`/api/buzzer/generate-qr?tableNumber=${table.number}`, {
            credentials: 'include',
          })
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        );
        const results = await Promise.all(qrPromises);
        setQrCodes(results.filter(Boolean));
      }
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      showToast('Failed to load QR codes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateAllQRCodes = async () => {
    try {
      setGenerating(true);
      const response = await fetch('/api/buzzer/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('QR codes generated:', data);
        setQrCodes(data.qrCodes || []);
        showToast(`Successfully generated ${data.qrCodes?.length || 0} QR codes!`, 'success');
      } else {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('Failed to generate QR codes:', response.status, errorData);
        showToast(errorData.error || `Failed to generate QR codes (${response.status})`, 'error');
      }
    } catch (error: any) {
      console.error('Error generating QR codes:', error);
      showToast(error.message || 'Failed to generate QR codes', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const downloadQRCode = (qrCode: QRCodeData) => {
    const link = document.createElement('a');
    link.href = qrCode.qrCode;
    link.download = `table-${qrCode.tableNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#D4AF37] mb-2">QR Codes for Tables</h1>
          <p className="text-gray-400">Scan these QR codes to access table service</p>
        </div>
        <button
          onClick={generateAllQRCodes}
          disabled={generating}
          className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <QrCode className="w-4 h-4" />
              Generate All
            </>
          )}
        </button>
      </div>

      {qrCodes.length === 0 ? (
        <div className="text-center py-12 bg-[#1a1a1a] rounded-lg border border-[#333]">
          <QrCode className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No QR codes generated yet</p>
          <button
            onClick={generateAllQRCodes}
            disabled={generating}
            className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold py-2 px-4 rounded-lg"
          >
            Generate QR Codes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {qrCodes.map((qrCode, index) => (
            <div
              key={qrCode.tableId || `qr-${qrCode.tableNumber}-${index}`}
              className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 text-center"
            >
              <div className="mb-3">
                <h3 className="text-xl font-bold text-[#D4AF37] mb-2">
                  Table {qrCode.tableNumber}
                </h3>
                <img
                  src={qrCode.qrCode}
                  alt={`QR Code for Table ${qrCode.tableNumber}`}
                  className="w-full max-w-[200px] mx-auto border-2 border-white rounded"
                />
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => downloadQRCode(qrCode)}
                  className="w-full bg-[#800020] hover:bg-[#600018] text-white font-bold py-2 px-3 rounded flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <a
                  href={qrCode.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[#2d1b1b] hover:bg-[#3d2b2b] text-white font-bold py-2 px-3 rounded text-sm"
                >
                  View Page
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

