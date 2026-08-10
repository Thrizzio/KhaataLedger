# KhaataLedger — Low-Level Design (LLD)

**Version:** 1.0
**Scope:** Prototype / V1

---

## 1. Purpose

This document describes how the main KhaataLedger features are implemented at code and database level.

The design intentionally stays simple and follows the existing modular-monolith architecture.

---

## 2. Backend Structure

```text
server/src/
├── controllers/
├── routes/
├── services/
├── middleware/
├── validators/
├── prisma/
└── server.ts
```

### Request Flow

```text
HTTP Request
    ↓
Route
    ↓
Auth Middleware
    ↓
Permission Middleware
    ↓
Controller
    ↓
Service / Prisma
    ↓
PostgreSQL
    ↓
Response
```

Controllers handle HTTP concerns; reusable business logic belongs in services.

---

## 3. Frontend Structure

```text
client/src/
├── app/
├── features/
│   ├── customers/
│   ├── suppliers/
│   ├── inventory/
│   ├── sales/
│   ├── purchases/
│   └── reports/
├── shared/
├── hooks/
├── services/
└── providers/
```

Each feature contains its own UI, API functions, hooks, and types where appropriate.

App Router pages should remain thin and delegate functionality to feature components.

---

## 4. Database Design

PostgreSQL stores the application's persistent data through Prisma.

Core entities include:

```text
Workspace
 ├── User / Employee
 ├── Customer
 ├── Supplier
 ├── InventoryItem
 ├── Sale
 │    └── SaleLineItem
 ├── Purchase
 │    └── PurchaseLineItem
 ├── CustomerPayment
 ├── SupplierPayment
 └── AuditLog
```

Most business entities contain a `workspaceId` or are reachable through the workspace relationship.

This ensures business data remains isolated between workspaces.

---

## 5. Core Transaction Logic

### Sale

When a sale is recorded:

```text
Validate request
      ↓
Verify permission
      ↓
Verify customer/product
      ↓
Create Sale
      ↓
Create SaleLineItems
      ↓
Update inventory
      ↓
Update customer balance if credit
      ↓
Commit transaction
```

These operations should be performed inside a database transaction when multiple records must remain consistent.

---

### Purchase

```text
Validate request
      ↓
Verify permission
      ↓
Verify supplier/product
      ↓
Create Purchase
      ↓
Create PurchaseLineItems
      ↓
Update inventory
      ↓
Update supplier balance if required
      ↓
Commit transaction
```

---

## 6. Authentication

Authentication middleware extracts and validates the user's authentication information.

The resulting authenticated user is attached to the request context.

Protected controllers use that identity to determine:

* User
* Role
* Workspace
* Permissions

Unauthenticated requests return:

```text
401 Unauthorized
```

---

## 7. Authorization / RBAC

Authorization is capability-based.

Example:

```text
INVENTORY_VIEW
INVENTORY_CREATE
INVENTORY_EDIT
INVENTORY_DELETE
```

The permission check follows:

```text
Request
  ↓
Authenticated User
  ↓
Owner?
 ├── Yes → Allow
 └── No
       ↓
Check capability
       ↓
Allow / 403
```

The frontend may hide unauthorized UI actions, but the backend performs the actual security check.

---

## 8. Validation

API input is validated using Zod before business logic executes.

Example:

```text
HTTP Body
   ↓
Zod Schema
   ↓
Valid?
 ├── No → 400
 └── Yes → Controller
```

Validation prevents malformed input from reaching database operations.

---

## 9. Reports Implementation

Reports are generated dynamically from existing database records.

The main endpoint is conceptually:

```text
GET /api/workspaces/:workspaceId/reports?period=today
```

Supported periods:

```text
today
week
month
```

The controller calculates the date range and aggregates the required records.

The response contains:

```text
reports
├── sales
├── inventory
├── customers
├── suppliers
├── purchases
├── profitability
└── cashFlow
```

No separate report database is required for V1.

---

## 10. Report Calculations

Reports reuse existing business data.

### Sales

Uses:

* Sale
* SaleLineItem
* Customer

Calculates revenue, sales count, averages, growth, and product/customer rankings.

### Inventory

Uses:

* InventoryItem

Calculates stock levels, inventory value, low-stock products, and out-of-stock products.

### Customers

Uses:

* Customer
* Sales
* Customer payments where required

Calculates outstanding balances and customer activity.

### Suppliers

Uses:

* Supplier
* Purchases
* Supplier payments where required

Calculates outstanding dues and supplier activity.

### Purchases

Uses:

* Purchase
* PurchaseLineItem

Calculates purchase totals, item quantities, and purchase rankings.

### Cash Flow

Combines:

* Cash sales
* Customer payments
* Cash purchases
* Supplier payments

to calculate:

```text
Cash Inflow
- Cash Outflow
= Net Cash Flow
```

### Profitability

Uses sales revenue and purchase costs to provide an estimated gross-profit view.

---

## 11. Frontend Data Fetching

Reports use TanStack React Query.

```text
ReportsPage
    ↓
useReports()
    ↓
reportsApi
    ↓
GET /reports
    ↓
React Query Cache
    ↓
Report Components
```

Query keys include the workspace and reporting period:

```text
['reports', workspaceId, period]
```

Changing the period therefore retrieves the corresponding report.

---

## 12. AI Summary

The AI layer is isolated in:

```text
server/src/services/aiSummary.service.ts
```

Flow:

```text
Report Controller
      ↓
Calculated Report Object
      ↓
AI Summary Service
      ↓
Gemini Flash
      ↓
Structured JSON
      ↓
Reports Response
```

The AI does not query PostgreSQL.

It only receives already-calculated report information.

If AI generation fails:

```text
AI Error
   ↓
aiSummary = null
   ↓
Reports still returned
```

The core application therefore does not depend on the AI service being available.

---

## 13. API Response Pattern

Successful responses contain the requested resource/data.

Errors use appropriate HTTP status codes:

```text
400 → Invalid input
401 → Not authenticated
403 → Permission denied
404 → Resource not found
500 → Server error
```

The frontend converts these into appropriate UI states.

---

## AI API and Structured Output

`aiSummary.service.ts` is responsible for communicating with the Gemini API.

Flow:

Report Controller
    ↓
Calculated Report Data
    ↓
Prompt
    ↓
Gemini API
    ↓
Structured AI Response
    ↓
Reports API Response

The prompt explicitly instructs the model to use only the supplied metrics and return the expected fields: summary, highlights, warnings, and recommendations.

The Gemini API key is read from `GEMINI_API_KEY` in the server environment and is never exposed to the frontend.

## REST API

Reports are accessed through:

GET /api/workspaces/:workspaceId/reports?period={today|week|month}

The frontend retrieves this data asynchronously using React Query.

## Git Workflow

Each feature is developed on a separate Git branch, committed in small logical changes, and submitted through a Pull Request before merging into the main development branch.

---

## Client-Side Routing

Next.js App Router provides client-side navigation between application pages such as Dashboard, Sales, Inventory, and Reports without requiring full page reloads.

--

## SQL JOINs

The PostgreSQL schema uses relational associations between entities such as Sales, Customers, SaleLineItems, Products, Purchases, and Suppliers. Prisma resolves these relationships using relational queries equivalent to SQL JOIN operations, allowing related records to be retrieved together.

---

## 14. Important Design Rules

### Workspace Isolation

Every database query involving business data must be scoped to the current workspace.

### Backend Authorization

Never rely solely on frontend permission checks.

### Transactions

Use database transactions whenever one operation changes multiple related records.

### AI Isolation

AI is an optional analysis layer, not a source of truth.

### Feature Isolation

New functionality should be added to the relevant feature rather than creating unrelated global code.

---

## 15. Prototype Scope

The LLD intentionally does **not** introduce:

* Microservices
* Event buses
* CQRS
* Message queues
* Redis
* Separate analytics databases
* Complex caching infrastructure
* Distributed workers

For the current prototype, a **Next.js frontend + Express backend + Prisma + PostgreSQL modular monolith** is sufficient and easier to maintain.
