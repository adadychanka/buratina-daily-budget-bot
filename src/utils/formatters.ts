import { format } from 'date-fns';
import type { ReportData } from '../types/bot';

// Format currency amounts
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date
export function formatDate(date: Date): string {
  return format(date, 'dd.MM.yyyy HH:mm');
}

// Format report summary for display
export function formatReportSummary(reportData: ReportData): string {
  const expensesText =
    reportData.expenses.length > 0
      ? reportData.expenses
          .map((exp) => `• ${exp.description}: ${formatAmount(exp.amount)}`)
          .join('\n')
      : 'No expenses';

  // Calculate cashAmount to ensure it's correct (whiteCash + blackCash)
  const calculatedCashAmount =
    (reportData.whiteCashAmount ?? 0) + (reportData.blackCashAmount ?? 0);
  const cashAmount = reportData.cashAmount ?? calculatedCashAmount;

  return `
📊 Report Summary:

📅 Report Date: ${formatDateWithRelative(reportData.reportDate)}

💰 Cash: ${formatAmount(cashAmount)}
💳 White Cash: ${formatAmount(reportData.whiteCashAmount)}
🖤 Black Cash: ${formatAmount(reportData.blackCashAmount)} (${
    reportData.blackCashLocation || 'N/A'
  })
💳 Card Sales: ${formatAmount(reportData.cardSalesAmount)}
📦 Expenses (${reportData.expenses.length} items):
${expensesText}
💰 Cashbox: ${formatAmount(reportData.cashboxAmount)}
📝 Notes: ${reportData.notes || 'None'}

📈 Total Sales: ${formatAmount(reportData.totalSales)}
  `.trim();
}

// Format report history
export function formatReportHistory(reports: ReportData[]): string {
  if (reports.length === 0) {
    return '📊 No reports yet';
  }

  const reportsText = reports
    .map((report, index) => {
      const date = format(report.reportDate, 'dd.MM.yyyy');
      return `${index + 1}. ${date} - ${formatAmount(report.totalSales)}`;
    })
    .join('\n');

  return `📊 Recent Reports:\n\n${reportsText}`;
}

// Format report data for Google Sheets export
export function formatReportForSheets(reportData: ReportData): string[] {
  const expensesDetails =
    reportData.expenses.length > 0
      ? reportData.expenses.map((exp) => `${exp.description}: ${exp.amount}`).join('; ')
      : '';

  const totalExpenses = reportData.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Calculate cashAmount to ensure it's correct (whiteCash + blackCash)
  const calculatedCashAmount =
    (reportData.whiteCashAmount ?? 0) + (reportData.blackCashAmount ?? 0);
  const cashAmount = reportData.cashAmount ?? calculatedCashAmount;

  return [
    format(reportData.reportDate, 'yyyy-MM-dd'), // Date
    reportData.totalSales.toString(), // Total Sales
    cashAmount.toString(), // Cash Amount (calculated)
    reportData.whiteCashAmount.toString(), // White Cash
    reportData.blackCashAmount.toString(), // Black Cash
    reportData.blackCashLocation || '', // Black Cash Location
    reportData.cardSalesAmount.toString(), // Card Sales
    totalExpenses.toString(), // Total Expenses
    expensesDetails, // Expenses Details
    reportData.cashboxAmount.toString(), // Cashbox Amount
    reportData.notes || '', // Notes
  ];
}

// Format error messages
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown error';
}

// Format time
export function formatTime(date: Date): string {
  return format(date, 'HH:mm:ss');
}

// Format date for display (date only)
export function formatDateForDisplay(date: Date): string {
  return format(date, 'dd.MM.yyyy');
}

// Format relative date description
export function formatRelativeDate(daysAgo: number): string {
  switch (daysAgo) {
    case 0:
      return 'Today';
    case 1:
      return 'Yesterday';
    case 2:
      return '2 days ago';
    default:
      return `${daysAgo} days ago`;
  }
}

// Format date with relative description
export function formatDateWithRelative(date: Date): string {
  const today = new Date();
  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const dateStr = formatDateForDisplay(date);
  const relativeStr = formatRelativeDate(diffDays);

  return `${dateStr} (${relativeStr})`;
}
