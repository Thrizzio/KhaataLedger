import { prisma } from "../config/prisma.js";

export type ReportRange =
  | "today"
  | "thisWeek"
  | "thisMonth"
  | "lastMonth"
  | "last3Months"
  | "thisYear"
  | "custom";

export const REPORT_RANGES: ReportRange[] = [
  "today",
  "thisWeek",
  "thisMonth",
  "lastMonth",
  "last3Months",
  "thisYear",
  "custom",
];

export interface ReportQueryInput {
  workspaceId: string;
  range: ReportRange;
  startDate?: string;
  endDate?: string;
}

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

const DAY_MS = 86_400_000;

const round = (n: number): number => Math.round(n * 100) / 100;

const utcMidnight = (d: Date): Date =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

const addDays = (d: Date, n: number): Date => new Date(d.getTime() + n * DAY_MS);

const toDateKey = (d: Date): string => d.toISOString().slice(0, 10);

// Resolves a range into [start, end) where both are UTC midnight boundaries.
// `end` is EXCLUSIVE (start of the day after the last included day) so the
// query can use `transactionDate: { gte: start, lt: end }`.
const resolveRange = (
  range: ReportRange,
  startDate?: string,
  endDate?: string,
): { start: Date; end: Date } => {
  const now = new Date();
  const today = utcMidnight(now);
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();

  switch (range) {
    case "today":
      return { start: today, end: addDays(today, 1) };
    case "thisWeek": {
      const monday = addDays(today, -((now.getUTCDay() + 6) % 7));
      return { start: monday, end: addDays(monday, 7) };
    }
    case "thisMonth":
      return { start: new Date(Date.UTC(y, m, 1)), end: new Date(Date.UTC(y, m + 1, 1)) };
    case "lastMonth":
      return { start: new Date(Date.UTC(y, m - 1, 1)), end: new Date(Date.UTC(y, m, 1)) };
    case "last3Months":
      return { start: new Date(Date.UTC(y, m - 2, 1)), end: new Date(Date.UTC(y, m + 1, 1)) };
    case "thisYear":
      return { start: new Date(Date.UTC(y, 0, 1)), end: new Date(Date.UTC(y + 1, 0, 1)) };
    case "custom": {
      const parsedStart = startDate ? new Date(startDate) : today;
      const parsedEnd = endDate ? new Date(endDate) : today;
      const s = Number.isNaN(parsedStart.getTime()) ? today : utcMidnight(parsedStart);
      const e = Number.isNaN(parsedEnd.getTime()) ? today : utcMidnight(parsedEnd);
      return { start: s, end: addDays(e, 1) };
    }
  }
};

export const getReports = async ({
  workspaceId,
  range,
  startDate,
  endDate,
}: ReportQueryInput): Promise<ReportsData> => {
  const { start, end } = resolveRange(range, startDate, endDate);

  // Single query: every transaction-derived widget is computed from this array.
  const transactions = await prisma.transaction.findMany({
    where: {
      workspaceId,
      deletedAt: null,
      transactionDate: { gte: start, lt: end },
    },
    include: { createdBy: { select: { name: true } } },
    orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
  });

  // Single query: khata balances are current, not date-bounded.
  const khatas = await prisma.khata.findMany({
    where: { workspaceId, deletedAt: null },
    include: {
      entries: { where: { deletedAt: null }, select: { amount: true, type: true } },
    },
  });

  // ── Day buckets (built once, reused by cash flow + trend) ──────────────
  const dayMap = new Map<string, { income: number; expense: number }>();
  for (let cur = start; cur < end; cur = addDays(cur, 1)) {
    dayMap.set(toDateKey(cur), { income: 0, expense: 0 });
  }

  let income = 0;
  let expenses = 0;
  let largestAmount = 0;

  for (const t of transactions) {
    const amt = Number(t.amount);
    const key = toDateKey(new Date(t.transactionDate));
    const bucket = dayMap.get(key) ?? { income: 0, expense: 0 };
    if (t.type === "INCOME") {
      income += amt;
      bucket.income += amt;
    } else {
      expenses += amt;
      bucket.expense += amt;
    }
    if (amt > largestAmount) largestAmount = amt;
    dayMap.set(key, bucket);
  }

  const dayBuckets: DayBucket[] = Array.from(dayMap.entries()).map(([date, v]) => ({
    date,
    income: round(v.income),
    expense: round(v.expense),
    net: round(v.income - v.expense),
  }));

  const daysInRange = dayBuckets.length || 1;
  const count = transactions.length;
  const total = income + expenses;

  let highestIncomeDay: { date: string; amount: number } | null = null;
  let highestExpenseDay: { date: string; amount: number } | null = null;
  for (const b of dayBuckets) {
    if (b.income > 0 && (!highestIncomeDay || b.income > highestIncomeDay.amount)) {
      highestIncomeDay = { date: b.date, amount: round(b.income) };
    }
    if (b.expense > 0 && (!highestExpenseDay || b.expense > highestExpenseDay.amount)) {
      highestExpenseDay = { date: b.date, amount: round(b.expense) };
    }
  }

  const summary = {
    income: round(income),
    expenses: round(expenses),
    netProfit: round(income - expenses),
    transactionCount: count,
    averageTransaction: count ? round(total / count) : 0,
    largestTransaction: round(largestAmount),
  };

  const businessInsights = {
    highestIncomeDay,
    highestExpenseDay,
    averageDailyIncome: round(income / daysInRange),
    averageDailyExpense: round(expenses / daysInRange),
    averageTransactionsPerDay: round(count / daysInRange),
  };

  const incomeExpenseBreakdown = {
    income: round(income),
    expense: round(expenses),
    incomePercent: total ? round((income / total) * 100) : 0,
    expensePercent: total ? round((expenses / total) * 100) : 0,
  };

  const dailyCashFlow = dayBuckets;
  const incomeExpenseTrend = dayBuckets.map(({ date, income: inc, expense: exp }) => ({
    date,
    income: inc,
    expense: exp,
  }));

  const toRow = (t: (typeof transactions)[number]): ReportRow => ({
    id: t.id,
    title: t.title,
    amount: round(Number(t.amount)),
    type: t.type,
    transactionDate: t.transactionDate.toISOString(),
    createdBy: t.createdBy ? { name: t.createdBy.name } : null,
  });

  const byAmountDesc = (
    a: { amount: number; transactionDate: string },
    b: { amount: number; transactionDate: string },
  ) =>
    b.amount - a.amount ||
    new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();

  const rows = transactions.map(toRow);

  const largestExpenses = rows
    .filter((t) => t.type === "EXPENSE")
    .sort(byAmountDesc)
    .slice(0, 5);
  const largestIncome = rows
    .filter((t) => t.type === "INCOME")
    .sort(byAmountDesc)
    .slice(0, 5);
  const recentTransactions = rows;

  // ── Khata summary ──────────────────────────────────────────────────────
  // pending = initialAmount + CREDIT - PAYMENT (mirrors khata.controller).
  let outstandingCredit = 0;
  let collected = 0;
  let pendingCustomers = 0;
  for (const k of khatas) {
    let pending = Number(k.initialAmount);
    for (const e of k.entries) {
      const a = Number(e.amount);
      if (e.type === "CREDIT") pending += a;
      else if (e.type === "PAYMENT") {
        pending -= a;
        collected += a;
      }
    }
    if (pending > 0) {
      outstandingCredit += pending;
      pendingCustomers += 1;
    }
  }

  const khataSummary = {
    outstandingCredit: round(outstandingCredit),
    collected: round(collected),
    pendingCustomers,
    // Schema has no due-date, so true "overdue" cannot be computed. Documented
    // as 0 (not fabricated); a `dueDate` on KhataEntry would enable this.
    overdueAmount: 0,
  };

  return {
    range,
    start: start.toISOString(),
    end: end.toISOString(),
    summary,
    businessInsights,
    incomeExpenseBreakdown,
    dailyCashFlow,
    incomeExpenseTrend,
    largestExpenses,
    largestIncome,
    recentTransactions,
    khataSummary,
  };
};
