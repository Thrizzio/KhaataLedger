---
title: Business Management System — ERD (from Prisma schema)
---
erDiagram

    %% ============================================================
    %% CORE / WORKSPACE / ACCESS DOMAIN
    %% ============================================================
    USER {
        string id PK
        string name
        string email UK
        string passwordHash
        Role role
        string_array permissions
        string employeeId UK "nullable"
        string workspaceId FK "nullable - current employer"
        int failedLoginAttempts
        datetime lockedUntil "nullable"
        datetime createdAt
        datetime updatedAt
    }

    WORKSPACE {
        string id PK
        string name
        string ownerId FK "owning User"
        datetime createdAt
        datetime updatedAt
    }

    LOGINAUDITLOG {
        string id PK
        string email "nullable"
        string ipAddress "nullable"
        datetime timestamp
    }

    %% ============================================================
    %% LEDGER / AUDIT DOMAIN
    %% ============================================================
    TRANSACTION {
        string id PK
        string workspaceId FK
        string title
        string description "nullable"
        decimal amount
        TransactionType type
        datetime transactionDate
        string createdById FK
        int version
        datetime deletedAt "nullable"
        datetime createdAt
        datetime updatedAt
    }

    AUDITLOG {
        string id PK
        string workspaceId FK
        AuditAction action
        string transactionId FK "nullable"
        string khataId FK "nullable"
        string userId FK
        json previousValue "nullable"
        json newValue "nullable"
        datetime createdAt
    }

    KHATA {
        string id PK
        string workspaceId FK
        string customerName
        string contactNumber
        string title
        decimal initialAmount
        string customerId FK "nullable"
        string createdById FK
        datetime createdAt
        datetime updatedAt
        datetime deletedAt "nullable"
    }

    KHATAENTRY {
        string id PK
        string khataId FK
        string title
        decimal amount
        KhataEntryType type
        datetime entryDate
        string saleId FK "nullable"
        string customerPaymentId FK "nullable, unique"
        string createdById FK
        datetime createdAt
        datetime deletedAt "nullable"
    }

    %% ============================================================
    %% INVENTORY DOMAIN
    %% ============================================================
    INVENTORYITEM {
        string id PK
        string workspaceId FK
        string name
        string sku "nullable"
        string unit "nullable"
        int currentStock
        decimal defaultSellingPrice
        decimal lastPurchasePrice "nullable"
        datetime deletedAt "nullable"
        datetime createdAt
        datetime updatedAt
    }

    %% ============================================================
    %% CUSTOMERS / SALES DOMAIN
    %% ============================================================
    CUSTOMER {
        string id PK
        string workspaceId FK
        string name
        string phoneNumber "nullable"
        string email "nullable"
        string address "nullable"
        decimal outstandingBalance
        datetime createdAt
        datetime updatedAt
        datetime deletedAt "nullable"
    }

    SALE {
        string id PK
        string workspaceId FK
        string customerId FK "nullable"
        string createdById FK
        datetime saleDate
        decimal totalAmount
        PaymentType paymentType
        datetime createdAt
    }

    SALELINEITEM {
        string id PK
        string saleId FK
        string inventoryItemId FK
        int quantity
        decimal sellingPrice
        string productName "point-in-time snapshot"
    }

    CUSTOMERPAYMENT {
        string id PK
        string workspaceId FK
        string customerId FK
        decimal amount
        datetime paymentDate
        string notes "nullable"
        string createdById FK
        datetime createdAt
    }

    %% ============================================================
    %% SUPPLIERS / PURCHASES DOMAIN
    %% ============================================================
    SUPPLIER {
        string id PK
        string workspaceId FK
        string name
        string phoneNumber "nullable"
        string email "nullable"
        string address "nullable"
        decimal outstandingBalance
        datetime createdAt
        datetime updatedAt
        datetime deletedAt "nullable"
    }

    PURCHASE {
        string id PK
        string workspaceId FK
        string supplierId FK "nullable"
        string createdById FK
        datetime purchaseDate
        decimal totalAmount
        PaymentType paymentType
        datetime createdAt
    }

    PURCHASELINEITEM {
        string id PK
        string purchaseId FK
        string inventoryItemId FK
        int quantity
        decimal purchasePrice
        string productName "point-in-time snapshot"
    }

    SUPPLIERPAYMENT {
        string id PK
        string workspaceId FK
        string supplierId FK
        decimal amount
        datetime paymentDate
        string notes "nullable"
        string createdById FK
        datetime createdAt
    }

    %% ============================================================
    %% RELATIONSHIPS — Workspace / Access
    %% ============================================================
    WORKSPACE |o--o{ USER              : "employs"
    USER      ||--o{ WORKSPACE         : "owns"
    WORKSPACE ||--o{ TRANSACTION       : "records"
    USER      ||--o{ TRANSACTION       : "creates"
    WORKSPACE ||--o{ AUDITLOG          : "logs"
    USER      ||--o{ AUDITLOG          : "performs"
    TRANSACTION |o--o{ AUDITLOG        : "logged for"
    KHATA     |o--o{ AUDITLOG          : "logged for"

    %% ============================================================
    %% RELATIONSHIPS — Khata ledger
    %% ============================================================
    WORKSPACE ||--o{ KHATA             : "has"
    CUSTOMER  |o--o{ KHATA             : "linked to"
    USER      ||--o{ KHATA             : "creates"
    KHATA     ||--o{ KHATAENTRY        : "has"
    USER      ||--o{ KHATAENTRY        : "creates"
    SALE      |o--o{ KHATAENTRY        : "generates"
    CUSTOMERPAYMENT |o--o| KHATAENTRY  : "settles"

    %% ============================================================
    %% RELATIONSHIPS — Inventory
    %% ============================================================
    WORKSPACE ||--o{ INVENTORYITEM     : "has"

    %% ============================================================
    %% RELATIONSHIPS — Customers / Sales
    %% ============================================================
    WORKSPACE ||--o{ CUSTOMER          : "has"
    CUSTOMER  |o--o{ SALE              : "places"
    WORKSPACE ||--o{ SALE              : "records"
    USER      ||--o{ SALE              : "creates"
    SALE      ||--o{ SALELINEITEM      : "contains"
    INVENTORYITEM ||--o{ SALELINEITEM  : "sold as"
    WORKSPACE ||--o{ CUSTOMERPAYMENT   : "records"
    CUSTOMER  ||--o{ CUSTOMERPAYMENT   : "makes"
    USER      ||--o{ CUSTOMERPAYMENT   : "records"

    %% ============================================================
    %% RELATIONSHIPS — Suppliers / Purchases
    %% ============================================================
    WORKSPACE ||--o{ SUPPLIER          : "has"
    SUPPLIER  |o--o{ PURCHASE          : "supplies"
    WORKSPACE ||--o{ PURCHASE          : "records"
    USER      ||--o{ PURCHASE          : "creates"
    PURCHASE  ||--o{ PURCHASELINEITEM  : "contains"
    INVENTORYITEM ||--o{ PURCHASELINEITEM : "purchased as"
    WORKSPACE ||--o{ SUPPLIERPAYMENT   : "records"
    SUPPLIER  ||--o{ SUPPLIERPAYMENT   : "receives"
    USER      ||--o{ SUPPLIERPAYMENT   : "records"
