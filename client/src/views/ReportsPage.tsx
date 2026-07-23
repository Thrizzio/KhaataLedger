"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PeopleIcon from "@mui/icons-material/People";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageShell } from "./PageShell";
import { reportsService } from "../services/reports.service";
import type { ReportRange, ReportsData, ReportRow } from "../types/report";

interface ReportsPageProps {
  workspaceId: string;
}

const RANGE_OPTIONS: { value: ReportRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "thisWeek", label: "This Week" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "last3Months", label: "Last 3 Months" },
  { value: "thisYear", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatAmount0 = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const fmtKey = (key: string) => {
  const d = new Date(key);
  return Number.isNaN(d.getTime()) ? key : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const cardSx = {
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
  bgcolor: "background.paper",
  display: "flex",
  flexDirection: "column",
  height: "100%",
};

const PIE_COLORS = { income: "#16a34a", expense: "#dc2626" };

function KpiCard({
  label,
  value,
  icon,
  avatarBg,
  avatarColor,
  valueColor,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  avatarBg: string;
  avatarColor: string;
  valueColor: string;
}) {
  return (
    <Card elevation={0} sx={cardSx}>
      <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", flexGrow: 1, "&:last-child": { pb: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexGrow={1}>
          <Box>
            <Typography
              color="text.secondary"
              variant="caption"
              fontWeight={600}
              sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={700} color={valueColor} sx={{ mt: 1, letterSpacing: -0.5 }}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ width: 48, height: 48, bgcolor: avatarBg, color: avatarColor, borderRadius: 2 }}>{icon}</Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card elevation={0} sx={cardSx}>
      <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", flexGrow: 1, "&:last-child": { pb: 3 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: -0.2 }}>
            {title}
          </Typography>
        </Stack>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Box py={6} textAlign="center" sx={{ bgcolor: "background.default", borderRadius: 2, border: "1px dashed", borderColor: "divider" }}>
      <Typography color="text.secondary" variant="body2" fontWeight={500}>
        {message}
      </Typography>
    </Box>
  );
}

function TxTable({ rows }: { rows: ReportRow[] }) {
  if (rows.length === 0) return <EmptyState message="No transactions found." />;
  return (
    <TableContainer sx={{ maxHeight: 420 }}>
      <Table 
        size="medium" 
        stickyHeader 
        sx={{
          "& .MuiTableCell-root": { py: 2, borderBottom: "1px solid", borderColor: "divider" },
          "& .MuiTableHead-root .MuiTableCell-root": { fontWeight: 600, color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: 0.5, bgcolor: "background.default" }
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Created By</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
              <TableCell sx={{ maxWidth: 220, fontWeight: 500, color: "text.primary" }}>{r.title}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: r.type === "INCOME" ? "success.main" : "error.main" }}>
                {r.type === "INCOME" ? "+" : "-"}
                {formatAmount(r.amount)}
              </TableCell>
              <TableCell>
                <Box
                  component="span"
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    bgcolor: r.type === "INCOME" ? "success.light" : "error.light",
                    color: r.type === "INCOME" ? "success.dark" : "error.dark",
                  }}
                >
                  {r.type === "INCOME" ? "Income" : "Expense"}
                </Box>
              </TableCell>
              <TableCell sx={{ color: "text.secondary" }}>{fmtDate(r.transactionDate)}</TableCell>
              <TableCell sx={{ color: "text.secondary" }}>{r.createdBy?.name ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function buildCsv(data: ReportsData): string {
  const header = ["Title", "Type", "Amount", "Date", "Created By"];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = data.recentTransactions.map((r) =>
    [r.title, r.type, String(r.amount), r.transactionDate, r.createdBy?.name ?? ""].map(escape).join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export const ReportsPage = ({ workspaceId }: ReportsPageProps) => {
  const [range, setRange] = useState<ReportRange>("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading, isError } = useQuery<ReportsData>({
    queryKey: ["reports", workspaceId, range, startDate, endDate],
    queryFn: () =>
      reportsService
        .getReports(
          workspaceId,
          range,
          range === "custom" ? startDate : undefined,
          range === "custom" ? endDate : undefined,
        )
        .then((r) => r.data.data as ReportsData),
    enabled: Boolean(workspaceId),
  });

  const handleExportCsv = () => {
    if (!data) return;
    const blob = new Blob([buildCsv(data)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports-${range}-${workspaceId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const kpiCards = data
    ? [
        { label: "Income", value: formatAmount0(data.summary.income), icon: <TrendingUpIcon />, avatarBg: "success.light", avatarColor: "success.main", valueColor: "success.main" },
        { label: "Expenses", value: formatAmount0(data.summary.expenses), icon: <TrendingDownIcon />, avatarBg: "error.light", avatarColor: "error.main", valueColor: "error.main" },
        { label: "Net Profit", value: formatAmount0(data.summary.netProfit), icon: <AccountBalanceWalletIcon />, avatarBg: "primary.light", avatarColor: "primary.main", valueColor: data.summary.netProfit < 0 ? "error.main" : "text.primary" },
        { label: "Transactions", value: String(data.summary.transactionCount), icon: <ReceiptLongIcon />, avatarBg: "secondary.light", avatarColor: "secondary.main", valueColor: "text.primary" },
        { label: "Avg Transaction", value: formatAmount0(data.summary.averageTransaction), icon: <ShowChartIcon />, avatarBg: "info.light", avatarColor: "info.main", valueColor: "text.primary" },
        { label: "Largest Transaction", value: formatAmount0(data.summary.largestTransaction), icon: <LeaderboardIcon />, avatarBg: "warning.light", avatarColor: "warning.main", valueColor: "text.primary" },
      ]
    : [];

  const insightItems = data
    ? [
        { label: "Highest Income Day", value: data.businessInsights.highestIncomeDay ? `${fmtKey(data.businessInsights.highestIncomeDay.date)} · ${formatAmount(data.businessInsights.highestIncomeDay.amount)}` : "Not enough data" },
        { label: "Highest Expense Day", value: data.businessInsights.highestExpenseDay ? `${fmtKey(data.businessInsights.highestExpenseDay.date)} · ${formatAmount(data.businessInsights.highestExpenseDay.amount)}` : "Not enough data" },
        { label: "Avg Daily Income", value: formatAmount(data.businessInsights.averageDailyIncome) },
        { label: "Avg Daily Expense", value: formatAmount(data.businessInsights.averageDailyExpense) },
        { label: "Avg Txns / Day", value: String(data.businessInsights.averageTransactionsPerDay) },
      ]
    : [];

  return (
    <PageShell title="Reports" workspaceId={workspaceId}>
      <Stack spacing={4} sx={{ pb: 4 }}>
        {/* ── Filters ─────────────────────────────────────── */}
        <Paper elevation={0} variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: "background.paper", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="range-label">Range</InputLabel>
              <Select
                labelId="range-label"
                label="Range"
                value={range}
                onChange={(e) => setRange(e.target.value as ReportRange)}
                sx={{ borderRadius: 2 }}
              >
                {RANGE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {range === "custom" && (
              <>
                <TextField
                  label="Start Date"
                  type="date"
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  size="small"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </>
            )}

            <Box sx={{ ml: { sm: "auto" } }}>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  disabled={!data || data.recentTransactions.length === 0}
                  onClick={handleExportCsv}
                  sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
                >
                  Export CSV
                </Button>
                <Button variant="outlined" startIcon={<PictureAsPdfIcon />} disabled sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}>
                  Export PDF (Coming Soon)
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>

        {isLoading && (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Paper elevation={0} variant="outlined" sx={{ p: 6, borderRadius: 3, bgcolor: "error.light" }}>
            <Typography color="error.dark" textAlign="center" fontWeight={600}>
              Failed to load reports. Please try again.
            </Typography>
          </Paper>
        )}

        {data && (
          <>
            {/* ── Financial Summary ───────────────────────── */}
            <Grid container spacing={3}>
              {kpiCards.map((c) => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={c.label}>
                  <KpiCard {...c} />
                </Grid>
              ))}
            </Grid>

            {/* ── Business Insights ───────────────────────── */}
            <SectionCard title="Business Insights" icon={<ShowChartIcon color="primary" />}>
              <Grid container spacing={3}>
                {insightItems.map((it) => (
                  <Grid item xs={12} sm={6} md={2.4} key={it.label}>
                    <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: "background.default", border: "1px solid", borderColor: "divider", height: "100%" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block" }}>
                        {it.label}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1, color: "text.primary", letterSpacing: -0.3 }}>
                        {it.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </SectionCard>

            {/* ── Daily Cash Flow ──────────────────────────── */}
            <SectionCard title="Daily Cash Flow" icon={<ShowChartIcon color="primary" />}>
              {data.dailyCashFlow.some((d) => d.net !== 0) ? (
                <Box height={350} sx={{ width: "100%", mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.dailyCashFlow} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="date" tickFormatter={fmtKey} fontSize={12} tickLine={false} axisLine={false} tickMargin={12} />
                      <YAxis tickFormatter={(v: number) => formatAmount0(v)} fontSize={12} width={80} tickLine={false} axisLine={false} tickMargin={12} />
                      <Tooltip formatter={(v: number) => formatAmount(v)} labelFormatter={(l) => fmtKey(String(l))} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Line type="monotone" dataKey="net" name="Net" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <EmptyState message="No transactions found." />
              )}
            </SectionCard>

            {/* ── Income & Expense Trend ───────────────────── */}
            <SectionCard title="Income & Expense Trend" icon={<LeaderboardIcon color="primary" />}>
              {data.incomeExpenseTrend.some((d) => d.income !== 0 || d.expense !== 0) ? (
                <Box height={350} sx={{ width: "100%", mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.incomeExpenseTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="date" tickFormatter={fmtKey} fontSize={12} tickLine={false} axisLine={false} tickMargin={12} />
                      <YAxis tickFormatter={(v: number) => formatAmount0(v)} fontSize={12} width={80} tickLine={false} axisLine={false} tickMargin={12} />
                      <Tooltip formatter={(v: number) => formatAmount(v)} labelFormatter={(l) => fmtKey(String(l))} cursor={{ fill: '#f1f5f9' }} />
                      <Legend wrapperStyle={{ paddingTop: 20 }} />
                      <Bar dataKey="income" name="Income" fill={PIE_COLORS.income} radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="expense" name="Expense" fill={PIE_COLORS.expense} radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <EmptyState message="No transactions found." />
              )}
            </SectionCard>

            {/* ── Largest Expenses / Income ────────────────── */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <SectionCard title="Largest Expenses" icon={<TrendingDownIcon color="error" />}>
                  <TxTable rows={data.largestExpenses} />
                </SectionCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <SectionCard title="Largest Income" icon={<TrendingUpIcon color="success" />}>
                  <TxTable rows={data.largestIncome} />
                </SectionCard>
              </Grid>
            </Grid>

            {/* ── Recent Transactions ─────────────────────── */}
            <SectionCard title="Recent Transactions" icon={<ReceiptLongIcon color="primary" />}>
              <TxTable rows={data.recentTransactions} />
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {data.recentTransactions.length} transaction(s) in the selected range.
                </Typography>
              </Box>
            </SectionCard>

            {/* ── Khata Summary ────────────────────────────── */}
            <SectionCard title="Khata Summary" icon={<PeopleIcon color="primary" />}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} lg={3}>
                  <KpiCard label="Outstanding Credit" value={formatAmount0(data.khataSummary.outstandingCredit)} icon={<TrendingUpIcon />} avatarBg="warning.light" avatarColor="warning.main" valueColor="warning.main" />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <KpiCard label="Collected" value={formatAmount0(data.khataSummary.collected)} icon={<AccountBalanceWalletIcon />} avatarBg="success.light" avatarColor="success.main" valueColor="success.main" />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <KpiCard label="Pending Customers" value={String(data.khataSummary.pendingCustomers)} icon={<PeopleIcon />} avatarBg="secondary.light" avatarColor="secondary.main" valueColor="text.primary" />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <KpiCard label="Overdue Amount" value={formatAmount0(data.khataSummary.overdueAmount)} icon={<TrendingDownIcon />} avatarBg="error.light" avatarColor="error.main" valueColor="error.main" />
                </Grid>
              </Grid>
              <Box mt={3}>
                <Typography variant="caption" color="text.secondary">
                  Overdue Amount requires a due-date field on khata entries, which the current schema does not include; shown as 0 until that is added.
                </Typography>
              </Box>
            </SectionCard>
          </>
        )}
      </Stack>
    </PageShell>
  );
};
