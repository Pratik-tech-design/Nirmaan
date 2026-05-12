import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

export interface ExportData {
  labour: any[];
  sites: any[];
  payments: any[];
  projectName: string;
}

export const exportToExcel = async (
  payments: any[],
  labour: any[],
  sites: any[],
  projectName: string = 'NIRMAAN'
) => {
  const workbook = new ExcelJS.Workbook();
  const dateStr = format(new Date(), 'dd MMM yyyy');

  // --- SHEET 1: SUMMARY ---
  const summarySheet = workbook.addWorksheet('Summary');
  
  // Header
  summarySheet.mergeCells('A1:F1');
  const mainTitle = summarySheet.getCell('A1');
  mainTitle.value = `NIRMAAN LABOUR FINANCE REPORT — ${projectName}`;
  mainTitle.font = { name: 'Inter', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  mainTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF18181B' } };
  mainTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  
  summarySheet.mergeCells('A2:F2');
  const subTitle = summarySheet.getCell('A2');
  subTitle.value = `Generated: ${dateStr} • Period: All Time Archive`;
  subTitle.font = { name: 'Inter', size: 10, bold: true, color: { argb: 'FFA1A1AA' } };
  subTitle.alignment = { vertical: 'middle', horizontal: 'center' };

  // Summary Metrics
  const activeLabourCount = labour.filter(l => l.status !== 'inactive').length;
  const activeSitesCount = sites.filter(s => s.status !== 'archived').length;
  
  const totals = payments.reduce((acc, p) => {
    const type = p.paymentType;
    acc.total += Number(p.amount);
    if (type === 'kharchi') acc.kharchi += Number(p.amount);
    if (type === 'extra') acc.extra += Number(p.amount);
    if (type === 'advance') acc.advance += Number(p.amount);
    if (type === 'bonus') acc.bonus += Number(p.amount);
    if (type === 'deduction') acc.deduction += Number(p.amount);
    return acc;
  }, { total: 0, kharchi: 0, extra: 0, advance: 0, bonus: 0, deduction: 0 });

  const metrics = [
    ['METRIC', 'VALUE', 'REMARKS'],
    ['Total Labour Payments', totals.kharchi, 'Base daily wage distribution'],
    ['Total Extra Expense', totals.extra, 'Operational overheads'],
    ['Total Weekly Advances', totals.advance, 'Worker advance disbursements'],
    ['Total Bonuses', totals.bonus, 'Performance incentives'],
    ['Total Deductions', totals.deduction, 'Adjustments & recoveries'],
    ['', '', ''],
    ['Total Active Personnel', activeLabourCount, 'Operational units'],
    ['Total Active Projects', activeSitesCount, 'Infrastructure nodes'],
    ['NET PROJECT EXPENSE', totals.total, 'Aggregated financial outflow'],
  ];

  summarySheet.addRows(metrics.map((m, i) => i === 0 ? m : [m[0], m[1], m[2]]));
  
  // Style Metric Table
  summarySheet.getRow(4).font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  summarySheet.getRow(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF18181B' } };
  
  summarySheet.getColumn(1).width = 30;
  summarySheet.getColumn(2).width = 20;
  summarySheet.getColumn(3).width = 40;

  // Format metric amounts
  [5, 6, 7, 8, 9, 13].forEach(rowIdx => {
    const cell = summarySheet.getCell(`B${rowIdx}`);
    if (typeof cell.value === 'number') {
      cell.numFmt = '"₹"#,##0.00';
      cell.font = { bold: true };
    }
  });

  // --- SHEET 2: LABOUR PAYMENT LEDGER ---
  const ledgerSheet = workbook.addWorksheet('Labour Payment Ledger');
  
  ledgerSheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Labour Name', key: 'name', width: 25 },
    { header: 'Site Name', key: 'site', width: 25 },
    { header: 'Payment Type', key: 'type', width: 20 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Description', key: 'desc', width: 40 },
    { header: 'Added By', key: 'addedBy', width: 20 },
  ];

  // Global Header Sync
  ledgerSheet.getRow(1).height = 25;
  ledgerSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  ledgerSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF18181B' } };
  ledgerSheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

  payments.sort((a, b) => {
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeB - timeA;
  }).forEach(p => {
    const worker = labour.find(l => l.id === p.labourId);
    const site = sites.find(s => s.id === p.siteId);
    let date = 'N/A';
    try {
        if (p.createdAt?.toDate) date = format(p.createdAt.toDate(), 'dd/MM/yyyy');
        else if (p.createdAt) date = format(new Date(p.createdAt), 'dd/MM/yyyy');
    } catch(e) {}
    
    const row = ledgerSheet.addRow({
      date: date,
      name: worker?.name || 'Unknown',
      site: site?.siteName || 'Unknown',
      type: p.paymentType?.toUpperCase(),
      amount: Number(p.amount) || 0,
      desc: p.description || '-',
      addedBy: p.createdBy || 'Admin',
    });

    // Color Coding
    const typeCell = row.getCell('type');
    const amountCell = row.getCell('amount');
    
    amountCell.numFmt = '"₹"#,##0.00';
    amountCell.font = { bold: true };
    amountCell.alignment = { horizontal: 'right' };
    row.getCell('name').font = { bold: true };

    const colors: Record<string, { bg: string, text: string }> = {
      KHARCHI: { bg: 'FFDBEAFE', text: 'FF1E40AF' }, // Blue
      EXTRA: { bg: 'FFDCFCE7', text: 'FF166534' },   // Green
      ADVANCE: { bg: 'FFFFEDD5', text: 'FF9A3412' }, // Orange
      BONUS: { bg: 'FFF3E8FF', text: 'FF6B21A8' },   // Purple
      DEDUCTION: { bg: 'FFFEE2E2', text: 'FF991B1B' }, // Red
    };

    const color = colors[p.paymentType?.toUpperCase()] || { bg: 'FFF4F4F5', text: 'FF3F3F46' };
    typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color.bg } };
    typeCell.font = { bold: true, color: { argb: color.text } };
    typeCell.alignment = { horizontal: 'center' };
  });

  ledgerSheet.views = [{ state: 'frozen', ySplit: 1 }];
  ledgerSheet.autoFilter = 'A1:G1';

  // --- SHEET 3: SITE ANALYTICS ---
  const analyticsSheet = workbook.addWorksheet('Site Analytics');
  analyticsSheet.columns = [
    { header: 'Site Name', key: 'name', width: 30 },
    { header: 'Total Labour', key: 'labourCount', width: 15 },
    { header: 'Total Expense', key: 'total', width: 18 },
    { header: 'Kharchi', key: 'kharchi', width: 15 },
    { header: 'Advances', key: 'advance', width: 15 },
    { header: 'Deductions', key: 'deduction', width: 15 },
  ];

  analyticsSheet.getRow(1).height = 25;
  analyticsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  analyticsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF18181B' } };
  analyticsSheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

  sites.forEach(s => {
    const sitePayments = payments.filter(p => p.siteId === s.id);
    const siteLabourIds = new Set(sitePayments.map(p => p.labourId));
    
    const sTotals = sitePayments.reduce((acc, p) => {
      acc.total += Number(p.amount);
      if (p.paymentType === 'kharchi') acc.kharchi += Number(p.amount);
      if (p.paymentType === 'advance') acc.advance += Number(p.amount);
      if (p.paymentType === 'deduction') acc.deduction += Number(p.amount);
      return acc;
    }, { total: 0, kharchi: 0, advance: 0, deduction: 0 });

    const row = analyticsSheet.addRow({
      name: s.siteName,
      labourCount: siteLabourIds.size,
      total: sTotals.total,
      kharchi: sTotals.kharchi,
      advance: sTotals.advance,
      deduction: sTotals.deduction,
    });
    row.getCell('total').numFmt = '"₹"#,##0.00';
    row.getCell('kharchi').numFmt = '"₹"#,##0.00';
    row.getCell('advance').numFmt = '"₹"#,##0.00';
    row.getCell('deduction').numFmt = '"₹"#,##0.00';
  });

  // Export
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Nirmaan_Labour_Report_${format(new Date(), 'MMM_yyyy')}.xlsx`);
};
