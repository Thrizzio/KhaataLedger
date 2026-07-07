# Khaata Ledger

A clean PERN scaffold for a Digital Ledger System inspired by Khatabook. This repository contains only the production-ready foundation: React client, Express API, Prisma schema, authentication scaffolding, routing, layouts, placeholders, and project conventions. Ledger business logic is intentionally not implemented yet.

## Tech Stack

Frontend: React, Vite, TypeScript, Material UI, React Router DOM, TanStack Query, Axios, React Hook Form, Zod, React Hot Toast.

Backend: Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, JWT, bcrypt, CORS, dotenv.

## Folder Structure

```text
.
|-- client/
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- layouts/
|   |   |-- pages/
|   |   |-- hooks/
|   |   |-- services/
|   |   |-- api/
|   |   |-- routes/
|   |   |-- store/
|   |   |-- types/
|   |   |-- utils/
|   |   `-- theme/
|   `-- package.json
|-- server/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- routes/
|   |   |-- prisma/
|   |   |-- validators/
|   |   `-- utils/
|   `-- package.json
`-- README.md
```

## Installation

Install dependencies separately for the client and server:

```bash
cd client
npm install

cd ../server
npm install
```

## Environment Setup

Copy the example environment files and replace placeholder values:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Client variables:

```text
VITE_API_URL=http://localhost:5000/api
```

Server variables:

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ledger_app?schema=public
JWT_SECRET=replace-with-a-strong-secret
PORT=5000
NODE_ENV=development
```

## Database

The Prisma schema is located at `server/src/prisma/schema.prisma`.

Models included:

- User
- Customer
- Transaction
- AuditLog

Run the initial migration after configuring `DATABASE_URL`:

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

## Available Scripts

Client:

```bash
npm run dev
npm run build
```

Server:

```bash
npm run dev
npm run build
npm run start
npm run prisma:generate
npm run prisma:migrate
```

## API Scaffold

All current API endpoints return:

```json
{
  "success": true,
  "message": "Not implemented"
}
```

Routes included:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `/api/customers`
- `/api/transactions`
- `/api/audit`
- `/api/reports`

## Frontend Routes

- `/`
- `/dashboard`
- `/customers`
- `/customers/:id`
- `/transactions`
- `/audit`
- `/reports`
- `/settings`
- `/login`
- `404`

## Next Steps

- Implement register and login services with Prisma, bcrypt, and JWT.
- Add protected API route groups once authentication is connected.
- Build customer and transaction CRUD workflows.
- Add reporting and audit log persistence.
- Add tests, linting, Docker, and CI as the project matures.
