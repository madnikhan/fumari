import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Generate a secure token for table QR code
 */
export function generateTableToken(tableNumber: number): string {
  const secret = process.env.QR_CODE_SECRET || 'fumari-restaurant-secret-key';
  const data = `${tableNumber}-${Date.now()}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex').substring(0, 32);
}

/**
 * Generate QR code URL for a table
 */
export function getTableQRUrl(tableNumber: number, token: string, requestUrl?: string): string {
  // Try to get base URL from environment variable first
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  // If not set, try to detect from request URL (for API routes)
  if (!baseUrl && requestUrl) {
    try {
      const url = new URL(requestUrl);
      baseUrl = `${url.protocol}//${url.host}`;
    } catch (e) {
      // Fallback if URL parsing fails
    }
  }
  
  // Fallback to localhost for development
  if (!baseUrl) {
    baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://fumari.vercel.app' 
      : 'http://localhost:3000';
  }
  
  return `${baseUrl}/table/${tableNumber}?token=${token}`;
}

/**
 * Generate QR code image data URL
 */
export async function generateQRCodeDataURL(url: string): Promise<string> {
  try {
    if (!url || url.length === 0) {
      throw new Error('URL is required for QR code generation');
    }
    
    const dataURL = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    
    if (!dataURL || !dataURL.startsWith('data:image')) {
      throw new Error('Invalid QR code data URL generated');
    }
    
    return dataURL;
  } catch (error: any) {
    console.error('Error generating QR code for URL:', url);
    console.error('Error details:', error.message || error);
    throw new Error(`Failed to generate QR code: ${error.message || error}`);
  }
}

/**
 * Generate QR code SVG string
 */
export async function generateQRCodeSVG(url: string): Promise<string> {
  try {
    const svg = await QRCode.toString(url, {
      type: 'svg',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return svg;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw error;
  }
}

/**
 * Verify table token
 */
export function verifyTableToken(tableNumber: number, token: string): boolean {
  // For now, we'll store tokens in the database
  // This is a simple verification - in production, you might want more security
  return token.length === 32;
}

