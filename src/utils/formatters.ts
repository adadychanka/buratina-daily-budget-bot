import type { ReportData } from "../types/bot";

// Format currency amounts
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "RSD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("sr-RS", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Format report summary for display
export function formatReportSummary(reportData: ReportData): string {
  const expensesText =
    reportData.expenses.length > 0
      ? reportData.expenses
          .map((exp) => `• ${exp.description}: ${formatAmount(exp.amount)}`)
          .join("\n")
      : "No expenses";

  return `
📊 Report Summary:

💰 Cash: ${formatAmount(reportData.cashAmount)}
💳 White Cash: ${formatAmount(reportData.whiteCashAmount)}
🖤 Black Cash: ${formatAmount(reportData.blackCashAmount)} (${
    reportData.blackCashLocation || "N/A"
  })
💳 Card Sales: ${formatAmount(reportData.cardSalesAmount)}
📦 Expenses (${reportData.expenses.length} items):
${expensesText}
💰 Cashbox: ${formatAmount(reportData.cashboxAmount)}
📝 Notes: ${reportData.notes || "None"}

📈 Total Sales: ${formatAmount(reportData.totalSales)}
  `.trim();
}

// Format report history
export function formatReportHistory(reports: ReportData[]): string {
  if (reports.length === 0) {
    return "📊 No reports yet";
  }

  const reportsText = reports
    .map((report, index) => {
      const date = new Date().toLocaleDateString("sr-RS");
      return `${index + 1}. ${date} - ${formatAmount(report.totalSales)}`;
    })
    .join("\n");

  return `📊 Recent Reports:\n\n${reportsText}`;
}

// Format report data for Google Sheets export
export function formatReportForSheets(reportData: ReportData): string[] {
  const expensesDetails =
    reportData.expenses.length > 0
      ? reportData.expenses
          .map((exp) => `${exp.description}: ${exp.amount}`)
          .join("; ")
      : "";

  const totalExpenses = reportData.expenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );

  return [
    new Date().toISOString().split("T")[0], // Date
    reportData.totalSales.toString(), // Total Sales
    reportData.cashAmount.toString(), // Cash Amount
    reportData.whiteCashAmount.toString(), // White Cash
    reportData.blackCashAmount.toString(), // Black Cash
    reportData.blackCashLocation || "", // Black Cash Location
    reportData.cardSalesAmount.toString(), // Card Sales
    totalExpenses.toString(), // Total Expenses
    expensesDetails, // Expenses Details
    reportData.cashboxAmount.toString(), // Cashbox Amount
    reportData.notes || "", // Notes
  ];
}

// Format error messages
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error";
}

// Format time
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("sr-RS", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}
