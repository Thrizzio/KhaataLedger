<div align="center">

# 📒 KhaataLedger

### Modern Multi-Workspace Ledger Management System

A production-inspired full-stack financial ledger application for small businesses featuring workspace isolation, role-based authentication, audit trails, and digital khata management.

---

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Express](https://img.shields.io/badge/Express-4-black?logo=express)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?logo=postgresql)
![Material UI](https://img.shields.io/badge/MUI-6-007FFF?logo=mui)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)

</div>

---

# Overview

KhaataLedger is a modern alternative to traditional handwritten **khata books** used by small businesses.

Instead of maintaining paper ledgers, businesses can securely manage:

- Income
- Expenses
- Credit / Lending
- Employee access
- Multiple businesses
- Audit history

The system was designed with real-world business workflows in mind while maintaining a clean, scalable architecture.

---

# Features

## Workspace Management

- Multiple businesses per owner
- Workspace switching
- Workspace-specific dashboards
- Complete data isolation

---

## Authentication

- JWT Authentication
- Owner Login
- Employee Login
- Secure password hashing using bcrypt
- Role-based authorization

---

## Transactions

- Income tracking
- Expense tracking
- Credit lending (Khata)
- Soft Delete
- Edit Transactions
- Live updates
- Optimistic versioning (planned)

---

## Employee Management

Owners can

- Create employees
- Assign employees to businesses
- Manage employee access

Employees

- Login directly into their assigned workspace
- Cannot create businesses
- Cannot switch workspaces

---

## Audit Logs

Every modification is permanently recorded.

Supports

- Transaction Creation
- Transaction Updates
- Transaction Deletion

Each audit record stores

- User
- Timestamp
- Previous Values
- New Values

creating a complete audit trail.

---

## Dashboard

Workspace-specific dashboard containing

- Income Summary
- Expense Summary
- Current Balance
- Today's Activity
- Recent Transactions

---

## Workspace Isolation

Every business has completely isolated data.

Transactions

Employees

Audit Logs

Dashboard

Reports

are all scoped to the selected workspace.

---

# Tech Stack

## Frontend

- Next.js 15 (App Router)
- React
- TypeScript
- Material UI
- TanStack Query
- React Hook Form
- Zod
- Axios

---

## Backend

- Express
- Node.js
- TypeScript
- Prisma ORM
- PostgreSQL

---

## Infrastructure

Frontend

- Vercel

Backend

- Render

Database

- Neon PostgreSQL

---

# Architecture

```
                Next.js Frontend
                        │
                        │
                 TanStack Query
                        │
                        ▼
               Express REST API
                        │
                        ▼
                Prisma ORM
                        │
                        ▼
               PostgreSQL (Neon)
```

---

# User Roles

## Owner

✔ Create Workspaces

✔ Manage Employees

✔ Add Transactions

✔ Edit Transactions

✔ Delete Transactions

✔ View Audit Logs

✔ Switch Workspaces

---

## Employee

✔ Login

✔ View Dashboard

✔ Create Transactions

✔ View Audit Logs

❌ Cannot Create Workspaces

❌ Cannot Switch Workspaces

❌ Cannot Delete Transactions

---

# Project Structure

```
client/

├── src/
│   ├── app/
│   ├── components/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── views/

server/

├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── prisma/
│   ├── routes/
│   ├── utils/
│   └── validators/
```

---

# Database Design

Core Models

- User
- Workspace
- Transaction
- AuditLog

Relationships

```
Owner
 │
 ├───────────────┐
 │               │
Workspace     Workspace
 │               │
 ├── Employees   ├── Employees
 │               │
 ├── Transactions
 │
 └── Audit Logs
```

---

# Security

- JWT Authentication
- Password Hashing
- Role-Based Authorization
- Workspace Isolation
- Soft Deletes
- Backend Permission Validation

The backend never trusts the client when determining workspace access.

Every request is validated against the authenticated user's permissions.

---

# Current Features

- Multi-workspace architecture
- Owner & Employee roles
- Workspace switcher
- Transaction CRUD
- Audit logging
- Employee management
- Workspace isolation
- Live updates with TanStack Query
- Responsive dashboard

---

# Planned Features

- Reports
- Analytics
- Charts
- Export CSV
- Export PDF
- Search
- Filters
- Notifications
- Customer Statements
- Recurring Transactions

---

# Getting Started

## Clone

```bash
git clone https://github.com/<username>/KhaataLedger.git
```

---

## Backend

```bash
cd server

npm install

npm run prisma:generate

npm run prisma:migrate

npm run dev
```

---

## Frontend

```bash
cd client

npm install

npm run dev
```

---

# Environment Variables

Backend

```
DATABASE_URL=

JWT_SECRET=

PORT=
```

Frontend

```
NEXT_PUBLIC_API_URL=
```

---

# Design Principles

The project intentionally avoids unnecessary complexity.

Instead of using

- Microservices
- Repository Pattern
- CQRS
- Dependency Injection

the project focuses on

- Readability
- Maintainability
- Simplicity
- Production-inspired architecture

---

# Future Roadmap

- Customer Management
- Inventory Support
- Business Analytics
- Invoice Generation
- Mobile Responsive Improvements
- Docker Support
- CI/CD Improvements

---

# Screenshots

> Screenshots will be added as development progresses.

---

# Contributing

Contributions, feature suggestions and improvements are welcome.

Feel free to open an Issue or Pull Request.

---

# License

MIT License

---

<div align="center">

Built with ❤️ using

Next.js • Express • Prisma • PostgreSQL • Material UI

</div>
