````md
# KhaataLedger — High-Level Design (HLD)

**Version:** 1.0  
**Scope:** Prototype / V1

---

## 1. System Overview

KhaataLedger is a web-based business management system for small businesses.

The system follows a **client-server architecture**:

```text
┌──────────────────────────────┐
│          Next.js Client      │
│       React + Material UI    │
└──────────────┬───────────────┘
               │ HTTP / REST API
               ▼
┌──────────────────────────────┐
│       Express.js Server      │
│ Controllers / Services /     │
│ Middleware / Validation      │
└──────────────┬───────────────┘
               │ Prisma ORM
               ▼
┌──────────────────────────────┐
│       PostgreSQL Database    │
│       Business Data          │
└──────────────────────────────┘

               │
               ▼
        ┌───────────────┐
        │ Gemini Flash  │
        │ AI Summary    │
        └───────────────┘
````

---

## 2. Technology Stack

| Layer                 | Technology                     |
| --------------------- | ------------------------------ |
| Frontend              | Next.js + React + TypeScript   |
| UI                    | Material UI                    |
| State / Data Fetching | TanStack React Query           |
| HTTP                  | Axios                          |
| Backend               | Node.js + Express + TypeScript |
| Validation            | Zod                            |
| ORM                   | Prisma                         |
| Database              | PostgreSQL                     |
| Authentication        | Token-based authentication     |
| AI                    | Google Gemini Flash            |
| Build / Deployment    | Node.js-based deployment       |

---

## 3. Frontend Architecture

The frontend uses the Next.js App Router.

```text
client/
├── app/
│   ├── login/
│   ├── workspaces/
│   └── ...
│
├── features/
│   ├── dashboard/
│   ├── customers/
│   ├── suppliers/
│   ├── inventory/
│   ├── sales/
│   ├── purchases/
│   ├── reports/
│   └── ...
│
├── shared/
├── hooks/
├── services/
└── providers/
```

### Design Principle

App Router pages remain relatively thin.

Business-specific UI and logic are placed inside feature modules.

Each feature can contain:

* Components
* API functions
* Hooks
* Types
* Feature-specific logic

---

## 4. Backend Architecture

The backend follows a layered Express architecture.

```text
Request
   ↓
Route
   ↓
Authentication / Authorization Middleware
   ↓
Controller
   ↓
Service / Business Logic
   ↓
Prisma
   ↓
PostgreSQL
```

### Main Backend Responsibilities

**Routes**

* Define API endpoints.

**Middleware**

* Authentication
* Authorization
* Request processing

**Controllers**

* Validate requests.
* Execute business operations.
* Return API responses.

**Services**

* Contain reusable business logic where required.

**Prisma**

* Provides typed database access.

---

## 5. Core Business Modules

The system is divided into business domains:

```text
Workspace
 ├── Users / Employees
 ├── Customers
 ├── Suppliers
 ├── Inventory
 ├── Sales
 ├── Purchases
 ├── Payments
 └── Reports
```

All business records are associated with a workspace to maintain data isolation.

---

## 6. Authentication and Authorization

Authentication establishes the user's identity.

Authorization determines what the user is allowed to do.

```text
User Request
     ↓
Authentication
     ↓
Identify User
     ↓
Workspace Access
     ↓
Permission Check
     ↓
Controller
```

Owners have unrestricted access.

Employees are controlled through capability-based permissions.

Frontend permission checks improve UX, but **backend authorization remains the security boundary**.

---

## 7. Data Flow

### Example: Recording a Sale

```text
User
 ↓
Sales UI
 ↓
POST /sales
 ↓
Authentication
 ↓
Permission Check
 ↓
Sales Controller
 ↓
Validate Request
 ↓
Prisma Transaction
 ↓
PostgreSQL
 ↓
Updated Sale / Inventory / Balances
 ↓
API Response
 ↓
React Query Cache Update
 ↓
UI Refresh
```

---

## 8. Reports Architecture

Reports are calculated from existing business data rather than stored as separate report records.

```text
Sales ───────┐
Purchases ───┤
Inventory ───┤
Customers ───┼──→ Reports Controller
Suppliers ───┤
Payments ────┘
                    ↓
              Aggregated Metrics
                    ↓
              Reports API
                    ↓
              Reports UI
                    ↓
              Gemini Flash
                    ↓
            AI Business Summary
```

The AI receives already-calculated business metrics and does not directly access the database.

---

## 9. Data Consistency

Core business operations should update related records consistently.

For example:

**Sale**

```text
Sale
 ├── Inventory
 ├── Customer Balance
 ├── Cash Flow
 └── Reports
```

**Purchase**

```text
Purchase
 ├── Inventory
 ├── Supplier Balance
 ├── Cash Flow
 └── Reports
```

Where multiple database changes are required, Prisma transactions should be used to maintain consistency.

---

## 10. API Design

The backend exposes REST-style endpoints organized around workspaces and business resources.

Examples:

```text
/api/auth/...
/api/workspaces/:workspaceId/...
/api/workspaces/:workspaceId/customers
/api/workspaces/:workspaceId/suppliers
/api/workspaces/:workspaceId/inventory
/api/workspaces/:workspaceId/sales
/api/workspaces/:workspaceId/purchases
/api/workspaces/:workspaceId/reports
```

API requests are validated before reaching business logic.

---

## 11. Error Handling

The backend provides structured HTTP errors for cases such as:

* `400` — Invalid request
* `401` — Unauthenticated
* `403` — Unauthorized
* `404` — Resource not found
* `500` — Internal server error

The frontend converts these failures into appropriate loading, error, or user-facing states.

---

## 12. AI Integration

Gemini Flash is an **optional intelligence layer**.

```text
Report Metrics
      ↓
AI Summary Service
      ↓
Gemini Flash
      ↓
Structured JSON Summary
      ↓
Reports UI
```

The API key is stored as:

```env
GEMINI_API_KEY=<your-key>
```

The key must never be committed to source control.

If Gemini is unavailable, the Reports page must continue functioning using the normal calculated metrics.

---

## 13. Security Boundaries

The main security boundaries are:

1. Authentication
2. Workspace isolation
3. Backend permission checks
4. Input validation
5. Protected environment variables
6. Controlled database access

The frontend must never be treated as the sole authorization mechanism.

---

## AI Integration

The backend integrates with the Gemini LLM API through a dedicated AI service. The model receives already-calculated report data and returns a structured business summary.

The AI service is isolated from the core reporting logic so report generation continues to work if the LLM API is unavailable.

## API Design

The application exposes RESTful endpoints for workspace resources, including reports.

Example:

GET /api/workspaces/:workspaceId/reports?period=today

The API uses standard HTTP methods and status codes and validates authenticated workspace access.

## Configuration & Secrets

API keys and other environment-specific configuration are stored in environment variables and are never committed to Git.

Example:

GEMINI_API_KEY=...

## Git Workflow

Development uses feature branches for isolated changes. Changes are committed with focused commit messages and merged through Pull Requests after verification.

---

## 14. V1 Architectural Priorities

The architecture intentionally prioritizes:

* Simplicity
* Clear feature separation
* Type safety
* Data consistency
* Workspace isolation
* Reusable components
* Maintainability

The prototype does **not** require:

* Microservices
* Message queues
* Kubernetes
* Event-driven infrastructure
* Separate analytics databases
* Distributed caching
* Complex service orchestration

A modular monolith is sufficient for the current scope.

```
```
