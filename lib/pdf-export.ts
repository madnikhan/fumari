import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CompanySettings {
  companyName?: string;
  companyAddress?: string;
  vatRegistrationNumber?: string;
  companyPhone?: string;
  companyEmail?: string;
  currencySymbol?: string;
}

interface ReportData {
  type: 'daily' | 'weekly' | 'monthly';
  date?: string;
  weekStart?: string;
  weekEnd?: string;
  year?: number;
  month?: number;
  monthName?: string;
  totals: {
    totalOrders: number;
    totalSubtotal: number;
    totalVAT: number;
    totalServiceCharge: number;
    totalDiscount: number;
    totalAmount: number;
  };
  orders?: any[];
  dailyBreakdown?: any[];
}

export async function exportSalesReportToPDF(
  report: ReportData,
  settings: CompanySettings
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Colors (RGB)
  const maroon: [number, number, number] = [155, 78, 63];
  const gold: [number, number, number] = [255, 225, 118];
  const darkGray: [number, number, number] = [33, 34, 38];
  const lightGray: [number, number, number] = [229, 229, 229];

  // Header - Company Information
  doc.setFillColor(...maroon);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.companyName || 'Fumari Restaurant', margin, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (settings.companyAddress) {
    const addressLines = settings.companyAddress.split('\n');
    addressLines.forEach((line, index) => {
      doc.text(line, margin, 28 + index * 5);
    });
  }
  
  if (settings.vatRegistrationNumber) {
    doc.text(`VAT Registration: ${settings.vatRegistrationNumber}`, margin, 40);
  }

  yPos = 60;

  // Report Title
  doc.setTextColor(...darkGray);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  
  let reportTitle = '';
  let reportPeriod = '';
  
  if (report.type === 'daily') {
    reportTitle = 'Daily Sales Report';
    const reportDate = report.date ? new Date(report.date) : new Date();
    reportPeriod = reportDate.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } else if (report.type === 'weekly') {
    reportTitle = 'Weekly Sales Report';
    const startDate = report.weekStart ? new Date(report.weekStart) : new Date();
    const endDate = report.weekEnd ? new Date(report.weekEnd) : new Date();
    reportPeriod = `${startDate.toLocaleDateString('en-GB')} to ${endDate.toLocaleDateString('en-GB')}`;
  } else if (report.type === 'monthly') {
    reportTitle = 'Monthly Sales Report';
    reportPeriod = `${report.monthName || ''} ${report.year || new Date().getFullYear()}`;
  }
  
  doc.text(reportTitle, margin, yPos);
  yPos += 8;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${reportPeriod}`, margin, yPos);
  yPos += 10;

  // Generated Date
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, margin, yPos);
  yPos += 15;

  // Summary Cards Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('Summary', margin, yPos);
  yPos += 8;

  // Summary Table
  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: [
      ['Total Orders', report.totals.totalOrders.toString()],
      ['Subtotal (before VAT)', `${settings.currencySymbol || '£'}${report.totals.totalSubtotal.toFixed(2)}`],
      ['VAT (20%)', `${settings.currencySymbol || '£'}${report.totals.totalVAT.toFixed(2)}`],
      ['Service Charge', `${settings.currencySymbol || '£'}${report.totals.totalServiceCharge.toFixed(2)}`],
      ...(report.totals.totalDiscount > 0 ? [['Discounts', `-${settings.currencySymbol || '£'}${report.totals.totalDiscount.toFixed(2)}`]] : []),
      ['Total Revenue', `${settings.currencySymbol || '£'}${report.totals.totalAmount.toFixed(2)}`],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: maroon,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 120, fontStyle: 'bold' },
      1: { cellWidth: 60, halign: 'right' },
    },
  });

  yPos = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : yPos + 50;

  // Detailed Breakdown Section
  if (report.type === 'daily' && report.orders) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('Order Details', margin, yPos);
    yPos += 8;

    const orderRows = report.orders.map((order: any) => [
      new Date(order.createdAt).toLocaleDateString('en-GB'),
      order.id.substring(0, 8),
      `Table ${order.table?.number || 'N/A'}`,
      `${settings.currencySymbol || '£'}${order.subtotal.toFixed(2)}`,
      `${settings.currencySymbol || '£'}${order.vatAmount.toFixed(2)}`,
      `${settings.currencySymbol || '£'}${order.serviceCharge.toFixed(2)}`,
      `${settings.currencySymbol || '£'}${order.total.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Order ID', 'Table', 'Subtotal', 'VAT', 'Service', 'Total']],
      body: orderRows,
      theme: 'striped',
      headStyles: {
        fillColor: maroon,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right', fontStyle: 'bold' },
      },
    });
  } else if ((report.type === 'weekly' || report.type === 'monthly') && report.dailyBreakdown) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('Daily Breakdown', margin, yPos);
    yPos += 8;

    const breakdownRows = report.dailyBreakdown.map((day: any) => [
      new Date(day.date).toLocaleDateString('en-GB'),
      (day.orders?.length || day.orders || 0).toString(),
      `${settings.currencySymbol || '£'}${day.subtotal.toFixed(2)}`,
      `${settings.currencySymbol || '£'}${day.vat.toFixed(2)}`,
      `${settings.currencySymbol || '£'}${day.serviceCharge?.toFixed(2) || '0.00'}`,
      `${settings.currencySymbol || '£'}${day.total.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Orders', 'Subtotal', 'VAT', 'Service', 'Total']],
      body: breakdownRows,
      theme: 'striped',
      headStyles: {
        fillColor: maroon,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right', fontStyle: 'bold' },
      },
    });
  }

  // Footer
  const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : yPos + 15;
  
  if (finalY > pageHeight - 30) {
    doc.addPage();
    yPos = margin;
  } else {
    yPos = finalY;
  }

  // HMRC Compliance Footer
  doc.setDrawColor(...maroon);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.setFont('helvetica', 'italic');
  doc.text('This report is generated for HMRC compliance purposes.', margin, yPos);
  yPos += 5;
  doc.text('All figures are in GBP (£) and include VAT where applicable.', margin, yPos);
  yPos += 5;
  
  if (settings.vatRegistrationNumber) {
    doc.text(`VAT Registration Number: ${settings.vatRegistrationNumber}`, margin, yPos);
  }

  // Page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin - 30,
      pageHeight - 10
    );
  }

  // Generate filename
  let filename = '';
  if (report.type === 'daily') {
    filename = `daily-sales-${report.date || new Date().toISOString().split('T')[0]}.pdf`;
  } else if (report.type === 'weekly') {
    filename = `weekly-sales-${report.weekStart || new Date().toISOString().split('T')[0]}.pdf`;
  } else if (report.type === 'monthly') {
    filename = `monthly-sales-${report.year}-${String(report.month).padStart(2, '0')}.pdf`;
  }

  // Save PDF
  doc.save(filename);
}

