# KhaataLedger — Product Requirements Document (PRD)

**Version:** 1.0
**Product:** KhaataLedger
**Document Type:** Product Requirements Document
**Scope:** Prototype / V1
**Status:** Proposed

---

## 1. Product Overview

**KhaataLedger** is a digital business management and accounting system designed for small businesses in India.

The system combines everyday business operations—**sales, purchases, inventory, customers, suppliers, payments, employees, and reporting**—into one application.

The primary goal is to replace fragmented paper ledgers, spreadsheets, and disconnected records with a simple centralized system.

The product is designed around a simple principle:

> **A business owner should be able to record transactions, understand the current state of the business, and make decisions from one place.**

---

# 2. Problem Statement

Small businesses frequently manage their operations using a combination of:

* Physical khata/ledger books
* Spreadsheets
* Paper invoices
* Separate inventory records
* Manual customer and supplier balances
* Informal communication between employees

This creates several problems:

1. Business information is fragmented.
2. Manual calculations can introduce errors.
3. Owners have limited visibility into outstanding payments.
4. Inventory levels are difficult to track accurately.
5. Sales and purchase trends are difficult to understand.
6. Employees may not have clearly defined access to business data.
7. Generating business reports requires manual effort.

KhaataLedger addresses these problems by providing a **single digital workspace for business operations**.

---

# 3. Product Vision

Build a simple, reliable business management platform that allows small-business owners to:

* Manage their products and inventory.
* Record sales and purchases.
* Track customers and suppliers.
* Track outstanding payments.
* Control employee access.
* Understand business performance through reports.
* Receive concise AI-assisted business insights.

The V1 should prioritize **simplicity and reliability over feature volume**.

---

# 4. Target Users

## 4.1 Business Owner

The primary user of KhaataLedger.

The owner should be able to:

* Manage the business.
* Manage employees.
* View all business data.
* Record and review transactions.
* Monitor inventory.
* Track customer and supplier balances.
* View reports.
* Receive business insights.

---

## 4.2 Employee

An employee performs day-to-day business operations.

Depending on permissions, an employee may be able to:

* Record sales.
* Record purchases.
* View or modify inventory.
* Manage customers.
* Manage suppliers.
* View reports.

Employees should only have access to functionality granted to them by the owner.

---

# 5. Product Goals

### Primary Goals

1. Centralize core business records.
2. Make recording transactions fast and simple.
3. Maintain accurate customer and supplier balances.
4. Provide basic inventory visibility.
5. Provide role/permission-based employee access.
6. Give owners useful business reports.
7. Provide AI-generated summaries based on actual business data.

### Secondary Goals

* Maintain a clean and understandable user interface.
* Keep the architecture modular enough for future expansion.
* Minimize unnecessary complexity in the V1 implementation.

---

# 6. V1 Scope

The prototype includes the following major modules:

| Module              | Purpose                          |
| ------------------- | -------------------------------- |
| Authentication      | Secure user access               |
| Workspace           | Represents a business            |
| Dashboard           | High-level business overview     |
| Customers           | Manage customers and balances    |
| Suppliers           | Manage suppliers and balances    |
| Inventory           | Manage products and stock        |
| Sales               | Record and track sales           |
| Purchases           | Record and track purchases       |
| Payments            | Track customer/supplier payments |
| Employee Management | Manage employees and permissions |
| Reports             | Analyze business performance     |
| AI Summary          | Generate business insights       |

---

# 7. Functional Requirements

## 7.1 Authentication

The system shall provide authentication for business users.

### Requirements

* Users shall be able to log in.
* Authentication shall distinguish between owners and employees.
* Invalid credentials shall be rejected.
* Unauthorized users shall not access protected workspace data.
* Expired/invalid authentication tokens shall redirect users to login.
* Protected API endpoints shall verify authentication.

### V1 Out of Scope

* Social login
* Multi-factor authentication
* Passwordless authentication
* Advanced identity management

---

# 8. Workspace Management

A workspace represents a business using KhaataLedger.

### Requirements

The system shall:

* Associate users with a workspace.
* Associate business data with the appropriate workspace.
* Allow owners to manage workspace employees.
* Prevent users from accessing another workspace's data.

The workspace acts as the primary boundary for business data isolation.

---

# 9. Customer Management

The system shall allow businesses to maintain customer records.

### Requirements

Users with the appropriate permission shall be able to:

* Create customers.
* View customers.
* Search customers.
* View customer information.
* View outstanding customer balances.
* Record customer payments.
* View customer-related transaction information.

The system shall calculate and display outstanding customer credit.

### V1

Basic customer management is required.

A sophisticated CRM system is out of scope.

---

# 10. Supplier Management

The system shall allow businesses to maintain supplier records.

### Requirements

Users with the appropriate permission shall be able to:

* Create suppliers.
* View suppliers.
* Search suppliers.
* View supplier information.
* Track outstanding supplier balances.
* Record supplier payments.
* View purchase-related supplier information.

---

# 11. Inventory Management

Inventory represents the products physically available to the business.

### Requirements

The system shall allow authorized users to:

* Create inventory items.
* View inventory.
* Search inventory.
* Track available stock.
* Track purchase/selling information.
* Identify low-stock products.
* Identify out-of-stock products.
* View inventory value.

The reports system shall use inventory data to provide stock-related business insights.

### V1 Inventory Metrics

The Reports page should expose:

* Total Inventory Value
* Average Stock
* Low Stock Products
* Out-of-Stock Products
* Highest Stock Products

---

# 12. Sales Management

The sales module is responsible for recording customer sales.

### Requirements

Users with sales permissions shall be able to:

* Create a sale.
* Select a customer.
* Select products.
* Specify quantities.
* Specify payment type.
* Record cash sales.
* Record credit sales.
* View sales history.

The system shall associate sales with the relevant workspace and user.

---

# 13. Purchase Management

The purchase module records inventory purchased from suppliers.

### Requirements

Authorized users shall be able to:

* Create purchases.
* Select suppliers.
* Select products.
* Specify quantities.
* Record purchase amounts.
* View purchase history.

Purchase records shall contribute to:

* Inventory calculations
* Supplier metrics
* Purchase reports
* Cash-flow calculations
* Profitability analysis

---

# 14. Payment Management

The system shall track money received from customers and money paid to suppliers.

### Customer Payments

The system shall allow authorized users to:

* Record customer payments.
* Reduce outstanding customer balances.
* View payment history.

### Supplier Payments

The system shall allow authorized users to:

* Record supplier payments.
* Reduce outstanding supplier balances.
* View payment history.

Payment information shall contribute to the Cash Flow report.

---

# 15. Employee Management and RBAC

The owner shall be able to manage employees within the workspace.

### Requirements

The system shall support:

* Adding employees.
* Viewing employees.
* Assigning roles.
* Managing permissions.
* Persisting employee permissions.
* Enforcing permissions throughout the application.

Permissions shall control access to relevant business operations.

### Example Permissions

* Dashboard View
* Sales View/Create/Edit/Delete
* Purchase View/Create/Edit/Delete
* Inventory View/Create/Edit/Delete
* Customer View/Create/Edit/Delete
* Supplier View/Create/Edit/Delete
* Reports View

The exact permission set may evolve with the implementation.

---

# 16. Dashboard

The dashboard provides a high-level overview of the business.

It should allow the owner to quickly understand the current state of the business without opening individual modules.

Potential dashboard information includes:

* Sales
* Purchases
* Outstanding customer credit
* Outstanding supplier dues
* Inventory information
* Recent activity

The dashboard is intended for **quick monitoring**, while Reports provides deeper analysis.

---

# 17. Reports

The Reports module provides analytical information based on existing business data.

Users can select:

* **Today**
* **This Week**
* **This Month**

The report system shall calculate metrics dynamically from the database.

---

## 17.1 Sales Reports

The Sales section shall provide:

* Total Revenue
* Number of Sales
* Average Order Value
* Sales Growth
* Cash Sales
* Credit Sales
* Best-Selling Products
* Worst-Selling Products
* Top Customers

---

## 17.2 Customer Reports

The Customer section shall provide:

* Outstanding Customer Credit
* Customers with Outstanding Credit
* New Customers Added
* Average Customer Spend
* Highest Outstanding Customers

---

## 17.3 Supplier Reports

The Supplier section shall provide:

* Outstanding Supplier Dues
* Suppliers with Outstanding Dues
* New Suppliers Added
* Average Supplier Purchase Value
* Top Suppliers by Purchase Value
* Top Suppliers by Purchase Count

---

## 17.4 Purchase Reports

The Purchase section shall provide:

* Total Purchases
* Number of Purchases
* Total Items Purchased
* Average Purchase Value
* Highest Purchase
* Lowest Purchase
* Most Purchased Products
* Recent Purchase Records

---

## 17.5 Inventory Reports

The Inventory section shall provide:

* Total Inventory Value
* Average Stock
* Low Stock Products
* Out-of-Stock Products
* Highest Stock Products

---

## 17.6 Cash Flow Reports

The Cash Flow section shall provide:

* Cash Inflow
* Cash Outflow
* Net Cash Flow
* Cash Flow Status
* Recent Incoming Transactions

Cash inflow may include:

* Cash sales
* Customer collections

Cash outflow may include:

* Cash purchases
* Supplier payments

---

## 17.7 Profitability Reports

The Profitability section shall provide basic profitability information derived from sales and purchase data.

The purpose is to give the owner a useful estimate rather than implement a complete accounting system.

---

# 18. AI Business Summary

KhaataLedger shall provide an AI-generated summary based on the existing report metrics.

The AI should not independently access the database.

Instead:

```text
Database
   ↓
Report calculations
   ↓
Structured report data
   ↓
AI model
   ↓
Business summary
```

The AI summary may contain:

* Business headline
* Summary
* Highlights
* Warnings
* Recommendations

### Example

**Headline**

> Strong sales performance this week

**Highlights**

* Revenue increased compared with the previous period.
* Two products generated most of the sales.
* Customer collections remained positive.

**Warnings**

* Several products are approaching low-stock levels.
* Outstanding customer credit has increased.

**Recommendations**

* Restock high-demand products.
* Follow up with customers with significant outstanding balances.

### AI Constraints

The AI must:

* Use only supplied business metrics.
* Never invent numbers.
* Clearly distinguish observations from recommendations.
* Fail gracefully if the AI service is unavailable.

The application itself must continue working even when AI generation fails.

---

# 19. User Experience Requirements

The application should prioritize **clarity over visual complexity**.

### UI Principles

* Consistent Material UI components.
* Clear navigation.
* Minimal unnecessary decoration.
* Strong visual hierarchy.
* Clear error states.
* Clear loading states.
* Responsive layouts.
* Consistent buttons and forms.
* Tables/cards for structured business information.

The interface should feel like a practical business application rather than a marketing website.

---

# 20. Navigation Requirements

The primary navigation should provide access to the core modules.

Expected navigation includes:

* Dashboard
* Customers
* Suppliers
* Inventory
* Sales
* Purchases
* Reports
* Employees / Workspace management where appropriate

Navigation visibility may depend on the user's role and permissions.

---

# 21. Authorization Requirements

Authentication and authorization are separate concerns.

### Authentication

Answers:

> "Who is this user?"

### Authorization

Answers:

> "What is this user allowed to do?"

The backend must enforce authorization.

Frontend hiding of buttons or pages alone is **not sufficient security**.

A user attempting to call an unauthorized API endpoint directly must still be rejected by the backend.

---

# 22. Data Integrity Requirements

The system should maintain consistency between related business records.

Examples:

### Sale

A sale may affect:

* Inventory
* Customer balance
* Sales reports
* Cash flow
* Profitability

### Purchase

A purchase may affect:

* Inventory
* Supplier balance
* Purchase reports
* Cash flow

### Customer Payment

A customer payment should affect:

* Customer outstanding balance
* Cash inflow
* Payment history

### Supplier Payment

A supplier payment should affect:

* Supplier outstanding balance
* Cash outflow
* Payment history

---

# 23. Error Handling

The application shall provide meaningful error handling for:

* Invalid input
* Unauthorized access
* Missing records
* Duplicate records where applicable
* Database errors
* Failed API requests
* AI service failures

The frontend should display understandable messages rather than raw server errors.

---

# 24. Performance Requirements

For the prototype:

* Normal page interactions should feel responsive.
* Reports should load within a reasonable time for the expected dataset.
* Database queries should be scoped to the relevant workspace.
* Reports should avoid unnecessary repeated queries.
* AI generation should not prevent the core report from loading.

The V1 does not require large-scale distributed processing.

---

# 25. Security Requirements

The system shall:

* Protect authenticated endpoints.
* Validate incoming API data.
* Enforce workspace-level data isolation.
* Enforce employee permissions on the backend.
* Keep API credentials out of source code.
* Store sensitive configuration in environment variables.
* Avoid exposing password hashes through API responses.

---

# 26. Non-Functional Requirements

### Reliability

Core business operations should continue functioning even if optional services such as AI are unavailable.

### Maintainability

The codebase should remain modular, with separate areas for:

* API routes
* Controllers
* Services
* Database access
* Frontend features
* Shared components

### Usability

A small-business user should be able to understand the primary workflow without technical knowledge.

### Scalability

The architecture should allow additional business features to be added without rewriting the existing modules.

---

# 27. V1 Out of Scope

To keep the prototype focused, the following are not required:

* Full accounting/ERP functionality
* GST filing
* Tax return submission
* Payroll
* Banking integration
* Payment gateway integration
* E-commerce integration
* Advanced CRM
* Multi-currency accounting
* Complex financial statements
* Automated invoice emailing
* Mobile applications
* Advanced forecasting
* Full audit-log management UI
* Advanced custom report builder
* Multi-location inventory management
* Enterprise-scale analytics infrastructure

These can be considered future extensions.

---

# 28. Editing and Transaction Corrections

Basic master-data editing may be supported where appropriate, such as:

* Customer information
* Supplier information
* Inventory information
* Employee information

Financial transactions should be treated more carefully.

For the prototype, complex transaction reversal workflows are **out of scope**.

If transaction editing is introduced later, it should preserve data integrity and avoid silently changing historical financial information.

---

# 29. Audit Logging

The system may maintain backend audit information for important operations.

However, a dedicated user-facing Audit Logs page is **not required for V1**.

A future version may expose:

* Who performed an action
* What was changed
* Previous value
* New value
* Timestamp
* Affected entity

---

# 30. Core User Flows

## 30.1 Owner Login

```text
Owner
 ↓
Login
 ↓
Authentication
 ↓
Workspace
 ↓
Dashboard
```

---

## 30.2 Record a Sale

```text
Sales
 ↓
New Sale
 ↓
Select Customer
 ↓
Select Products
 ↓
Enter Quantities
 ↓
Select Payment Type
 ↓
Save
 ↓
Update Business Records
 ↓
Sale appears in reports
```

---

## 30.3 Record a Purchase

```text
Purchases
 ↓
New Purchase
 ↓
Select Supplier
 ↓
Select Products
 ↓
Enter Quantities
 ↓
Enter Purchase Amount
 ↓
Save
 ↓
Inventory / Supplier / Reports updated
```

---

## 30.4 View Business Report

```text
Reports
 ↓
Select Period
 ↓
Today / Week / Month
 ↓
Backend aggregates data
 ↓
Report sections displayed
 ↓
AI analyzes report data
 ↓
Business Summary displayed
```

---

## 30.5 Employee Access

```text
Owner
 ↓
Employee Management
 ↓
Select Employee
 ↓
Assign Permissions
 ↓
Save
 ↓
Backend persists permissions
 ↓
Employee receives permitted access
```

---

### AI Business Summary

The Reports page uses an external LLM API to generate a concise business summary from the application's calculated report data.

The AI output is structured into:
- Business summary
- Highlights
- Warnings
- Recommendations

Prompt engineering is used to ensure the model focuses only on the supplied business metrics and produces predictable, actionable output rather than inventing data.

---

# 31. Success Criteria

The V1 will be considered successful if a business owner can complete the following workflow:

1. Log into KhaataLedger.
2. Create/manage customers and suppliers.
3. Add inventory.
4. Record a purchase.
5. Record a sale.
6. Record payments.
7. View updated business information.
8. Manage employee permissions.
9. Open Reports.
10. View sales, customer, supplier, purchase, inventory, cash-flow and profitability metrics.
11. Switch between reporting periods.
12. Receive an AI-generated business summary when the AI service is available.

The system should accomplish this without requiring spreadsheets or manual calculations for the core workflow.

---

# 32. Future Roadmap

Potential future versions may introduce:

### V1.1

* Better editing workflows
* PDF/CSV report export
* Improved filtering
* Custom date ranges
* Better dashboard customization

### V2

* Advanced audit history
* GST functionality
* Invoice generation
* Automated notifications
* Advanced inventory forecasting
* More sophisticated profitability analysis

### V3

* Mobile application
* Banking/payment integrations
* Multi-location businesses
* Advanced AI business assistant
* Predictive analytics

These features are intentionally excluded from the prototype to keep the initial product focused.

---

# 33. Product Architecture Principle

The most important architectural/product principle for KhaataLedger V1 is:

> **Keep the core business operations deterministic and let AI sit on top of verified business data.**

Sales, purchases, inventory, balances, and financial calculations should be generated by the application's own business logic.

AI should interpret those results—not become the source of truth.

This keeps the system predictable, testable, and appropriate for a business application.

---

# 34. Final V1 Scope Summary

| Area                 | V1               |
| -------------------- | ---------------- |
| Authentication       | **Required**     |
| Workspace            | **Required**     |
| Customers            | **Required**     |
| Suppliers            | **Required**     |
| Inventory            | **Required**     |
| Sales                | **Required**     |
| Purchases            | **Required**     |
| Payments             | **Required**     |
| Employee RBAC        | **Required**     |
| Dashboard            | **Required**     |
| Reports              | **Required**     |
| AI Business Summary  | **Included**     |
| Basic Editing        | **Selective**    |
| Audit Page           | **Out of Scope** |
| GST                  | **Out of Scope** |
| Payroll              | **Out of Scope** |
| Banking Integration  | **Out of Scope** |
| Mobile App           | **Out of Scope** |
| Advanced Forecasting | **Out of Scope** |

## Final Product Definition

**KhaataLedger V1 is a centralized digital business ledger that allows small-business owners to manage their customers, suppliers, inventory, sales, purchases, payments and employees, while providing consolidated business reports and AI-assisted insights from the resulting data.**

This is the appropriate scope for the prototype: **broad enough to demonstrate a complete business system, but narrow enough that every major feature can actually work.**
