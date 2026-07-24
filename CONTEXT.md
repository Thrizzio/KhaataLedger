Project Overview
What is KhaataLedger?

KhaataLedger is a multi-tenant SaaS platform for small and medium businesses that combines inventory management, customer credit tracking (Khata), supplier management, and sales/purchase recording into a single system.

Unlike a traditional expense tracker, KhaataLedger models the actual day-to-day operations of a business.

The application is centered around business operations, not financial transactions.

Every sale, purchase, payment, and stock movement is represented explicitly rather than being abstracted into generic debit/credit records.

Core Philosophy

Businesses don't think in terms of "transactions."

They think in terms of:

I bought stock.
I sold products.
My customer still owes me ₹500.
My supplier needs to be paid.
I have 12 bottles left in inventory.

The backend mirrors this language directly.

This makes the codebase easier to understand, maintain, and extend.

Business Modules
Inventory

Inventory represents every product that the business sells.

Each product maintains:

Current stock
Selling price
SKU
Unit
Historical purchase information
Historical sales information

Inventory is the heart of the application.

Almost every business operation eventually affects inventory.

Sales

A Sale represents one customer purchase.

A Sale contains:

Customer
Payment type
Date
Total
Sale line items

Each line item stores:

Product
Quantity
Selling price

Creating a sale performs multiple business operations atomically:

Creates the Sale
Creates SaleLineItems
Decreases Inventory
Updates customer outstanding balance (for credit sales)
Creates Khata entries (when applicable)
Purchases

Purchases represent inventory bought from suppliers.

Creating a purchase:

Creates Purchase
Creates PurchaseLineItems
Increases inventory
Updates supplier outstanding balance

Purchase price is stored historically on every line item.

Changing today's purchase cost never changes historical purchases.

Customers

Customers are long-lived business entities.

They contain:

Contact information
Outstanding balance
Sales history
Khata history

Customers are not merely names written on invoices.

Suppliers

Suppliers are managed independently from purchases.

Each supplier has:

Contact details
Outstanding payable
Purchase history
Khata System

The Khata module is not a separate bookkeeping application.

Instead, it represents the customer's running credit account.

Whenever a customer buys goods on credit:

Sale

↓

Khata Entry (Credit)

↓

Customer Outstanding Balance

Whenever a customer pays later:

Customer Payment

↓

Khata Entry (Payment)

↓

Outstanding Balance decreases

The Khata therefore becomes the complete timeline of the customer's debt.

Relationship Between Sales and Khata

One important design decision:

Every Khata entry should be traceable back to the business operation that created it.

For example:

Sale #104

↓

Khata Credit Entry

↓

Customer Balance +₹500

Later

Customer Payment

↓

Khata Payment Entry

↓

Customer Balance −₹300

This provides complete traceability.

Inventory Traceability

Inventory should never change directly.

Instead, stock changes only through business events.

Purchase

↓

Stock increases

Sale

↓

Stock decreases

Adjustment (future)

↓

Stock changes

Return (future)

↓

Stock changes

This rule guarantees inventory consistency.

No API should expose:

PATCH /inventory/currentStock

Instead, inventory changes only inside business services.

Why Line Items Exist

Products must never be attached directly to Sales or Purchases.

Instead:

Sale

↓

SaleLineItem

↓

InventoryItem

This allows:

Multiple products per invoice
Different quantities
Different selling prices
Historical pricing

The same applies to purchases.

Historical Accuracy

Business records must never change after creation.

For example:

Today:

Milk

₹40

Next month:

Rename product

Premium Milk

Old invoices must still represent what was sold at the time.

Therefore line items should contain immutable snapshots where appropriate (product name, selling price, purchase price).

Business Rules

The backend enforces these rules:

Inventory

Only business operations may modify stock.

Never update currentStock directly.

Customer Balance

Customer balances are updated only by:

Credit sales
Customer payments
Supplier Balance

Supplier balances are updated only by:

Purchases
Supplier payments
Atomic Operations

Creating a Sale is a single transaction.

If inventory deduction fails,

the Sale is rolled back.

If Khata creation fails,

the Sale is rolled back.

If balance updates fail,

everything is rolled back.

Every business operation succeeds completely or fails completely.

Future Roadmap
Phase 1

Inventory

Customers

Suppliers

Sales

Purchases

Phase 2

Customer Payments

Supplier Payments

Phase 3

Inventory Adjustments

Returns

Damaged Stock

Stock Transfers

Phase 4

Reporting

Profit & Loss

Inventory Valuation

Sales Analytics

Business Dashboard

Phase 5

Audit Trail

Stock Movement History

Invoice PDFs

Barcode Support

GS