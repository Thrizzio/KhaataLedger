export type ReportRange =
  | "today"
  | "thisWeek"
  | "thisMonth"
  | "lastMonth"
  | "last3Months"
  | "thisYear"
  | "custom";

export interface ReportRow {
  id: string;
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  transactionDate: string;
  createdBy: { name: string } | null;
}

export interface DayBucket {
  date: string;
  income: number;
  expense: number;
  net: number;
}

export interface ReportsData {
  range: ReportRange;
  start: string;
  end: string;
  summary: {
    income: number;
    expenses: number;
    netProfit: number;
    transactionCount: number;
    averageTransaction: number;
    largestTransaction: number;
  };
  businessInsights: {
    highestIncomeDay: { date: string; amount: number } | null;
    highestExpenseDay: { date: string; amount: number } | null;
    averageDailyIncome: number;
    averageDailyExpense: number;
    averageTransactionsPerDay: number;
  };
  incomeExpenseBreakdown: {
    income: number;
    expense: number;
    incomePercent: number;
    expensePercent: number;
  };
  dailyCashFlow: DayBucket[];
  incomeExpenseTrend: { date: string; income: number; expense: number }[];
  largestExpenses: ReportRow[];
  largestIncome: ReportRow[];
  recentTransactions: ReportRow[];
  khataSummary: {
    outstandingCredit: number;
    collected: number;
    pendingCustomers: number;
    overdueAmount: number;
  };
}
