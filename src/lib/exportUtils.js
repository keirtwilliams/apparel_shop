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
