import writeXlsxFile from 'write-excel-file/browser';

/**
 * Client-side data export utility supporting CSV, TSV, XML, and XLSX
 * Complies with strict client-side export requirements
 */

export const exportToCSV = (data, filename = 'purgatory-sales-report.csv') => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      const val = row[header] ?? '';
      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    }).join(',')
  );
  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename);
};

export const exportToTSV = (data, filename = 'purgatory-sales-report.tsv') => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      const val = row[header] ?? '';
      return String(val).replace(/\t/g, ' ');
    }).join('\t')
  );
  const tsvContent = [headers.join('\t'), ...rows].join('\r\n');
  const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
  triggerDownload(blob, filename);
};

export const exportToXML = (data, rootName = 'Orders', rowName = 'Order', filename = 'purgatory-sales-report.xml') => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n`;
  data.forEach(row => {
    xml += `  <${rowName}>\n`;
    headers.forEach(header => {
      const cleanHeader = header.replace(/[^a-zA-Z0-9_]/g, '_');
      const val = String(row[header] ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      xml += `    <${cleanHeader}>${val}</${cleanHeader}>\n`;
    });
    xml += `  </${rowName}>\n`;
  });
  xml += `</${rootName}>`;
  
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
  triggerDownload(blob, filename);
};

export const exportToXLSX = async (data, filename = 'purgatory-sales-report.xlsx') => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  
  // Header row schema
  const headerRow = headers.map(header => ({
    value: header.toUpperCase(),
    fontWeight: 'bold',
    backgroundColor: '#F2F1EE',
    color: '#1C1C1B'
  }));

  // Data rows
  const dataRows = data.map(row => 
    headers.map(header => {
      const val = row[header];
      if (typeof val === 'number') {
        return { value: val, type: Number };
      }
      return { value: String(val ?? ''), type: String };
    })
  );

  const fileData = [headerRow, ...dataRows];
  await writeXlsxFile(fileData, {
    fileName: filename
  });
};

/**
 * Download an official luxury receipt as a high-resolution PNG image
 * Generates an authentic, shareable digital receipt image client-side.
 */
export const downloadReceiptImage = (order) => {
  if (!order || typeof document === 'undefined') return;

  const items = order.items || [];
  const baseHeight = 650 + (items.length * 40);
  const width = 800;
  const height = Math.max(820, baseHeight);
  const scale = 2; // 2x Retina resolution for razor-sharp typography

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#FAF9F7';
  ctx.fillRect(0, 0, width, height);

  // Outer Border
  ctx.strokeStyle = '#E5E4E0';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Inner card background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(24, 24, width - 48, height - 48);
  ctx.strokeRect(24, 24, width - 48, height - 48);

  let y = 65;

  // Header Logo
  ctx.fillStyle = '#0C0C0B';
  ctx.font = '900 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('PURGATORY', 50, y);

  // Subtitle
  ctx.fillStyle = '#82807A';
  ctx.font = '600 10px monospace';
  ctx.fillText('FALLING FLAMES — OFFICIAL CONSIGNMENT RECEIPT', 50, y + 16);

  // Right Header: Order ID & Date
  ctx.textAlign = 'right';
  ctx.fillStyle = '#C43C30';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('[ VERIFIED CONSIGNMENT ]', width - 50, y - 4);

  ctx.fillStyle = '#0C0C0B';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(order.id, width - 50, y + 14);

  const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  ctx.fillStyle = '#82807A';
  ctx.font = '11px -apple-system, sans-serif';
  ctx.fillText(formattedDate, width - 50, y + 30);

  ctx.textAlign = 'left';
  y += 50;

  // Divider
  ctx.strokeStyle = '#E5E4E0';
  ctx.beginPath();
  ctx.moveTo(50, y);
  ctx.lineTo(width - 50, y);
  ctx.stroke();

  y += 30;

  // Client Details Columns
  // Left Column: Customer
  ctx.fillStyle = '#82807A';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('CLIENT INFORMATION', 50, y);

  ctx.fillStyle = '#0C0C0B';
  ctx.font = 'bold 13px -apple-system, sans-serif';
  ctx.fillText(order.customer_name || 'Valued Client', 50, y + 18);

  ctx.fillStyle = '#82807A';
  ctx.font = '12px -apple-system, sans-serif';
  ctx.fillText(order.customer_email || '', 50, y + 34);

  // Right Column: Shipping & Payment
  ctx.fillStyle = '#82807A';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('FULFILLMENT & DISPATCH', 400, y);

  ctx.fillStyle = '#0C0C0B';
  ctx.font = '12px -apple-system, sans-serif';
  const truncatedAddress = (order.shipping_address || 'Metro Manila, Philippines').slice(0, 45);
  ctx.fillText(truncatedAddress, 400, y + 18);

  ctx.fillStyle = '#575654';
  ctx.font = '11px -apple-system, sans-serif';
  const paymentMethodStr = `Payment: ${order.payment_method || 'COD'} (${(order.payment_status || 'PAID').toUpperCase()})`;
  ctx.fillText(paymentMethodStr, 400, y + 34);

  y += 60;

  // Divider
  ctx.beginPath();
  ctx.moveTo(50, y);
  ctx.lineTo(width - 50, y);
  ctx.stroke();

  y += 25;

  // Table Header
  ctx.fillStyle = '#82807A';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('PURCHASED GARMENT', 50, y);
  ctx.fillText('SPECS', 370, y);
  ctx.fillText('QTY', 510, y);
  ctx.textAlign = 'right';
  ctx.fillText('UNIT PRICE', 650, y);
  ctx.fillText('AMOUNT', width - 50, y);
  ctx.textAlign = 'left';

  y += 12;
  ctx.beginPath();
  ctx.moveTo(50, y);
  ctx.lineTo(width - 50, y);
  ctx.stroke();

  y += 24;

  // Items
  items.forEach(it => {
    ctx.fillStyle = '#0C0C0B';
    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.fillText(it.product_name || 'Archival Garment', 50, y);

    ctx.fillStyle = '#82807A';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillText(`${it.color_name || 'Obsidian'} · Size ${it.size || 'M'}`, 370, y);
    ctx.fillText(String(it.quantity || 1), 515, y);

    ctx.textAlign = 'right';
    const unitPrice = `PHP ${(Number(it.unit_price) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    ctx.fillText(unitPrice, 650, y);

    const lineTotal = `PHP ${(Number(it.unit_price) * (it.quantity || 1)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    ctx.fillStyle = '#0C0C0B';
    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.fillText(lineTotal, width - 50, y);
    ctx.textAlign = 'left';

    y += 28;
  });

  y += 10;
  // Divider
  ctx.beginPath();
  ctx.moveTo(50, y);
  ctx.lineTo(width - 50, y);
  ctx.stroke();

  y += 30;

  // Summary Totals (Right Aligned)
  const totalAmountFormatted = `PHP ${(Number(order.total_amount) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  ctx.textAlign = 'right';
  ctx.fillStyle = '#82807A';
  ctx.font = '12px -apple-system, sans-serif';
  ctx.fillText('Subtotal:', width - 200, y);
  ctx.fillStyle = '#0C0C0B';
  ctx.font = '600 12px monospace';
  ctx.fillText(totalAmountFormatted, width - 50, y);

  if (order.discount_amount && order.discount_amount > 0) {
    y += 20;
    ctx.fillStyle = '#C43C30';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText(`Promo Discount (${order.coupon_code || 'COUPON'}):`, width - 200, y);
    ctx.font = '600 12px monospace';
    ctx.fillText(`-PHP ${Number(order.discount_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, width - 50, y);
  }

  y += 20;
  ctx.fillStyle = '#82807A';
  ctx.font = '12px -apple-system, sans-serif';
  ctx.fillText('Express Shipping:', width - 200, y);
  ctx.fillStyle = '#2E7D32';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('COMPLIMENTARY', width - 50, y);

  y += 15;
  ctx.beginPath();
  ctx.moveTo(width - 280, y);
  ctx.lineTo(width - 50, y);
  ctx.stroke();

  y += 22;
  ctx.fillStyle = '#0C0C0B';
  ctx.font = 'bold 14px -apple-system, sans-serif';
  ctx.fillText('Total Paid:', width - 200, y);
  ctx.font = 'bold 16px monospace';
  ctx.fillText(totalAmountFormatted, width - 50, y);

  // Footer Note & Seal
  ctx.textAlign = 'center';
  ctx.fillStyle = '#82807A';
  ctx.font = '10px monospace';
  ctx.fillText('PURGATORY WORLDWIDE — FALLING FLAMES DIVISION', width / 2, height - 60);
  ctx.fillText(`AUTHENTICATED ARCHIVAL CONSIGNMENT · INQUIRIES: CONCIERGE@PURGATORY.LA`, width / 2, height - 44);

  // Export directly as high-res PNG image
  canvas.toBlob((blob) => {
    if (blob) {
      triggerDownload(blob, `PURGATORY-RECEIPT-${order.id}.png`);
    }
  }, 'image/png');
};

/**
 * Download a standalone, official luxury invoice document for an order
 */
export const downloadReceiptFile = (order) => {
  if (!order) return;
  const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #E5E4E0; font-weight: 600; color: #0C0C0B;">
        ${item.product_name || 'Archival Garment'}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #E5E4E0; text-align: center; color: #82807A;">
        ${item.color_name || 'Obsidian'} / ${item.size || 'M'}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #E5E4E0; text-align: center; color: #82807A;">
        ${item.quantity}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #E5E4E0; text-align: right; color: #82807A;">
        PHP ${(Number(item.unit_price) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #E5E4E0; text-align: right; font-weight: 600; color: #0C0C0B;">
        PHP ${(Number(item.unit_price) * item.quantity || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
    </tr>
  `).join('');

  const discountRow = order.discount_amount && order.discount_amount > 0 ? `
    <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #C43C30;">
      <span>Promo Discount (${order.coupon_code || 'COUPON'})</span>
      <span style="font-weight: 600;">-PHP ${Number(order.discount_amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
  ` : '';

  const totalFormatted = `PHP ${(Number(order.total_amount) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PURGATORY // RECEIPT - ${order.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #FAF9F7;
      color: #0C0C0B;
      padding: 40px 20px;
      line-height: 1.5;
    }
    .invoice-card {
      max-width: 680px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #E5E4E0;
      border-radius: 6px;
      padding: 40px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.04);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #E5E4E0;
      padding-bottom: 24px;
      gap: 20px;
    }
    .logo {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #0C0C0B;
    }
    .sub-logo {
      font-size: 10px;
      font-family: monospace;
      color: #82807A;
      letter-spacing: 0.1em;
      margin-top: 4px;
    }
    .invoice-id {
      font-family: monospace;
      font-weight: 700;
      font-size: 14px;
      color: #0C0C0B;
    }
    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      background: #FAF9F7;
      border: 1px solid #E5E4E0;
      padding: 2px 8px;
      border-radius: 3px;
      color: #0C0C0B;
      margin-bottom: 4px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      padding: 24px 0;
      border-bottom: 1px solid #E5E4E0;
      font-size: 12px;
    }
    .meta-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #82807A;
      margin-bottom: 6px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 16px;
    }
    th {
      font-weight: 600;
      color: #82807A;
      padding-bottom: 8px;
      border-bottom: 1px solid #E5E4E0;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.05em;
    }
    .totals {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
      font-size: 12px;
    }
    .totals-box {
      width: 260px;
    }
    .total-paid {
      font-size: 15px;
      font-weight: 700;
      color: #0C0C0B;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #E5E4E0;
      padding-top: 10px;
      margin-top: 8px;
    }
    .footer {
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px solid #E5E4E0;
      text-align: center;
      font-size: 11px;
      color: #82807A;
      font-family: monospace;
      line-height: 1.6;
    }
    .action-bar {
      max-width: 680px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: flex-end;
    }
    .btn-print {
      background: #0C0C0B;
      color: #FAF9F7;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      cursor: pointer;
    }
    @media print {
      body { background: #FFFFFF; padding: 0; }
      .invoice-card { border: none; box-shadow: none; padding: 0; }
      .action-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="logo">PURGATORY</div>
        <div class="sub-logo">FALLING FLAMES — OFFICIAL ARCHIVAL CONSIGNMENT</div>
      </div>
      <div style="text-align: right;">
        <span class="badge">OFFICIAL RECEIPT</span>
        <div class="invoice-id">${order.id}</div>
        <div style="font-size: 11px; color: #82807A; margin-top: 2px;">${formattedDate}</div>
      </div>
    </div>

    <div class="meta-grid">
      <div>
        <div class="meta-title">Client Information</div>
        <div style="font-weight: 600; color: #0C0C0B;">${order.customer_name || 'Valued Client'}</div>
        <div style="color: #82807A; margin-top: 2px;">${order.customer_email || ''}</div>
      </div>
      <div>
        <div class="meta-title">Delivery & Payment</div>
        <div style="color: #0C0C0B;">${order.shipping_address || 'Metro Manila, Philippines'}</div>
        <div style="color: #82807A; margin-top: 4px;">
          Method: <span style="font-weight: 600; color: #0C0C0B;">${order.payment_method || 'Cash on Delivery'}</span> (${order.payment_status || 'PAID'})
        </div>
      </div>
    </div>

    <div style="margin-top: 24px;">
      <div class="meta-title">Purchased Pieces</div>
      <table>
        <thead>
          <tr>
            <th style="text-align: left;">Garment</th>
            <th style="text-align: center;">Specs</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>

    <div class="totals">
      <div class="totals-box">
        <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #82807A;">
          <span>Subtotal</span>
          <span style="font-weight: 600; color: #0C0C0B;">${totalFormatted}</span>
        </div>
        ${discountRow}
        <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #82807A;">
          <span>Express Delivery</span>
          <span style="color: #2E7D32; font-weight: 600;">Complimentary</span>
        </div>
        <div class="total-paid">
          <span>Total Paid</span>
          <span>${totalFormatted}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      PURGATORY WORLDWIDE · FALLING FLAMES DIVISION<br>
      EACH GARMENT IS NUMBERED & PRODUCED UNDER ATELIER STANDARDS.<br>
      FOR INQUIRIES OR CONCIERGE ASSISTANCE: CONCIERGE@PURGATORY.LA (REF: ${order.id})
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  triggerDownload(blob, `PURGATORY-RECEIPT-${order.id}.html`);
};

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
