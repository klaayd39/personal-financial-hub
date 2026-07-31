import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import type { IncomeRecord, ExpenseRecord, FilterState } from '../types/finance';
import { formatCurrency, formatDate, MONTH_NAMES } from './formatters';

export const exportToExcel = (
  incomes: IncomeRecord[],
  expenses: ExpenseRecord[],
  filter: FilterState
) => {
  const monthName = filter.month === -1 ? 'All Months' : MONTH_NAMES[filter.month];
  const fileName = `Financial_Report_${monthName}_${filter.year}.xlsx`;

  // Worksheets
  const incomeData = incomes.map((inc) => ({
    Date: formatDate(inc.date),
    Source: inc.source,
    Amount: inc.amount,
    Notes: inc.notes || '',
  }));

  const expenseData = expenses.map((exp) => ({
    Date: formatDate(exp.date),
    Description: exp.description,
    Category: exp.category,
    'Payment Method': exp.payment_method,
    Amount: exp.amount,
  }));

  const totalInc = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalExp = expenses.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalInc - totalExp;

  const summaryData = [
    { Metric: 'Report Period', Value: `${monthName} ${filter.year}` },
    { Metric: 'Total Income', Value: formatCurrency(totalInc) },
    { Metric: 'Total Expenses', Value: formatCurrency(totalExp) },
    { Metric: 'Net Savings / Balance', Value: formatCurrency(balance) },
    { Metric: 'Savings Rate', Value: totalInc > 0 ? `${((balance / totalInc) * 100).toFixed(1)}%` : '0%' },
  ];

  const workbook = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  const incomeSheet = XLSX.utils.json_to_sheet(incomeData);
  const expenseSheet = XLSX.utils.json_to_sheet(expenseData);

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');
  XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Income Records');
  XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expense Records');

  XLSX.writeFile(workbook, fileName);
};

export const exportToPDF = (
  incomes: IncomeRecord[],
  expenses: ExpenseRecord[],
  filter: FilterState
) => {
  const doc = new jsPDF();
  const monthName = filter.month === -1 ? 'All Months' : MONTH_NAMES[filter.month];

  // Header Styling
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('Personal Financial Hub', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Financial Performance Report - ${monthName} ${filter.year}`, 14, 28);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 34);

  // Financial Metrics Summary Table
  const totalInc = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalExp = expenses.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalInc - totalExp;

  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 40, 196, 40);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Overview Summary', 14, 48);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Income: ${formatCurrency(totalInc)}`, 14, 56);
  doc.text(`Total Expenses: ${formatCurrency(totalExp)}`, 14, 62);
  doc.text(`Net Balance: ${formatCurrency(balance)}`, 14, 68);

  let currentY = 80;

  // Income Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Income Statements', 14, currentY);
  currentY += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Date', 14, currentY);
  doc.text('Source', 45, currentY);
  doc.text('Notes', 90, currentY);
  doc.text('Amount', 170, currentY);
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  incomes.slice(0, 15).forEach((inc) => {
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }
    doc.text(formatDate(inc.date), 14, currentY);
    doc.text(inc.source, 45, currentY);
    doc.text((inc.notes || '-').substring(0, 35), 90, currentY);
    doc.text(formatCurrency(inc.amount), 170, currentY);
    currentY += 6;
  });

  currentY += 10;
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }

  // Expense Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Expense Statements', 14, currentY);
  currentY += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Date', 14, currentY);
  doc.text('Category', 45, currentY);
  doc.text('Description', 85, currentY);
  doc.text('Amount', 170, currentY);
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  expenses.slice(0, 20).forEach((exp) => {
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }
    doc.text(formatDate(exp.date), 14, currentY);
    doc.text(exp.category, 45, currentY);
    doc.text(exp.description.substring(0, 35), 85, currentY);
    doc.text(formatCurrency(exp.amount), 170, currentY);
    currentY += 6;
  });

  doc.save(`Financial_Report_${monthName}_${filter.year}.pdf`);
};
