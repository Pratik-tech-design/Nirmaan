import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Payment, Labour, Site } from '../types';
import { formatDate } from '../lib/utils';

export const exportToExcel = async (
  payments: any[],
  labour: any[],
  sites: any[],
  stats: { totalPayments: number, siteExpenses: any }
) => {
  const workbook = new ExcelJS.Workbook();
  
  // Sheet 1: Summary
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 20 },
  ];
  
  summarySheet.addRow(['Total Payments Made', payments.length]);
  summarySheet.addRow(['Total Spending (INR)', payments.reduce((acc, p) => acc + p.amount, 0)]);
  summarySheet.addRow(['Active Sites', sites.length]);
  summarySheet.addRow(['Total Labour Count', labour.length]);
  
  summarySheet.getRow(1).font = { bold: true };
  
  // Sheet 2: All Payments
  const paymentSheet = workbook.addWorksheet('Labour Payments');
  paymentSheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Labour Name', key: 'labour', width: 25 },
    { header: 'Site', key: 'site', width: 20 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Notes', key: 'notes', width: 40 },
  ];

  payments.forEach(p => {
    const worker = labour.find(l => l.id === p.labourId);
    const site = sites.find(s => s.id === p.siteId);
    
    const row = paymentSheet.addRow({
      date: formatDate(p.createdAt?.toDate ? p.createdAt.toDate() : p.createdAt, 'en'),
      labour: worker?.name || 'Unknown',
      site: site?.siteName || 'Unknown',
      type: p.paymentType.toUpperCase(),
      amount: p.amount,
      notes: p.description || '-',
    });

    // Color coding
    let color = 'FFFFFF';
    switch (p.paymentType) {
      case 'kharchi': color = '3b82f6'; break;
      case 'extra': color = '22c55e'; break;
      case 'advance': color = 'f59e0b'; break;
      case 'bonus': color = 'a855f7'; break;
      case 'deduction': color = 'f43f5e'; break;
    }
    
    row.getCell('type').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF' + color.replace('#', '') }
    };
    row.getCell('type').font = { color: { argb: 'FFFFFFFF' }, bold: true };
  });

  paymentSheet.getRow(1).font = { bold: true };

  // Write and Save
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Nirmaan_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
};
