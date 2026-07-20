/**
 * KhaataLedger — Production-quality development seed.
 *
 * Populates Owners, Workspaces, Employees, Transactions (3000+), Khata records
 * with entries, and realistic Audit logs. Deterministic: the same `SEED` always
 * produces identical data.
 *
 * Run with:  npx prisma db seed
 * (configured via "prisma.seed" in server/package.json)
 *
 * This script ONLY creates development data. It does not modify application
 * logic or the Prisma schema.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ── Determinism ───────────────────────────────────────────────────────────────
const SEED = 20250701;

// mulberry32 — small, fast, deterministic PRNG.
function makeRng(seed: number) {
  let a = seed >>> 0;
  return function rng(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = makeRng(SEED);

// ── RNG helpers ───────────────────────────────────────────────────────────────
const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => min + rng() * (max - min);
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]!;
const round2 = (n: number) => Math.round(n * 100) / 100;
const moneyStr = (n: number) => round2(n).toFixed(2);
const DAY_MS = 86_400_000;
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY_MS);
const ymd = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));

type Weighted<T> = { item: T; weight: number };
function weightedPick<T>(items: Weighted<T>[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = rng() * total;
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) return it.item;
  }
  return items[items.length - 1]!.item;
}

// ── Time helpers ───────────────────────────────────────────────────────────────
// Random timestamp on a given day (business hours), in UTC.
function atTime(day: Date, hourMin = 8, hourMax = 21): Date {
  const h = randInt(hourMin, hourMax);
  const mi = randInt(0, 59);
  const s = randInt(0, 59);
  return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h, mi, s));
}

// ── Date range (fixed → deterministic) ──────────────────────────────────────────
const START = ymd(2025, 8, 1);
const END = ymd(2026, 7, 20); // ~11.6 months
const TOTAL_DAYS = Math.round((END.getTime() - START.getTime()) / DAY_MS);

// ── Catalogs ───────────────────────────────────────────────────────────────────
interface CatalogItem {
  title: string;
  min: number;
  max: number;
  weight: number;
}

const INCOME_CATALOG: CatalogItem[] = [
  { title: "Sales", min: 200, max: 5000, weight: 22 },
  { title: "Cash Sale", min: 100, max: 3000, weight: 18 },
  { title: "Online Orders", min: 150, max: 8000, weight: 16 },
  { title: "Customer Payment", min: 500, max: 25000, weight: 12 },
  { title: "Bank Transfer", min: 1000, max: 60000, weight: 8 },
  { title: "Wholesale Order", min: 20000, max: 400000, weight: 5 },
  { title: "Consulting", min: 5000, max: 200000, weight: 6 },
  { title: "Membership Fee", min: 500, max: 5000, weight: 6 },
  { title: "Service Charge", min: 200, max: 5000, weight: 5 },
  { title: "Interest Income", min: 100, max: 2000, weight: 2 },
];

const EXPENSE_CATALOG: CatalogItem[] = [
  { title: "Office Supplies", min: 200, max: 4000, weight: 16 },
  { title: "Food", min: 300, max: 4000, weight: 12 },
  { title: "Cleaning", min: 500, max: 3000, weight: 9 },
  { title: "Fuel", min: 800, max: 6000, weight: 11 },
  { title: "Packaging", min: 200, max: 5000, weight: 9 },
  { title: "Electricity", min: 1500, max: 9000, weight: 6 },
  { title: "Internet", min: 800, max: 2500, weight: 5 },
  { title: "Marketing", min: 2000, max: 30000, weight: 7 },
  { title: "Software Subscription", min: 500, max: 12000, weight: 6 },
  { title: "Maintenance", min: 1000, max: 25000, weight: 6 },
  { title: "Travel", min: 1500, max: 30000, weight: 6 },
  { title: "Refund Issued", min: 200, max: 5000, weight: 4 },
  { title: "Taxes", min: 5000, max: 80000, weight: 3 },
  { title: "Salary", min: 40000, max: 45000, weight: 4 },
  { title: "Rent", min: 24000, max: 26000, weight: 4 },
  { title: "Equipment Purchase", min: 15000, max: 250000, weight: 2 },
  { title: "Vehicle Purchase", min: 200000, max: 1200000, weight: 1 },
];

// Per-workspace title weight boosts for a believable business profile.
const PROFILE_BOOSTS: Record<string, Record<string, number>> = {
  "John's Hardware": { Sales: 10, "Customer Payment": 6, "Equipment Purchase": 5, "Service Charge": 4, "Cash Sale": 4 },
  Warehouse: { Maintenance: 8, Fuel: 6, "Equipment Purchase": 6, Packaging: 5, "Office Supplies": 4 },
  "Retail Store": { Sales: 12, "Cash Sale": 8, "Online Orders": 8, "Customer Payment": 6, "Refund Issued": 3 },
  Wholesale: { "Wholesale Order": 14, "Bank Transfer": 8, Consulting: 6, "Customer Payment": 5 },
  Cafe: { Food: 14, Sales: 10, "Cash Sale": 8, "Online Orders": 5, "Office Supplies": 3 },
};

// Build a per-workspace weighted catalog (income + expense with boosts applied).
function buildWorkspaceCatalog(workspaceName: string) {
  const boosts = PROFILE_BOOSTS[workspaceName] ?? {};
  const income = INCOME_CATALOG.map((c) => ({ item: c, weight: c.weight + (boosts[c.title] ?? 0) }));
  const expense = EXPENSE_CATALOG.map((c) => ({ item: c, weight: c.weight + (boosts[c.title] ?? 0) }));
  return { income, expense };
}

function generateAmount(item: CatalogItem): number {
  let amt = randFloat(item.min, item.max);
  // Occasional spike on top of the normal range.
  if (rng() < 0.03) amt = item.max * randFloat(1.5, 2.5);
  return round2(amt);
}

// ── Identity data ──────────────────────────────────────────────────────────────
interface OwnerDef {
  name: string;
  email: string;
  business: string;
}
const OWNERS: OwnerDef[] = [
  { name: "John Doe", email: "john@hardware.com", business: "John's Hardware" },
  { name: "Priya Sharma", email: "priya@sunrisetraders.com", business: "Sunrise Traders" },
];

interface WsDef {
  name: string;
  ownerEmail: string;
  activity: number; // relative busyness
}
const WORKSPACES: WsDef[] = [
  { name: "John's Hardware", ownerEmail: "john@hardware.com", activity: 1.3 },
  { name: "Warehouse", ownerEmail: "john@hardware.com", activity: 0.8 },
  { name: "Retail Store", ownerEmail: "john@hardware.com", activity: 1.4 },
  { name: "Wholesale", ownerEmail: "priya@sunrisetraders.com", activity: 1.1 },
  { name: "Cafe", ownerEmail: "priya@sunrisetraders.com", activity: 1.0 },
];

const EMPLOYEE_NAMES = [
  "Amit Kumar", "Sneha Reddy", "Rahul Verma", "Anjali Nair", "Vikram Singh",
  "Pooja Mehta", "Arjun Pillai", "Neha Gupta", "Karthik Rao", "Divya Iyer",
  "Sandeep Yadav", "Meera Joshi", "Rohan Kapoor", "Lakshmi Nair", "Imran Sheikh",
];

const CUSTOMER_NAMES = [
  "Sharma Traders", "Patel & Sons", "Gupta Enterprises", "Reddy Wholesale",
  "Kumar Stores", "Mehta Mart", "Iyer Distributors", "Nair Agencies",
  "Verma Supplies", "Joshi Retail", "Kapoor & Co", "Sheikh Imports",
  "Bansal Textiles", "Aggarwal Foods", "Chatterjee Hardware", "Das Logistics",
  "Banerjee Electronics", "Chopra Pharma", "Deshmukh Agro", "Gokul Dairy",
  "Hariharan Spices", "Iyengar Books", "Jain Metals", "Khan Builders",
  "Lobo Marine", "Menon Oils", "Nambiar Cement", "Oberoi Hotels",
  "Purohit Sweets", "Qureshi Poultry", "Rao Constructions", "Sinha Auto",
  "Thakur Paints", "Usman Carpets", "Vora Diamonds", "Walia Furniture",
  "Yadav Poultry", "Zaveri Jewels", "Acharya Pipes", "Bhatia Steel",
  "Chawla Chicken", "Dua Pharma", "Easwaran Cables", "Fernandes Wines",
  "Ghosh Cycles", "Hegde Granite", "Indora Rice", "Jha Timber",
];

const KHATA_TITLES = [
  "Credit Account", "Material Supply Credit", "Monthly Credit Line",
  "Vendor Credit", "Pending Invoice", "Running Khata", "Seasonal Credit",
];

// ── Passwords (hashed with the same salt rounds as the app) ─────────────────────
const DEV_PASSWORD = "Password123"; // used for every seeded account

// ── Deterministic self IDs (createMany does not return IDs) ─────────────────────
let idCounter = 0;
const nextId = (prefix: string) => `${prefix}_${(++idCounter).toString().padStart(7, "0")}`;

// ── Snapshot builders (mirror controller shapes for realistic audit logs) ───────
function txnSnapshot(t: any) {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? null,
    amount: t.amountRounded,
    type: t.type,
    transactionDate: t.transactionDate.toISOString(),
    workspaceId: t.workspaceId,
    createdById: t.createdById,
    version: 1,
    deletedAt: t.deletedAt ? t.deletedAt.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.createdAt.toISOString(),
  };
}
function khataSnapshot(k: any) {
  return {
    id: k.id,
    customerName: k.customerName,
    contactNumber: k.contactNumber,
    title: k.title,
    initialAmount: Number(k.initialAmount),
    workspaceId: k.workspaceId,
    createdById: k.createdById,
    createdAt: k.createdAt.toISOString(),
    updatedAt: k.updatedAt.toISOString(),
    deletedAt: k.deletedAt ? k.deletedAt.toISOString() : null,
  };
}

// ── Wipe existing data (idempotent re-runs) ─────────────────────────────────────
async function wipe() {
  console.log("Wiping existing data...");
  await prisma.$transaction([
    prisma.auditLog.deleteMany({}),
    prisma.khataEntry.deleteMany({}),
    prisma.khata.deleteMany({}),
    prisma.transaction.deleteMany({}),
    // Clear employee FK before dropping workspaces (circular FK otherwise).
    prisma.user.updateMany({ data: { workspaceId: null } }),
    prisma.workspace.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);
}

// ── Batched insert helper ───────────────────────────────────────────────────────
async function chunked<T>(data: T[], size: number, fn: (batch: T[]) => Promise<unknown>) {
  for (let i = 0; i < data.length; i += size) {
    await fn(data.slice(i, i + size));
  }
}

// ── Main ────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== KhaataLedger seed (deterministic) ===");
  await wipe();

  // 1) Owners + Employees (hashed passwords)
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 12);
  console.log("Hashing passwords...");

  const ownerEmails = OWNERS.map((o) => o.email);
  await prisma.user.createMany({
    data: OWNERS.map((o) => ({
      name: o.name,
      email: o.email,
      passwordHash,
      role: "OWNER",
      workspaceId: null,
    })),
  });
  const ownerRows = await prisma.user.findMany({
    where: { email: { in: ownerEmails } },
    select: { id: true, email: true },
  });
  const ownerIdByEmail = new Map(ownerRows.map((u) => [u.email, u.id]));

  // 2) Workspaces
  await prisma.workspace.createMany({
    data: WORKSPACES.map((w) => ({
      name: w.name,
      ownerId: ownerIdByEmail.get(w.ownerEmail)!,
    })),
  });
  const wsRows = await prisma.workspace.findMany({
    where: { name: { in: WORKSPACES.map((w) => w.name) } },
    select: { id: true, name: true, ownerId: true },
  });
  const wsByName = new Map(wsRows.map((w) => [w.name, w]));
  const wsNameById = new Map(wsRows.map((w) => [w.id, w.name]));

  // 3) Employees (3 per workspace)
  const employeeData: { name: string; email: string; passwordHash: string; role: "EMPLOYEE"; workspaceId: string; employeeId: string }[] = [];
  let empIdx = 0;
  for (const ws of WORKSPACES) {
    const wsRow = wsByName.get(ws.name)!;
    for (let i = 0; i < 3; i++) {
      const full = EMPLOYEE_NAMES[empIdx % EMPLOYEE_NAMES.length]!;
      const [first, last] = full.split(" ");
      const email = `${first!.toLowerCase()}.${last!.toLowerCase()}@khaata.dev`;
      employeeData.push({
        name: full,
        email,
        passwordHash,
        role: "EMPLOYEE",
        workspaceId: wsRow.id,
        employeeId: `EMP${(empIdx + 1).toString().padStart(4, "0")}`,
      });
      empIdx++;
    }
  }
  await prisma.user.createMany({ data: employeeData });
  const empRows = await prisma.user.findMany({
    where: { email: { in: employeeData.map((e) => e.email) } },
    select: { id: true, workspaceId: true, email: true },
  });

  // Creator pools per workspace: [owner, ...employees]
  const creatorsByWs: Record<string, string[]> = {};
  for (const ws of WORKSPACES) {
    const wsRow = wsByName.get(ws.name)!;
    const emps = empRows.filter((e) => e.workspaceId === wsRow.id).map((e) => e.id);
    creatorsByWs[wsRow.id] = [wsRow.ownerId, ...emps];
  }
  const pickCreator = (wsId: string): string => {
    const pool = creatorsByWs[wsId]!;
    if (rng() < 0.8 && pool.length > 1) return pick(pool.slice(1)); // usually an employee
    return pool[0]!; // sometimes the owner
  };

  // Workspace activity weights for distributing random transactions
  const wsActivity = WORKSPACES.map((w) => ({ item: wsByName.get(w.name)!.id, weight: w.activity }));
  const wsCatalogs = new Map<string, ReturnType<typeof buildWorkspaceCatalog>>();
  for (const ws of WORKSPACES) {
    wsCatalogs.set(wsByName.get(ws.name)!.id, buildWorkspaceCatalog(ws.name));
  }

  // 4) Transactions
  interface TxnSeed {
    id: string;
    workspaceId: string;
    title: string;
    description: string | null;
    amount: string;
    amountRounded: number;
    type: "INCOME" | "EXPENSE";
    transactionDate: Date;
    createdById: string;
    createdAt: Date;
    deletedAt: Date | null;
  }
  const txns: TxnSeed[] = [];
  const audits: any[] = [];

  const makeTxn = (
    wsId: string,
    title: string,
    amount: number,
    type: "INCOME" | "EXPENSE",
    date: Date,
    createdById: string,
    description: string | null = null,
    softDelete = false,
  ): TxnSeed => {
    const id = nextId("txn");
    const createdAt = addDays(date, 0);
    const deletedAt = softDelete
      ? new Date(Math.min(addDays(date, randInt(1, 40)).getTime(), END.getTime()))
      : null;
    const t: TxnSeed = {
      id,
      workspaceId: wsId,
      title,
      description,
      amount: moneyStr(amount),
      amountRounded: round2(amount),
      type,
      transactionDate: date,
      createdById,
      createdAt,
      deletedAt,
    };
    txns.push(t);
    // CREATE audit
    audits.push({
      id: nextId("aud"),
      workspaceId: wsId,
      action: "CREATE",
      transactionId: id,
      userId: createdById,
      previousValue: undefined,
      newValue: txnSnapshot(t),
      createdAt: createdAt.toISOString(),
    });
    if (softDelete) {
      // DELETE audit (mirrors controller behaviour)
      audits.push({
        id: nextId("aud"),
        workspaceId: wsId,
        action: "DELETE",
        transactionId: id,
        userId: createdById,
        previousValue: txnSnapshot(t),
        newValue: txnSnapshot({ ...t, deletedAt: deletedAt ?? t.deletedAt }),
        createdAt: (deletedAt ?? createdAt).toISOString(),
      });
    }
    return t;
  };

  // 4a) Monthly recurring (salary, rent, utilities, periodic large income)
  console.log("Generating monthly recurring transactions...");
  {
    let cur = new Date(START);
    while (cur <= END) {
      const y = cur.getUTCFullYear();
      const m = cur.getUTCMonth();
      const monthStart = new Date(Date.UTC(y, m, 1));
      if (monthStart > END) break;
      for (const ws of WORKSPACES) {
        const wsRow = wsByName.get(ws.name)!;
        const ownerId = wsRow.ownerId;
        // Salary (day 1) — payroll run by owner
        if (monthStart <= END) {
          const empCount = empRows.filter((e) => e.workspaceId === wsRow.id).length;
          for (let i = 0; i < empCount; i++) {
            makeTxn(wsRow.id, "Salary", 42000, "EXPENSE", atTime(monthStart, 9, 11), ownerId, "Monthly payroll");
          }
        }
        // Rent (day 1)
        if (monthStart <= END) {
          makeTxn(wsRow.id, "Rent", 25000, "EXPENSE", atTime(monthStart, 8, 10), ownerId, `${ws.name} premises rent`);
        }
        // Electricity (day 5)
        const elecDay = new Date(Date.UTC(y, m, 5));
        if (elecDay <= END) makeTxn(wsRow.id, "Electricity", randFloat(1500, 9000), "EXPENSE", atTime(elecDay), pickCreator(wsRow.id));
        // Internet (day 7)
        const netDay = new Date(Date.UTC(y, m, 7));
        if (netDay <= END) makeTxn(wsRow.id, "Internet", randFloat(800, 2500), "EXPENSE", atTime(netDay), pickCreator(wsRow.id));
        // Wholesale/Consulting big income (~60% of months, esp. wholesale ws)
        if (rng() < (ws.name === "Wholesale" ? 0.85 : 0.5)) {
          const bigDay = new Date(Date.UTC(y, m, randInt(12, 25)));
          if (bigDay <= END) {
            const title = ws.name === "Wholesale" ? "Wholesale Order" : pick(["Consulting", "Wholesale Order", "Bank Transfer"]);
            makeTxn(wsRow.id, title, randFloat(30000, 350000), "INCOME", atTime(bigDay, 10, 17), pickCreator(wsRow.id), "Bulk deal");
          }
        }
      }
      cur = new Date(Date.UTC(y, m + 1, 1));
    }
  }

  // 4b) Day-by-day random transactions (with weekday / month-end / spike patterns)
  console.log("Generating daily random transactions...");
  {
    const totalDays = TOTAL_DAYS;
    for (let d = 0; d <= totalDays; d++) {
      const day = new Date(START.getTime() + d * DAY_MS);
      let count = 9;
      const dow = day.getUTCDay();
      if (dow === 0) count = Math.round(count * 0.55); // Sunday lower
      else if (dow === 6) count = Math.round(count * 0.7); // Saturday lower
      const dom = day.getUTCDate();
      if (dom >= 27) count = Math.round(count * 1.4); // month-end higher
      if (rng() < 0.02) count = Math.round(count * randFloat(2, 3)); // occasional spike day
      if (count <= 0) count = 1;

      for (let i = 0; i < count; i++) {
        const wsId = weightedPick(wsActivity);
        const cat = wsCatalogs.get(wsId)!;
        const isIncome = rng() < 0.55;
        const item = isIncome ? weightedPick(cat.income) : weightedPick(cat.expense);
        const amount = generateAmount(item);
        const date = atTime(day);
        const creator = pickCreator(wsId);
        const softDelete = rng() < 0.03; // 2–5% soft-deleted
        const desc = rng() < 0.3 ? `${item.title} — ${wsNameById.get(wsId) ?? ""}` : null;
        makeTxn(wsId, item.title, amount, isIncome ? "INCOME" : "EXPENSE", date, creator, desc, softDelete);
      }
    }
  }

  console.log(`Inserting ${txns.length} transactions...`);
  await chunked(txns, 1000, (batch) =>
    prisma.transaction.createMany({
      data: batch.map((t) => ({
        id: t.id,
        workspaceId: t.workspaceId,
        title: t.title,
        description: t.description,
        amount: t.amount,
        type: t.type,
        transactionDate: t.transactionDate,
        createdById: t.createdById,
        createdAt: t.createdAt,
        deletedAt: t.deletedAt,
      })),
    }),
  );
  console.log(`Inserting ${audits.length} transaction audit logs...`);
  await chunked(audits, 1000, (batch) => prisma.auditLog.createMany({ data: batch }));

  // 5) Khata records + entries
  console.log("Generating khata records...");
  const khataSeeds: any[] = [];
  const khataEntrySeeds: any[] = [];
  const khataAudits: any[] = [];
  let softDeleteKhataLeft = 3;

  for (const ws of WORKSPACES) {
    const wsRow = wsByName.get(ws.name)!;
    // Pick distinct customers for this workspace.
    const shuffled = [...CUSTOMER_NAMES];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    const nCustomers = randInt(7, 10);
    const chosen = shuffled.slice(0, nCustomers);

    for (const customer of chosen) {
      const id = nextId("khata");
      const initialAmount = round2(randFloat(5000, 120000));
      const createdAt = atTime(addDays(START, randInt(0, TOTAL_DAYS - 30)));
      const createdById = wsRow.ownerId;
      const status = weightedPick<"outstanding" | "partial" | "paid">([
        { item: "outstanding", weight: 40 },
        { item: "partial", weight: 35 },
        { item: "paid", weight: 25 },
      ]);

      // Build credit/payment entries.
      const creditEntries: { amount: number; date: Date }[] = [];
      const paymentEntries: { amount: number; date: Date }[] = [];
      const nCredit = status === "outstanding" ? randInt(0, 2) : 1;
      for (let i = 0; i < nCredit; i++) {
        creditEntries.push({ amount: round2(randFloat(2000, 40000)), date: atTime(addDays(createdAt, randInt(1, 60))) });
      }
      const totalCredit = initialAmount + creditEntries.reduce((s, e) => s + e.amount, 0);
      if (status !== "outstanding") {
        const ratio = status === "paid" ? randFloat(1.0, 1.08) : randFloat(0.3, 0.8);
        let remaining = round2(totalCredit * ratio);
        const nPay = randInt(1, 2);
        for (let i = 0; i < nPay; i++) {
          const amt = i === nPay - 1 ? remaining : round2(remaining / nPay);
          remaining = round2(remaining - amt);
          if (amt > 0) paymentEntries.push({ amount: amt, date: atTime(addDays(createdAt, randInt(60, 150))) });
        }
      }

      const allEntries = [...creditEntries, ...paymentEntries].sort((a, b) => a.date.getTime() - b.date.getTime());
      const updatedAt = allEntries.length ? allEntries[allEntries.length - 1]!.date : createdAt;
      const softDelete = softDeleteKhataLeft > 0;
      if (softDelete) softDeleteKhataLeft--;
      const deletedAt = softDelete ? new Date(Math.min(addDays(createdAt, randInt(20, 80)).getTime(), END.getTime())) : null;

      const seed = {
        id,
        workspaceId: wsRow.id,
        customerName: customer,
        contactNumber: `9${randInt(100000000, 999999999)}`,
        title: pick(KHATA_TITLES),
        initialAmount: moneyStr(initialAmount),
        createdById,
        createdAt,
        updatedAt,
        deletedAt,
      };
      khataSeeds.push(seed);

      for (const e of allEntries) {
        khataEntrySeeds.push({
          id: nextId("khe"),
          khataId: id,
          title: creditEntries.includes(e) ? pick(["Credit Added", "Additional Credit", "Purchase on Credit"]) : pick(["Payment Received", "Part Payment", "Settlement"]),
          amount: moneyStr(e.amount),
          type: creditEntries.includes(e) ? "CREDIT" : "PAYMENT",
          entryDate: e.date,
          createdById: pickCreator(wsRow.id),
        });
      }

      // Khata audits: CREATE always; UPDATE when it has entries; DELETE when soft-deleted.
      khataAudits.push({
        id: nextId("aud"),
        workspaceId: wsRow.id,
        action: "CREATE",
        khataId: id,
        userId: createdById,
        previousValue: undefined,
        newValue: khataSnapshot(seed),
        createdAt: createdAt.toISOString(),
      });
      if (allEntries.length) {
        khataAudits.push({
          id: nextId("aud"),
          workspaceId: wsRow.id,
          action: "UPDATE",
          khataId: id,
          userId: createdById,
          previousValue: khataSnapshot(seed),
          newValue: khataSnapshot({ ...seed, updatedAt }),
          createdAt: updatedAt.toISOString(),
        });
      }
      if (softDelete) {
        khataAudits.push({
          id: nextId("aud"),
          workspaceId: wsRow.id,
          action: "DELETE",
          khataId: id,
          userId: createdById,
          previousValue: khataSnapshot(seed),
          newValue: undefined,
          createdAt: (deletedAt ?? createdAt).toISOString(),
        });
      }
    }
  }

  console.log(`Inserting ${khataSeeds.length} khatas...`);
  await chunked(khataSeeds, 500, (batch) => prisma.khata.createMany({ data: batch }));
  console.log(`Inserting ${khataEntrySeeds.length} khata entries...`);
  await chunked(khataEntrySeeds, 500, (batch) => prisma.khataEntry.createMany({ data: batch }));
  console.log(`Inserting ${khataAudits.length} khata audit logs...`);
  await chunked(khataAudits, 500, (batch) => prisma.auditLog.createMany({ data: batch }));

  // 6) Summary
  const [nOwners, nWs, nEmp, nTxn, nTxnDeleted, nKhata, nEntries, nAudit] = await Promise.all([
    prisma.user.count({ where: { role: "OWNER" } }),
    prisma.workspace.count(),
    prisma.user.count({ where: { role: "EMPLOYEE" } }),
    prisma.transaction.count(),
    prisma.transaction.count({ where: { deletedAt: { not: null } } }),
    prisma.khata.count(),
    prisma.khataEntry.count(),
    prisma.auditLog.count(),
  ]);

  console.log("=== Seed complete ===");
  console.log(`Owners: ${nOwners} | Workspaces: ${nWs} | Employees: ${nEmp}`);
  console.log(`Transactions: ${nTxn} (soft-deleted: ${nTxnDeleted})`);
  console.log(`Khatas: ${nKhata} | Khata entries: ${nEntries} | Audit logs: ${nAudit}`);
  console.log("");
  console.log("Login credentials (dev):");
  console.log(`  Password for ALL accounts: ${DEV_PASSWORD}`);
  for (const o of OWNERS) console.log(`  Owner  — ${o.name} <${o.email}>`);
  for (const e of employeeData) console.log(`  Employee (${e.employeeId}) — ${e.name} <${e.email}>`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
