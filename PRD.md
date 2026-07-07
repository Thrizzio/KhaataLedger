# Product Requirements Document (PRD)

## Product Title

**Digital Ledger Management System for Khatabook**

**Version:** 1.0

**Prepared By:** Product Team

**Status:** Draft

---

# 1. Executive Summary

Khatabook aims to provide a digital ledger that enables shopkeepers to maintain customer credit and debit transactions online instead of traditional paper-based khata books. The system will allow users to add, edit, delete, search, and filter transactions while maintaining an automatically updated running balance. Every modification will be recorded through an audit trail to ensure transparency and accountability. To prevent conflicting changes, only one shopkeeper can edit a transaction at a time.

---

# 2. Business Problem Statement

Many shopkeepers still rely on manual khata books to record customer transactions. Manual bookkeeping often results in misplaced records, incorrect balance calculations, difficulty tracking historical transactions, and limited transparency when records are modified.

Khatabook requires a secure digital ledger that enables shopkeepers to maintain customer transactions online while ensuring transaction integrity, accurate running balances, and complete edit history.

---

# 3. Product Goal

The primary objective of this feature is to replace traditional paper-based bookkeeping with a reliable digital ledger that enables shopkeepers to:

* Maintain customer transaction records digitally.
* View an automatically updated running balance.
* Edit and delete transactions while preserving historical records.
* Quickly search and filter transaction history.
* Prevent simultaneous modification of the same transaction.

---

# 4. Stakeholders

## Primary Users

* Shopkeepers

## Secondary Stakeholders

* Product Team
* Engineering Team
* QA Team
* Customer Support Team

---

# 5. User Persona

### Shopkeeper

**Responsibilities**

* Record customer transactions
* Track outstanding balances
* Review transaction history
* Maintain accurate financial records

**Pain Points**

* Manual calculations
* Lost paper records
* Difficulty finding previous transactions
* No history of modifications

---

# 6. Scope

## In Scope

* Add transaction
* Edit transaction
* Delete transaction (Soft Delete)
* Running balance calculation
* Transaction history
* Pagination
* Search
* Filters
* Audit Trail
* Concurrency control

## Out of Scope

* Customer payment reminders
* Reports and analytics
* Inventory management
* GST calculations
* Invoice generation
* Multi-language support
* Offline synchronization

---

# 7. Functional Requirements

## FR-1 Add Transaction

The shopkeeper should be able to create a new transaction.

### Required Fields

* Customer Name
* Amount
* Transaction Type (Given / Taken)
* Date
* Description

After successful creation:

* Transaction is stored.
* Running balance updates immediately.
* Transaction appears in history.

---

## FR-2 View Transaction History

The system shall display transaction history in descending order of transaction date.

Each record should display:

* Customer Name
* Amount
* Type
* Date
* Running Balance
* Description

---

## FR-3 Running Balance

The running balance shall automatically update after every successful transaction.

Example:

| Transaction | Amount | Running Balance |
| ----------- | ------ | --------------- |
| Given       | ₹1000  | ₹1000           |
| Taken       | ₹300   | ₹700            |
| Given       | ₹500   | ₹1200           |

---

## FR-4 Edit Transaction

The shopkeeper can edit any transaction.

Editable fields:

* Customer Name
* Amount
* Transaction Type
* Date
* Description

After saving:

* Running balance updates.
* Audit entry is generated.

---

## FR-5 Delete Transaction

Transactions will be Soft Deleted.

Deleted transactions:

* Will not appear in normal transaction history.
* Will remain available in Audit History.
* Can be used for historical verification.

---

## FR-6 Pagination

Transaction history shall support pagination.

* 20 records per page
* Next Page
* Previous Page

---

## FR-7 Search

Users can search transactions using:

* Customer Name

---

## FR-8 Filters

Users can filter transactions using:

* Credit (Given)
* Debit (Taken)
* Month

---

## FR-9 Audit Trail

Every modification must be recorded.

Audit Log should include:

* Transaction ID
* Previous Value
* Updated Value
* Edited By
* Edited Time
* Delete Action (if applicable)

Audit records cannot be modified.

---


# 9. Acceptance Criteria

### Add Transaction

**Given** valid transaction details

**When** the user clicks Save

**Then**

* Transaction is stored
* Running balance updates
* Audit log records creation

---

### Edit Transaction

**Given** a transaction exists

**When** the shopkeeper edits it

**Then**

* Changes are saved
* Running balance updates
* Audit entry is created

---

### Delete Transaction

**Given** an existing transaction

**When** Delete is selected

**Then**

* Transaction is soft deleted
* Audit history retains the deleted record

---

### Concurrent Edit

**Given** another user is editing the transaction

**When** a second user opens it

**Then**

* Editing is disabled
* Read-only mode is displayed
* User receives an informational message

---

# 10. Non-Functional Requirements

| Requirement               | Target               |
| ------------------------- | -------------------- |
| Page Load Time            | ≤ 2 seconds          |
| Add Transaction Response  | ≤ 500 ms             |
| Edit Transaction Response | ≤ 500 ms             |
| Running Balance Update    | Immediate after save |
| Pagination Response       | ≤ 500 ms             |
| Availability              | 99.9%                |
| Data Integrity            | 100%                 |
| Audit Log Retention       | Permanent            |

---

# 11. Data Model

## Transaction

| Field            | Type                 |
| ---------------- | -------------------- |
| transaction_id   | UUID                 |
| customer_name    | String               |
| amount           | Decimal              |
| transaction_type | Enum (Given, Taken)  |
| description      | Text                 |
| transaction_date | Date                 |
| running_balance  | Decimal              |
| created_at       | Timestamp            |
| updated_at       | Timestamp            |
| deleted_at       | Timestamp (Nullable) |

---

## Audit Log

| Field          | Type                     |
| -------------- | ------------------------ |
| audit_id       | UUID                     |
| transaction_id | UUID                     |
| action         | Create / Update / Delete |
| previous_value | JSON                     |
| new_value      | JSON                     |
| edited_by      | User ID                  |
| edited_at      | Timestamp                |

---

# 12. Business Rules

* Running balance updates after every successful transaction.
* Deleted transactions remain available in audit history.
* Only one user may edit a transaction at any time.
* Transactions cannot be permanently deleted.
* Audit logs cannot be modified.

---

# 13. Risks and Mitigation

| Risk                        | Impact             | Mitigation            |
| --------------------------- | ------------------ | --------------------- |
| Simultaneous editing        | Data inconsistency | Pessimistic locking   |
| Accidental deletion         | Data loss          | Soft Delete           |
| Network failure during save | Partial update     | Database transactions |
| Large transaction history   | Slow loading       | Pagination            |
| Unauthorized changes        | Security risk      | Audit Trail           |

---

# 14. Success Metrics (KPIs)

As business metrics are not available, the following KPIs are proposed and should be validated with stakeholders:

* 95% of transactions are successfully saved without errors.
* Running balance is updated immediately after every successful transaction.
* 100% of edits and deletions are captured in the audit log.
* No simultaneous edit conflicts result in data corruption.
* Transaction history pages load within the defined performance target.

---

# 15. Future Enhancements

* Customer reminders via SMS/WhatsApp
* Advanced search
* Export to Excel/PDF
* Monthly reports
* Dashboard and analytics
* Multi-user roles and permissions
* Mobile offline mode
* Real-time notifications
* Customer statement generation

---

# 16. Assumptions

* Each shopkeeper has access to only their own ledger.
* Authentication and authorization already exist.
* All transactions are stored in a centralized database.
* Business KPI targets will be finalized after stakeholder validation.
* The first version focuses only on digital ledger management.

---

# 17. Conclusion

The Digital Ledger Management System modernizes traditional bookkeeping by enabling shopkeepers to securely maintain customer transactions online. Through automatic running balance calculation, audit history, pagination, search, filtering, and concurrency control, the system provides an efficient, transparent, and reliable solution for daily ledger management while laying the foundation for future financial features.
