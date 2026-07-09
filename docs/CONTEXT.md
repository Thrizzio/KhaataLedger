# LLM Project Context

## Project

Expense Ledger Management System

This project is a full-stack web application for small businesses to record and manage expenses digitally.

The application supports two roles:

- Owner
- Employee

The goal is to replace manual expense books with a secure digital ledger that supports authentication, expense tracking, audit logs, and role-based access.

---

# Current Tech Stack

## Frontend

- React
- Vite
- TypeScript
- Material UI
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod
- React Hot Toast

## Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication (planned)
- bcrypt
- dotenv
- CORS

---

# Current Progress

Currently implemented:

- Prisma schema
- Transaction endpoint
- Employee endpoint

Authentication is not implemented yet.

Owner functionality is not implemented yet.

Business/workspace support is not implemented yet.

---

# Project Philosophy

The project should remain simple.

Avoid introducing unnecessary enterprise patterns such as:

- Repository Pattern
- Dependency Injection
- CQRS
- Event Sourcing
- Microservices

Use straightforward Express controllers and Prisma queries.

Keep code readable and beginner-friendly.

---

# Current Database Schema

## User

Represents both owners and employees.

Fields

- id
- name
- email
- passwordHash
- role
- createdAt
- updatedAt

Roles

- OWNER
- EMPLOYEE

A user can create many transactions.

A user can create many audit logs.

---

## Category

Stores expense or income categories.

Examples

- Food
- Rent
- Fuel
- Inventory
- Office Supplies

Fields

- id
- name
- defaultType

Each category can have many transactions.

---

## Transaction

Represents one income or expense entry.

Fields

- id
- title
- description
- amount
- type
- transactionDate
- categoryId
- createdById
- version
- deletedAt
- createdAt
- updatedAt

Relationships

- belongs to Category
- belongs to User
- has many AuditLogs

Soft delete is implemented using deletedAt.

Optimistic locking is planned using the version field.

---

## AuditLog

Every modification should generate an audit record.

Fields

- id
- action
- transactionId
- userId
- previousValue
- newValue
- createdAt

Audit records should never be edited.

---

# Current Enums

Role

- OWNER
- EMPLOYEE

TransactionType

- INCOME
- EXPENSE

AuditAction

- CREATE
- UPDATE
- DELETE

---

# Coding Standards

Always use:

- TypeScript
- Async/await
- Prisma Client
- Express Router
- Zod validation

Avoid using "any".

Return consistent API responses.

Example

```ts
{
  success: true,
  data,
  message
}
```

Error format

```ts
{
  success: false,
  error,
  message
}
```

---

# Folder Structure

server/src

config/

controllers/

middleware/

routes/

validators/

utils/

prisma/

---

# Future Features

The following are planned but not implemented yet.

## Authentication

- Register
- Login
- JWT
- Password hashing

---

## Role Based Access

Owner

- Manage employees
- View reports
- View audit logs
- Delete expenses
- Manage categories

Employee

- Add expenses
- Edit expenses
- View expenses

---

## Business Workspace

The application will eventually support businesses/workspaces.

One owner can own multiple businesses.

Each business can have multiple employees.

Employees belong to exactly one business.

Owners create businesses.

Employees join using an invite code.

This feature is NOT implemented yet.

Do not assume its existence unless explicitly requested.

---

## Audit Trail

Every

CREATE

UPDATE

DELETE

should automatically create an AuditLog record.

---

## Soft Delete

Transactions should never be permanently deleted.

Set deletedAt instead.

Normal queries should exclude deleted transactions.

---

## Optimistic Locking

The version field exists for optimistic concurrency.

Every successful update increments version by one.

If versions mismatch, reject the update.

---

# Expectations for Generated Code

Whenever generating code:

- Follow the existing project structure.
- Reuse existing Prisma models.
- Do not redesign the schema unless explicitly requested.
- Keep controllers simple.
- Prefer readable code over clever abstractions.
- Do not introduce new libraries unless requested.
- Keep responses RESTful.
- Maintain consistent naming conventions.